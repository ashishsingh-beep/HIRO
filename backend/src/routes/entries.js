const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authenticateToken = require('../middleware/auth');

// Submit daily entry via Supabase SDK (HTTPS)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('daily_entries')
            .insert([{
                user_id: req.user.id,
                entry_date: req.body.entry_date,
                position: req.body.position,
                role_type: req.body.role_type,
                resumes: parseInt(req.body.resumes),
                shortlisted: parseInt(req.body.shortlisted),
                interviews_scheduled: parseInt(req.body.interviews_scheduled),
                interviews_completed: parseInt(req.body.interviews_completed),
                offers: parseInt(req.body.offers),
                closures: parseInt(req.body.closures)
            }])
            .select()
            .single();

        if (error) throw error;

        // Create notification for Admin
        await supabase
            .from('notifications')
            .insert([{
                recruiter_name: req.user.name,
                message: `${req.user.name} submitted a report for ${req.body.position}`,
                is_read: false,
                type: 'daily_entry',
                target_id: data.id
            }]);

        res.json(data);
    } catch (error) {
        console.error('Entry submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
