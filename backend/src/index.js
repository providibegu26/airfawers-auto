require('dotenv').config();
const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const authChauffeurRoutes = require('./routes/authChauffeurRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const entretienRoutes = require('./routes/entretienRoutes');
const chauffeurRoutes = require('../routes/chauffeurRoutes');
const carburantRoutes = require('./routes/carburantRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/', (req, res) => {
  res.json({ 
    message: 'Serveur Airfawers Auto démarré avec succès',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Route de test pour l'API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API accessible',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Routes

app.use('/api/admin', adminRoutes);
app.use('/api/auth-chauffeur', authChauffeurRoutes);
app.use('/api/admin/vehicules', vehiculeRoutes);
app.use('/api/admin/entretiens', entretienRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/admin/carburant', carburantRoutes);
app.use('/api/chauffeur/carburant', carburantRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 