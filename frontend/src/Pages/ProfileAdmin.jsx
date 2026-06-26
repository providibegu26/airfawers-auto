import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const ProfileAdmin = () => {
  const profile = {
    email: 'airfawersauto@gmail.com',
    role: 'Administrateur Système'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-indigo-600" />
        Profil Administrateur
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar avec icône utilisateur */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200">
                <FontAwesomeIcon icon={faUser} className="text-4xl text-indigo-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Administrateur</h2>
            <div className="flex items-center mt-1">
              <FontAwesomeIcon icon={faShieldAlt} className="text-gray-400 mr-1" />
              <span className="text-gray-500">{profile.role}</span>
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                  Email de connexion
                </h3>
                <p className="mt-1 text-gray-800">{profile.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                  Rôle
                </h3>
                <p className="mt-1 text-gray-800">{profile.role}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-gray-400" />
                  Accès
                </h3>
                <p className="mt-1 text-gray-800">Accès complet à toutes les fonctionnalités</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;