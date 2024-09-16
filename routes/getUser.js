const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.get('/service', (req, res) => {
    const sqlGetUserservice = `
      SELECT *
      FROM service
    `;
    db.query(sqlGetUserservice, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

router.get('/lieux', (req, res) => {
    const sqlGetUserLieux = `
      SELECT *
      FROM lieux
    `;
    db.query(sqlGetUserLieux, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des lieux :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});


router.get('/', (req, res) => {
    const sqlGetUsersWithService = `
      SELECT 
        utilisateur.ID_utilisateur, 
        utilisateur.nom, 
        service.Nom AS service,
        lieux.lieux AS lieux
      FROM utilisateur
      LEFT JOIN service ON utilisateur.ID_service = service.ID_service
      LEFT JOIN lieux ON utilisateur.ID_lieux = lieux.ID_lieux
    `;
    db.query(sqlGetUsersWithService, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

router.post('/', (req, res) => {
    const { nom, ID_service, ID_lieux } = req.body;
    const sqlCreateUser = `
        INSERT INTO utilisateur (nom, ID_service, ID_lieux) 
        VALUES (?, ?, ?)`;
    db.query(sqlCreateUser, [nom, ID_service, ID_lieux], (error, result) => {
        if (error) {
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Utilisateur créé', ID_utilisateur: result.insertId });
    });
});
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nom, ID_service, ID_lieux } = req.body; 
    const sqlUpdateUser = `
        UPDATE utilisateur 
        SET nom = ?, ID_service = ?, ID_lieux = ? 
        WHERE ID_utilisateur = ?`;
    db.query(sqlUpdateUser, [nom, ID_service, ID_lieux, id], (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur mis à jour' });
    });
});


router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteUser = `
        DELETE FROM utilisateur 
        WHERE ID_utilisateur = ?`;
    db.query(sqlDeleteUser, [id], (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur supprimé' });
    });
});

module.exports = router;