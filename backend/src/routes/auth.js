const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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
        
        if (profile.password !== password) {
            return res.status(401).json({ error: 'Invalid password.' });
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
        const { email, password, name, role } = req.body;
        const id = require('crypto').randomUUID();
        
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ id, email, password, name, role }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, user: data });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists.' });
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

module.exports = router;
