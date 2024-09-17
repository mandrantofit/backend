const express = require('express');
const router = express.Router();
const db = require('../model/database');

// Read (Lecture) - Déjà en place
router.get('/', (req, res) => {
    const sqlGetCategorie = 'SELECT * FROM categorie';
    db.query(sqlGetCategorie, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des catégories :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

// Create (Insertion)
router.post('/', (req, res) => {
    const { type } = req.body;
    const sqlCreateCategorie = 'INSERT INTO categorie (type) VALUES (?)';
    db.query(sqlCreateCategorie, [type], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de la catégorie :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ id: results.insertId, type });
    });
});

// Update (Mise à jour)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const sqlUpdateCategorie = 'UPDATE categorie SET type = ? WHERE ID_categorie = ?';
    db.query(sqlUpdateCategorie, [type, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de la catégorie :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Catégorie mise à jour avec succès' });
        } else {
            res.status(404).json({ error: 'Catégorie non trouvée' });
        }
    });
});

// Delete (Suppression)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteCategorie = 'DELETE FROM categorie WHERE ID_categorie = ?';
    db.query(sqlDeleteCategorie, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression de la catégorie :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Catégorie supprimée avec succès' });
        } else {
            res.status(404).json({ error: 'Catégorie non trouvée' });
        }
    });
});

module.exports = router;
