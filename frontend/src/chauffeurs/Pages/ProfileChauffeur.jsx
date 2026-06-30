import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faIdCard,
  faCar,
  faSpinner,
  faLock,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { apiPath } from '@/config/api';

const ProfileChauffeur = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChauffeurProfile();
  }, []);

  const fetchChauffeurProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('chauffeurToken');
      
      if (!token) {
        setError('Vous devez être connecté pour voir votre profil.');
        setLoading(false);
        return;
      }

      const response = await fetch(apiPath('/auth/chauffeur/profile'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success && data.chauffeur) {
        setProfile(data.chauffeur);
      } else {
        setError('Erreur lors de la récupération du profil.');
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      setError('Erreur réseau lors de la récupération du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setUploadingPhoto(true);

    try {
      const token = localStorage.getItem('chauffeurToken');
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(apiPath('/chauffeur/profile/photo'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du téléversement');
      }

      setProfile((prev) => ({ ...prev, photoUrl: data.photoUrl }));
    } catch (uploadError) {
      setPhotoError(uploadError.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-2xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">Erreur</p>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600 font-medium">Aucun profil trouvé</p>
          <p className="text-yellow-500">Impossible de récupérer les informations du profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-blue-600" />
        Profil Chauffeur
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar avec icône utilisateur */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`${profile.prenom} ${profile.nom}`}
                  className="h-32 w-32 rounded-full border-4 border-blue-200 object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-blue-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow hover:bg-blue-700 disabled:opacity-50"
                title="Changer la photo"
              >
                {uploadingPhoto ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                ) : (
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            {photoError && (
              <p className="mb-2 text-center text-xs text-red-600">{photoError}</p>
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {profile.prenom} {profile.nom}
            </h2>
            <div className="flex items-center mt-1">
              <FontAwesomeIcon icon={faCar} className="text-gray-400 mr-1" />
              <span className="text-gray-500">Chauffeur</span>
            </div>
            {profile.vehicule && (
              <div className="mt-2 text-sm text-gray-600">
                Véhicule: {profile.vehicule.immatriculation}
              </div>
            )}
          </div>

          {/* Informations du profil */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.nom && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    Nom
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.nom}</p>
                </div>
              )}

              {profile.postnom && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    Postnom
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.postnom}</p>
                </div>
              )}

              {profile.prenom && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    Prénom
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.prenom}</p>
                </div>
              )}

              {profile.user?.email && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                    Email
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.user.email}</p>
                </div>
              )}

              {profile.telephone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                    Téléphone
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.telephone}</p>
                </div>
              )}

              {profile.sexe && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                    Sexe
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {profile.sexe === 'M' ? 'Masculin' : 'Féminin'}
                  </p>
                </div>
              )}

              {profile.statut && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faCar} className="mr-2 text-gray-400" />
                    Statut
                  </h3>
                  <p className="mt-1 text-gray-800">{profile.statut}</p>
                </div>
              )}

              {profile.vehicule && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    <FontAwesomeIcon icon={faCar} className="mr-2 text-gray-400" />
                    Véhicule attribué
                  </h3>
                  <p className="mt-1 text-gray-800">
                    {profile.vehicule.marque} {profile.vehicule.modele} ({profile.vehicule.immatriculation})
                  </p>
                </div>
              )}
            </div>

            {/* Bouton de changement de mot de passe */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Modifier le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={profile?.user?.email}
      />
    </div>
  );
};

export default ProfileChauffeur;
