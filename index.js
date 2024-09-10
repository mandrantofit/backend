const express = require('express');
const cors = require('cors');
const app = express();

const materiel = require('./routes/materiel'); 
const login = require('./routes/login');
const affectation = require('./routes/affectation');
const getCategorie = require('./routes/getCategorie');
const getEtat = require('./routes/getEtat');
const getUser = require('./routes/getUser');
const getFournisseur = require('./routes/getFournisseur');

app.use(express.json());
app.use(cors());
app.use('/materiel', materiel);
app.use('/login', login);
app.use('/affectation', affectation);
app.use('/getCategorie', getCategorie);
app.use('/getEtat', getEtat);
app.use('/getUser', getUser);
app.use('/getFournisseur', getFournisseur);

app.listen(8000, () => {
  console.log('Server started on port 8000');
});