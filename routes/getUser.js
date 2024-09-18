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

// Route pour ajouter un nouveau service
router.post('/service', (req, res) => {
    const { Nom } = req.body;
    const sqlAddService = `
      INSERT INTO service (Nom)
      VALUES (?)
    `;
    db.query(sqlAddService, [Nom], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'ajout du service :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Service ajouté avec succès', ID_service: results.insertId });
    });
});

// Route pour mettre à jour un service par son ID
router.put('/service/:id', (req, res) => {
    const { id } = req.params;
    const { Nom } = req.body;
    const sqlUpdateService = `
      UPDATE service
      SET Nom = ?
      WHERE ID_service = ?
    `;
    db.query(sqlUpdateService, [Nom, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du service :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Service non trouvé' });
        }
        res.status(200).json({ message: 'Service mis à jour avec succès' });
    });
});

// Route pour supprimer un service par son ID
router.delete('/service/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteService = `
      DELETE FROM service
      WHERE ID_service = ?
    `;
    db.query(sqlDeleteService, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du service :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Service non trouvé' });
        }
        res.status(200).json({ message: 'Service supprimé avec succès' });
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

router.post('/lieux', (req, res) => {
    const { lieux } = req.body;
    const sqlAddLieux = `
      INSERT INTO lieux (lieux)
      VALUES (?)
    `;
    db.query(sqlAddLieux, [lieux], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'ajout du lieu :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Lieu ajouté avec succès', id: results.insertId });
    });
});

router.put('/lieux/:id', (req, res) => {
    const { id } = req.params;
    const { lieux } = req.body;
    const sqlUpdateLieux = `
      UPDATE lieux
      SET lieux = ?
      WHERE ID_lieux = ?
    `;
    db.query(sqlUpdateLieux, [lieux, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du lieu :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Lieu non trouvé' });
        }
        res.status(200).json({ message: 'Lieu mis à jour avec succès' });
    });
});

router.delete('/lieux/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteLieux = `
      DELETE FROM lieux
      WHERE ID_lieux = ?
    `;
    db.query(sqlDeleteLieux, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du lieu :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Lieu non trouvé' });
        }
        res.status(200).json({ message: 'Lieu supprimé avec succès' });
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