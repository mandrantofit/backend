const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.get('/', (req, res) => {
    const sqlGetUser = `
      SELECT * FROM utilisateur`;
    db.query(sqlGetUser, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des ustilisateurs :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

module.exports = router;