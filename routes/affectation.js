// routes/affectation.js
const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.post('/', async (req, res) => {
    const { ID_utilisateur, ID_materiel } = req.body;

    try {
        // Modifier l'attribution du matériel
        await db.query(
            'UPDATE materiel SET attribution = ? WHERE ID_materiel = ?',
            ['oui', ID_materiel]
        );

        // Créer une nouvelle affectation
        await db.query(
            'INSERT INTO affectation (ID_utilisateur, ID_materiel) VALUES (?, ?)',
            [ID_utilisateur, ID_materiel]
        );

        res.status(201).json({ message: 'Affectation créée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la création de l\'affectation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Obtenir l'ID du matériel associé à l'affectation
    db.query(
        'SELECT ID_materiel FROM affectation WHERE ID_affectation = ?',
        [id],
        (error, result) => {
            if (error) {
                console.error('Erreur lors de la récupération du matériel associé à l\'affectation:', error);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Affectation non trouvée' });
            }

            const ID_materiel = result[0].ID_materiel;

            // Réinitialiser l'attribution du matériel à 'non'
            db.query(
                'UPDATE materiel SET attribution = ? WHERE ID_materiel = ?',
                ['non', ID_materiel],
                (error) => {
                    if (error) {
                        console.error('Erreur lors de la réinitialisation de l\'attribution du matériel:', error);
                        return res.status(500).json({ error: 'Erreur serveur' });
                    }

                    // Supprimer l'affectation
                    db.query(
                        'DELETE FROM affectation WHERE ID_affectation = ?',
                        [id],
                        (error) => {
                            if (error) {
                                console.error('Erreur lors de la suppression de l\'affectation:', error);
                                return res.status(500).json({ error: 'Erreur serveur' });
                            }

                            res.status(200).json({ message: 'Affectation supprimée avec succès' });
                        }
                    );
                }
            );
        }
    );
});

router.get('/', (req, res) => {
    const sqlGetAffectation = `
      SELECT * FROM affectation`;
    db.query(sqlGetAffectation, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des affectation :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

module.exports = router;
