const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../model/database');

const JWT_SECRET = 'adminplus';
router.post('/', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM log_user WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
            const token = jwt.sign({ id: user.ID_logUser, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });

});

module.exports = router;