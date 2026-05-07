const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const authenticateToken = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_hiro_key';

// Login (Local Auth - using the profiles table via Supabase SDK)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !profile) {
            return res.status(401).json({ error: 'User not found or database error.' });
        }
        
        let isPasswordCorrect = false;
        if (profile.password && (profile.password.startsWith('$2a$') || profile.password.startsWith('$2b$'))) {
            isPasswordCorrect = await bcrypt.compare(password, profile.password);
        } else {
            isPasswordCorrect = profile.password === password;
        }

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        // Validate account status for recruiters
        if (profile.role === 'recruiter' && profile.status !== 'approved') {
            if (profile.status === 'pending') {
                return res.status(403).json({ error: 'Your account is pending approval by the HR Manager.' });
            }
            if (profile.status === 'rejected') {
                return res.status(403).json({ error: 'Your account registration has been rejected or suspended.' });
            }
        }
        
        const token = jwt.sign({ id: profile.id, role: profile.role, name: profile.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: profile });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Signup (Local Auth)
router.post('/signup', async (req, res) => {
    try {
        let { email, password, name, role } = req.body;
        
        const validationErrors = {};

        // 1. Sanitize & Validate Name
        name = typeof name === 'string' ? name.trim().replace(/<[^>]*>/g, '') : '';
        if (!name) {
            validationErrors.name = 'Full name is required';
        } else if (!/^[A-Za-z\s]+$/.test(name)) {
            validationErrors.name = 'Name must contain only letters';
        } else if (name.length < 3 || name.length > 50) {
            validationErrors.name = 'Name must be between 3 and 50 characters';
        }

        // 2. Sanitize & Validate Email
        email = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!email) {
            validationErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                validationErrors.email = 'Enter a valid email address';
            }
        }

        // 3. Validate Password
        if (!password) {
            validationErrors.password = 'Password is required';
        } else {
            if (password.length < 8) {
                validationErrors.password = 'Password must be at least 8 characters';
            } else {
                const hasUppercase = /[A-Z]/.test(password);
                const hasLowercase = /[a-z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecial = /[^A-Za-z0-9]/.test(password);
                if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
                    validationErrors.password = 'Password must include uppercase, lowercase, number, and special character';
                }
            }
        }

        // 4. Validate Role
        if (!role) {
            validationErrors.role = 'Please select a role';
        } else if (!['recruiter', 'admin'].includes(role)) {
            validationErrors.role = 'Please select a role';
        }

        // Check if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        // 5. Check for Duplicate Email
        const { data: existingUser, error: emailCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                errors: { email: 'Email already exists' },
                error: 'Email already exists' 
            });
        }

        // 6. Restriction: Only one HR Manager (Admin) allowed
        if (role === 'admin') {
            const { data: existingAdmin, error: adminCheckError } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(1);
            
            if (existingAdmin && existingAdmin.length > 0) {
                return res.status(403).json({ success: false, error: 'An HR Manager already exists. Only one admin is allowed.' });
            }
        }

        // 7. Secure Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const id = require('crypto').randomUUID();
        const status = role === 'admin' ? 'approved' : 'pending';
        
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ id, email, password: hashedPassword, name, role, status }])
            .select()
            .single();
        
        if (error) throw error;

        // Create automated notification for Admin about new recruiter request
        if (role === 'recruiter') {
            await supabase
                .from('notifications')
                .insert([{
                    recruiter_name: name,
                    message: `New recruiter registration request: ${name} (${email})`,
                    is_read: false,
                    type: 'recruiter_signup',
                    target_id: id
                }]);
        }
        
        res.json({ success: true, user: data });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, name, role, created_at')
            .eq('id', req.user.id)
            .single();
        
        if (error || !profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch user statistics
        const { count, error: countError } = await supabase
            .from('daily_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id);
        
        res.json({ 
            ...profile, 
            stats: {
                total_reports: count || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update current profile
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({ name, email })
            .eq('id', req.user.id)
            .select('id, email, name, role, created_at')
            .single();
            
        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
            throw error;
        }
        
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if an admin already exists
router.get('/admin-exists', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1);
        
        if (error) throw error;
        res.json({ exists: data && data.length > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all recruiters (Admin only)
router.get('/recruiters', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Administrators only.' });
        }
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, name, role, status, created_at')
            .eq('role', 'recruiter')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Fetch recruiters error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Approve or reject a recruiter (Admin only)
router.put('/recruiters/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Administrators only.' });
        }
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', id)
            .select('id, email, name, role, status')
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
