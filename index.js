const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1', //172.25.52.205
  user: 'root', //cpadmin
  password: '', //adminplus
  database: 'stock', //stock
});

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'adminplus'; // Change this to a strong secret

// Route to handle login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.query('SELECT * FROM log_user WHERE email = ?', [email], (error, results) => {
    if (error) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      // Generate JWT token
      const token = jwt.sign({ id: user.ID_logUser, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    });
  });
  
});

// Route pour créer un nouveau matériel
app.post('/materiel', (req, res) => {
  const { modele, marque, numero_serie, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison } = req.body;

  // Valider les données d'entrée
  if (!modele || !marque || !numero_serie || !ID_categorie || !ID_etat || !ID_fournisseur) {
    return res.status(400).json({ error: 'Veuillez fournir toutes les informations requises' });
  }

  // Vérifier si le numéro de série existe déjà
  const sqlCheckNumeroSerie = 'SELECT * FROM materiel WHERE numero_serie = ?';
  pool.query(sqlCheckNumeroSerie, [numero_serie], (error, results) => {
    if (error) {
      console.error('Erreur lors de la vérification du numéro de série :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length > 0) {
      // Le numéro de série existe déjà
      return res.status(400).json({ error: 'Le numéro de série existe déjà.' });
    }

    // Insérer le nouveau matériel dans la table `materiel`
    const sqlInsertMateriel = `
      INSERT INTO materiel (modele, marque, numero_serie, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    pool.query(
      sqlInsertMateriel,
      [modele, marque, numero_serie, ID_categorie, ID_etat, ID_fournisseur, bon_de_commande, config, bon_de_livraison],
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

app.get('/materiel', (req, res) => {
  const sqlGetMateriel = `
    SELECT 
      materiel.ID_materiel,
      materiel.modele,
      materiel.marque,
      materiel.numero_serie,
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
  
  pool.query(sqlGetMateriel, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des matériels :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(200).json(results);
  });
});


app.get('/materiel/inventaire', (req, res) => {
  const sqlGetMaterielNonAttribue = `
    SELECT modele, COUNT(*) AS non_attribue
    FROM materiel
    WHERE attribution = 'non'
    GROUP BY modele
  `;
  
  pool.query(sqlGetMaterielNonAttribue, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des matériels non attribués :', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(200).json(results);
  });
});


// Start the server
app.listen(8000, () => {
  console.log('Server started on port 8000');
});
