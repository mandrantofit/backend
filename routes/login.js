const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../model/database');
//urre fzde uqvl ovsd  mot de passe d application
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

            // Inclure le type d'utilisateur dans le payload du token
            const token = jwt.sign({
                id: user.ID_logUser,
                email: user.email,
                type: user.type // Assure-toi que le champ `type` existe dans ta base de données
            }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ token, email: user.email, type: user.type });
        });
    });
});
router.get('/', (req, res) => {
    db.query('SELECT * FROM log_user', (error, results) => { //  WHERE type = "user"
        if (error) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

router.post('/ajout', (req, res) => {
    const { email, password, type } = req.body;

    // Vérification de la présence de l'email dans la base de données
    db.query('SELECT * FROM log_user WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

        // Hachage du mot de passe
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            // Insertion de l'utilisateur avec email, hash du mot de passe et type
            db.query('INSERT INTO log_user (email, password_hash, type) VALUES (?, ?, ?)', [email, hash, type || 'user'], (error, results) => {
                if (error) return res.status(500).json({ error: 'Database error' });
                res.status(201).json({ message: 'User created successfully' });
            });
        });
    });
});

router.put('/:id', (req, res) => {
    const { email, password, type } = req.body;
    const userId = req.params.id;

    // Construction de la requête de mise à jour
    let query = 'UPDATE log_user SET email = ?, type = ?';
    const queryParams = [email, type];

    if (password) {
        // Hachage du mot de passe s'il est fourni
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            query += ', password_hash = ? WHERE ID_logUser = ?';
            queryParams.push(hash, userId);

            db.query(query, queryParams, (error, results) => {
                if (error) return res.status(500).json({ error: 'Database error' });
                res.json({ message: 'User updated successfully' });
            });
        });
    } else {
        // Mise à jour sans changement du mot de passe
        query += ' WHERE ID_logUser = ?';
        queryParams.push(userId);

        db.query(query, queryParams, (error, results) => {
            if (error) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'User updated successfully' });
        });
    }
});


// Route pour supprimer un utilisateur
router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    db.query('DELETE FROM log_user WHERE ID_logUser = ?', [userId], (error, results) => {
        if (error) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'User deleted successfully' });
    });
});


module.exports = router;