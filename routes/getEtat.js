const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.get('/', (req, res) => {
    const sqlGetEtat = `
      SELECT * FROM etat`;
    db.query(sqlGetEtat, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des etat :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

module.exports = router;