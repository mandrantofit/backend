const express = require('express');
const router = express.Router();
const db = require('../model/database');

router.post('/', (req, res) => {
    const { modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison } = req.body;
    if (!modele || !marque || !numero_serie || !numero_inventaire || !ID_categorie || !ID_etat || !ID_fournisseur) {
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
        INSERT INTO materiel (modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        db.query(
            sqlInsertMateriel,
            [modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison],
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
    const { modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison } = req.body;
    if (!id || !modele || !marque || !numero_serie || !numero_inventaire || !ID_categorie || !ID_etat || !ID_fournisseur) {
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
            SET modele = ?, marque = ?, numero_serie = ?, numero_inventaire = ?, ID_categorie = ?, ID_etat = ?, ID_fournisseur = ?, bon_de_commande = ?, config = ?, bon_de_livraison = ?
            WHERE ID_materiel = ?
        `;

        db.query(
            sqlUpdateMateriel,
            [modele, marque, numero_serie, numero_inventaire, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison, id],
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
      SELECT marque,modele, COUNT(*) AS non_attribue
      FROM materiel
      WHERE attribution = 'non'
      GROUP BY modele
    `;

    db.query(sqlGetMaterielNonAttribue, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des matériels non attribués :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json(results);
    });
});

module.exports = router;