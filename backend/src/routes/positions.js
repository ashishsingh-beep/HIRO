const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get active positions
router.get('/', async (req, res) => {
    try {
        const positions = await prisma.position.findMany({ where: { is_active: true } });
        res.json(positions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add new position
router.post('/', async (req, res) => {
    try {
        const { name, department } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const trimmedName = name.trim();
        
        // Check for existing position case-insensitively
        const existing = await prisma.position.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: 'insensitive'
                }
            }
        });

        if (existing) {
            // If it exists, just return it as if success
            return res.status(200).json(existing);
        }

        const position = await prisma.position.create({
            data: {
                name: trimmedName,
                department: (department || 'General').trim(),
                is_active: true
            }
        });
        res.status(201).json(position);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
