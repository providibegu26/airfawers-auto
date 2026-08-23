require('dotenv').config();
const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const authChauffeurRoutes = require('./routes/authChauffeurRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const entretienRoutes = require('./routes/entretienRoutes');
const chauffeurRoutes = require('../routes/chauffeurRoutes');
const { adminCarburantRoutes, chauffeurCarburantRoutes } = require('./routes/carburantRoutes');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

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

app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);
app.use('/api/auth-chauffeur', authChauffeurRoutes);
app.use('/api/admin/vehicules', authenticateToken, requireAdmin, vehiculeRoutes);
app.use('/api/admin/entretiens', authenticateToken, requireAdmin, entretienRoutes);
app.use('/api/chauffeurs', authenticateToken, requireAdmin, chauffeurRoutes);
app.use('/api/admin/carburant', authenticateToken, requireAdmin, adminCarburantRoutes);
app.use('/api/chauffeur/carburant', chauffeurCarburantRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 