const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.post('/', (req, res) => {
    const { code, modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison } = req.body;
    if (!code || !modele || !marque || !numero_serie || !numero_inventaire || !ID_categorie || !ID_etat || !ID_fournisseur) {
        return res.status(400).json({ error: 'Veuillez fournir toutes les informations requises' });
    }
    const sqlCheckNumeroSerie = 'SELECT * FROM materiel WHERE numero_serie = ?';
    db.query(sqlCheckNumeroSerie, [numero_serie], (error, results) => {
        if (error) {
            console.error('Erreur lors de la vérification du numéro de série :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Le numéro de série existe déjà.' });
        }
        const sqlInsertMateriel = `
        INSERT INTO materiel (code, modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        db.query(
            sqlInsertMateriel,
            [code, modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison],
            (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'insertion du matériel :', error);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }
                res.status(201).json({ message: 'Matériel ajouté avec succès', materielId: results.insertId });
            }
        );
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { code , modele , marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison } = req.body;
    if (!id || !code|| !modele || !marque || !numero_serie || !numero_inventaire || !ID_categorie || !ID_etat || !ID_fournisseur) {
        return res.status(400).json({ error: 'Veuillez fournir toutes les informations requises' });
    }
    const sqlCheckNumeroSerie = 'SELECT * FROM materiel WHERE numero_serie = ? AND ID_materiel != ?';
    db.query(sqlCheckNumeroSerie, [numero_serie, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la vérification du numéro de série :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Le numéro de série existe déjà pour un autre matériel.' });
        }
        const sqlUpdateMateriel = `
            UPDATE materiel
            SET code = ?, modele = ?, marque = ?, numero_serie = ?, numero_inventaire = ?, ID_categorie = ?, ID_etat = ?, ID_fournisseur = ?, bon_de_commande = ?, config = ?, bon_de_livraison = ?
            WHERE ID_materiel = ?
        `;

        db.query(
            sqlUpdateMateriel,
            [code, modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison, id],
            (error, results) => {
                if (error) {
                    console.error('Erreur lors de la mise à jour du matériel :', error);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }
                res.status(200).json({ message: 'Matériel mis à jour avec succès' });
            }
        );
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID du matériel requis' });
    }
    const sqlDeleteMateriel = 'DELETE FROM materiel WHERE ID_materiel = ?';

    db.query(sqlDeleteMateriel, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du matériel :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Matériel non trouvé' });
        }
        res.status(200).json({ message: 'Matériel supprimé avec succès' });
    });
});



router.get('/', (req, res) => {
    const sqlGetMateriel = `
      SELECT 
        materiel.ID_materiel,
        materiel.code,
        materiel.modele,
        materiel.marque,
        materiel.numero_serie,
        materiel.numero_inventaire,
        categorie.type AS type,
        etat.description AS etat,
        fournisseur.nom AS fournisseur,
        materiel.bon_de_commande,
        materiel.config,
        materiel.bon_de_livraison,
        materiel.attribution
      FROM materiel
      LEFT JOIN categorie ON materiel.ID_categorie = categorie.ID_categorie
      LEFT JOIN etat ON materiel.ID_etat = etat.ID_etat
      LEFT JOIN fournisseur ON materiel.ID_fournisseur = fournisseur.ID_fournisseur
    `;

    db.query(sqlGetMateriel, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des matériels :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

router.get('/non_attribue', (req, res) => {
    const sqlGetMateriel = `
      SELECT 
    materiel.ID_materiel,
    materiel.code,    
    materiel.modele,
    materiel.marque,
    materiel.numero_serie,
    materiel.numero_inventaire,
    categorie.type AS type,
    etat.description AS etat,
    fournisseur.nom AS fournisseur,
    materiel.bon_de_commande,
    materiel.config,
    materiel.bon_de_livraison,
    materiel.attribution
FROM materiel
LEFT JOIN categorie ON materiel.ID_categorie = categorie.ID_categorie
LEFT JOIN etat ON materiel.ID_etat = etat.ID_etat
LEFT JOIN fournisseur ON materiel.ID_fournisseur = fournisseur.ID_fournisseur
WHERE materiel.attribution = 'non';

    `;

    db.query(sqlGetMateriel, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des matériels :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

router.get('/inventaire', (req, res) => {
    const sqlGetMaterielNonAttribue = `
      SELECT code,marque, COUNT(*) AS non_attribue
      FROM materiel
      WHERE attribution = 'non'
      GROUP BY code
    `;

    db.query(sqlGetMaterielNonAttribue, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des matériels non attribués :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

router.get('/marque', (req, res) => {
    const sqlGetMarque = 'SELECT * FROM possibilite_Marque';
    db.query(sqlGetMarque, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des Marques possibile :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.post('/marque', (req, res) => {
    const { marque } = req.body;
    const sqlCreateMarque = 'INSERT INTO possibilite_Marque (marque) VALUES (?)';
    db.query(sqlCreateMarque, [marque], (error, results) => {
        if (error) {
            console.error('Erreur lors de la création de la marque :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Marque créée avec succès', id: results.insertId });
    });
});

router.put('/marque/:id', (req, res) => {
    const { id } = req.params;
    const { marque } = req.body;
    const sqlUpdateMarque = 'UPDATE possibilite_Marque SET marque = ? WHERE ID_marque = ?';
    db.query(sqlUpdateMarque, [marque, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de la marque :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Marque non trouvée' });
        }
        res.status(200).json({ message: 'Marque mise à jour avec succès' });
    });router.delete('/modele/:id', (req, res) => {
        const { id } = req.params;
        const sqlDeleteModele = 'DELETE FROM possibilite_Modele WHERE ID_modele = ?';
        db.query(sqlDeleteModele, [id], (error, results) => {
            if (error) {
                console.error('Erreur lors de la suppression du modèle :', error);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Modèle non trouvé' });
            }
            res.status(200).json({ message: 'Modèle supprimé avec succès' });
        });
    });
    
});

router.delete('/marque/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteMarque = 'DELETE FROM possibilite_Marque WHERE ID_marque = ?';
    db.query(sqlDeleteMarque, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression de la marque :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Marque non trouvée' });
        }
        res.status(200).json({ message: 'Marque supprimée avec succès' });
    });
});


router.get('/modele', (req, res) => {
    const sqlGetModele = 'SELECT * FROM possibilite_Modele';
    db.query(sqlGetModele, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des Modèles possibile :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.post('/modele', (req, res) => {
    const { modele } = req.body;
    const sqlCreateModele = 'INSERT INTO possibilite_Modele (modele) VALUES (?)';
    db.query(sqlCreateModele, [modele], (error, results) => {
        if (error) {
            console.error('Erreur lors de la création du modèle :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: 'Modèle créé avec succès', id: results.insertId });
    });
});

router.put('/modele/:id', (req, res) => {
    const { id } = req.params;
    const { modele } = req.body;
    const sqlUpdateModele = 'UPDATE possibilite_Modele SET modele = ? WHERE ID_modele = ?';
    db.query(sqlUpdateModele, [modele, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du modèle :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Modèle non trouvé' });
        }
        res.status(200).json({ message: 'Modèle mis à jour avec succès' });
    });
});

router.delete('/modele/:id', (req, res) => {
    const { id } = req.params;
    const sqlDeleteModele = 'DELETE FROM possibilite_Modele WHERE ID_modele = ?';
    db.query(sqlDeleteModele, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du modèle :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Modèle non trouvé' });
        }
        res.status(200).json({ message: 'Modèle supprimé avec succès' });
    });
});

module.exports = router;