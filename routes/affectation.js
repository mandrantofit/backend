// routes/affectation.js
const express = require('express');
const router = express.Router();
const db = require('../model/database');
const { format } = require('date-fns');

// Fonction pour formater les dates au format 'aaaa-mm-jj hh:mm:ss'
const formatDate = (date) => {
    return format(new Date(date), 'yyyy-MM-dd ');
};


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
SELECT a.ID_affectation, a.ID_materiel, a.ID_utilisateur, a.date_affectation, 
       m.numero_inventaire, 
       CONCAT(m.marque, ' - ', m.modele) AS modele,
       CONCAT(u.nom, ' - ', s.Nom, ' - ', l.lieux) AS utilisateur_nom
FROM affectation a
JOIN materiel m ON a.ID_materiel = m.ID_materiel
JOIN utilisateur u ON a.ID_utilisateur = u.ID_utilisateur
LEFT JOIN service s ON u.ID_service = s.ID_service
LEFT JOIN lieux l ON u.ID_lieux = l.ID_lieux;


    `;

    db.query(sqlGetAffectation, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des affectations :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        // Formater la date avant de renvoyer les résultats
        const formattedResults = results.map(result => ({
            ...result,
            date_affectation: formatDate(result.date_affectation)
        }));

        res.status(200).json(formattedResults);
    });
});


router.get('/historique', (req, res) => {
    const sqlGetHistorique = `
        SELECT h.ID_historique, h.ID_affectation, h.ID_materiel, h.ID_utilisateur, 
       h.date_affectation, h.date_suppression, 
       m.numero_inventaire, 
       CONCAT(m.marque, ' - ', m.modele) AS modele,
       CONCAT(u.nom, ' - ', s.Nom, ' - ', l.lieux) AS utilisateur_nom
FROM historique h
JOIN materiel m ON h.ID_materiel = m.ID_materiel
JOIN utilisateur u ON h.ID_utilisateur = u.ID_utilisateur
LEFT JOIN service s ON u.ID_service = s.ID_service
LEFT JOIN lieux l ON u.ID_lieux = l.ID_lieux;

    `;

    db.query(sqlGetHistorique, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'historique des affectations :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        // Formater les dates avant de renvoyer les résultats
        const formattedResults = results.map(result => ({
            ...result,
            date_affectation: formatDate(result.date_affectation),
            date_suppression: formatDate(result.date_suppression)
        }));

        res.status(200).json(formattedResults);
    });
});



router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { ID_utilisateur, ID_materiel } = req.body;

    // Vérifier si l'affectation existe
    db.query(
        'SELECT * FROM affectation WHERE ID_affectation = ?',
        [id],
        (error, affectation) => {
            if (error) {
                console.error('Erreur lors de la vérification de l\'affectation:', error);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (affectation.length === 0) {
                return res.status(404).json({ error: 'Affectation non trouvée' });
            }

            // Mettre à jour l'attribution du matériel précédent si nécessaire
            if (affectation[0].ID_materiel !== ID_materiel) {
                db.query(
                    'UPDATE materiel SET attribution = ? WHERE ID_materiel = ?',
                    ['non', affectation[0].ID_materiel],
                    (error) => {
                        if (error) {
                            console.error('Erreur lors de la réinitialisation de l\'attribution du matériel précédent:', error);
                            return res.status(500).json({ error: 'Erreur serveur' });
                        }

                        // Mettre à jour l'attribution du matériel actuel
                        db.query(
                            'UPDATE materiel SET attribution = ? WHERE ID_materiel = ?',
                            ['oui', ID_materiel],
                            (error) => {
                                if (error) {
                                    console.error('Erreur lors de la mise à jour de l\'attribution du matériel actuel:', error);
                                    return res.status(500).json({ error: 'Erreur serveur' });
                                }

                                // Mettre à jour l'affectation
                                db.query(
                                    'UPDATE affectation SET ID_utilisateur = ?, ID_materiel = ? WHERE ID_affectation = ?',
                                    [ID_utilisateur, ID_materiel, id],
                                    (error) => {
                                        if (error) {
                                            console.error('Erreur lors de la mise à jour de l\'affectation:', error);
                                            return res.status(500).json({ error: 'Erreur serveur' });
                                        }

                                        res.status(200).json({ message: 'Affectation mise à jour avec succès' });
                                    }
                                );
                            }
                        );
                    }
                );
            } else {
                // Mettre à jour l'affectation si le matériel reste le même
                db.query(
                    'UPDATE affectation SET ID_utilisateur = ? WHERE ID_affectation = ?',
                    [ID_utilisateur, id],
                    (error) => {
                        if (error) {
                            console.error('Erreur lors de la mise à jour de l\'affectation:', error);
                            return res.status(500).json({ error: 'Erreur serveur' });
                        }

                        res.status(200).json({ message: 'Affectation mise à jour avec succès' });
                    }
                );
            }
        }
    );
});

module.exports = router;
