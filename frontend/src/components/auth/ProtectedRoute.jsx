import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (role === 'admin') {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        console.log('🔐 Vérification auth admin:', { adminToken: !!adminToken, adminUser: !!adminUser });
        
        if (adminToken && adminUser) {
          try {
            const userData = JSON.parse(adminUser);
            if (userData.role === 'admin') {
              setIsAuthenticated(true);
              console.log('✅ Admin authentifié:', userData.email);
            } else {
              console.log('❌ Rôle incorrect:', userData.role);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.log('❌ Erreur parsing user data:', error);
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ Token ou user manquant');
          setIsAuthenticated(false);
        }
      } else if (role === 'chauffeur') {
        const chauffeurToken = localStorage.getItem('chauffeurToken');
        const chauffeurUser = localStorage.getItem('chauffeurUser');
        
        console.log('🔐 Vérification auth chauffeur:', { chauffeurToken: !!chauffeurToken, chauffeurUser: !!chauffeurUser });
        
        if (chauffeurToken && chauffeurUser) {
          try {
            const userData = JSON.parse(chauffeurUser);
            if (userData.role === 'chauffeur') {
              setIsAuthenticated(true);
              console.log('✅ Chauffeur authentifié:', userData.email);
            } else {
              console.log('❌ Rôle incorrect:', userData.role);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.log('❌ Erreur parsing user data:', error);
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ Token ou user manquant');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log(`🚫 Accès refusé pour le rôle: ${role}`);
    // Rediriger vers la page de connexion appropriée
    if (role === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else if (role === 'chauffeur') {
      return <Navigate to="/chauffeur/login" replace />;
    }
  }

  console.log(`✅ Accès autorisé pour le rôle: ${role}`);
  return children;
};

export default ProtectedRoute;

