import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchVehicles } from '../services/maintenanceService';

const MaintenanceContext = createContext();

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Charger les véhicules
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesData = await fetchVehicles();
      setVehicles(vehiclesData);
      setLastUpdate(new Date());
      console.log('🔄 Données de maintenance rechargées:', vehiclesData.length, 'véhicules');
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur chargement véhicules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Forcer le rechargement des données
  const refreshData = async () => {
    console.log('🔄 Forçage du rechargement des données...');
    await loadVehicles();
  };

  // Charger les données au montage
  useEffect(() => {
    loadVehicles();
  }, []);

  const value = {
    vehicles,
    loading,
    error,
    lastUpdate,
    refreshData,
    loadVehicles
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
}; 