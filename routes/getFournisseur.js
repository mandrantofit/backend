const express = require('express');
const router = express.Router();
const db = require('../model/database');

// Read (Lecture) - Récupérer tous les fournisseurs
router.get('/', (req, res) => {
    const sqlGetFournisseur = 'SELECT * FROM fournisseur';
    db.query(sqlGetFournisseur, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des fournisseurs :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

// Create (Insertion) - Ajouter un nouveau fournisseur
router.post('/', (req, res) => {
    const { nom } = req.body;
    const sqlCreateFournisseur = 'INSERT INTO fournisseur (nom) VALUES (?)';
    db.query(sqlCreateFournisseur, [nom], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du fournisseur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ id: results.insertId, nom });
    });
});

// Update (Mise à jour) - Mettre à jour un fournisseur existant
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nom } = req.body;
    const sqlUpdateFournisseur = 'UPDATE fournisseur SET nom = ? WHERE ID_fournisseur = ?';
    db.query(sqlUpdateFournisseur, [nom, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du fournisseur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Fournisseur mis à jour avec succès' });
        } else {
            res.status(404).json({ error: 'Fournisseur non trouvé' });
        }
    });
});

// Delete (Suppression) - Supprimer un fournisseur par ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteFournisseur = 'DELETE FROM fournisseur WHERE ID_fournisseur = ?';
    db.query(sqlDeleteFournisseur, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du fournisseur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
        } else {
            res.status(404).json({ error: 'Fournisseur non trouvé' });
        }
    });
});

module.exports = router;
