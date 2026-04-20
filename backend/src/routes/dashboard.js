const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();

// Dashboard Metrics (Admin only)
router.get('/metrics', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
        const positionFilter = req.query.position;
        const whereClause = {};
        if (positionFilter && positionFilter !== 'all') {
            whereClause.position = positionFilter;
        }

        const entries = await prisma.dailyEntry.findMany({
            where: whereClause,
            include: {
                profile: { select: { name: true } }
            }
        });
        
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
