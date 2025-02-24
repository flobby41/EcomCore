const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Login admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // ⚠️ À adapter selon votre système
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Identifiants invalides' });
    }
});

module.exports = router; 