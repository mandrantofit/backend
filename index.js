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

// Start the server
app.listen(8000, () => {
  console.log('Server started on port 8000');
});
