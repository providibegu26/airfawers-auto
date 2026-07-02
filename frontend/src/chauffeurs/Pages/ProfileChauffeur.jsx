import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCar,
  FaSpinner,
  FaLock,
  FaCamera,
  FaIdBadge,
  FaShieldAlt,
} from "react-icons/fa";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import { apiPath } from "@/config/api";

function InfoTile({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

const ProfileChauffeur = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChauffeurProfile();
  }, []);

  const fetchChauffeurProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("chauffeurToken");

      if (!token) {
        setError("Vous devez être connecté pour voir votre profil.");
        setLoading(false);
        return;
      }

      const response = await fetch(apiPath("/auth/chauffeur/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success && data.chauffeur) {
        setProfile(data.chauffeur);
      } else {
        setError("Erreur lors de la récupération du profil.");
      }
    } catch (err) {
      console.error("Erreur récupération profil:", err);
      setError("Erreur réseau lors de la récupération du profil.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);

    try {
      const token = localStorage.getItem("chauffeurToken");
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(apiPath("/chauffeur/profile/photo"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du téléversement");
      }

      setProfile((prev) => ({ ...prev, photoUrl: data.photoUrl }));
    } catch (uploadError) {
      setPhotoError(uploadError.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-2">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">Erreur</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-700">Aucun profil trouvé</p>
        </div>
      </div>
    );
  }

  const sexeLabel =
    profile.sexe === "M"
      ? "Masculin"
      : profile.sexe === "F"
        ? "Féminin"
        : profile.sexe;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-1 sm:px-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-28 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 sm:h-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>

        <div className="relative px-4 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={`${profile.prenom} ${profile.nom}`}
                    className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 shadow-lg sm:h-28 sm:w-28">
                    <FaUser className="h-10 w-10 text-blue-600" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 rounded-xl bg-blue-600 p-2 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                  title="Changer la photo"
                >
                  {uploadingPhoto ? (
                    <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FaCamera className="h-3.5 w-3.5" />
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
              <div className="pb-1">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {profile.prenom} {profile.nom}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    <FaIdBadge className="h-3 w-3" />
                    Chauffeur
                  </span>
                  {profile.statut && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {profile.statut}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {photoError && (
            <p className="mt-3 text-sm text-red-600">{photoError}</p>
          )}

          {profile.vehicule && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <FaCar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                    Véhicule attribué
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {profile.vehicule.marque} {profile.vehicule.modele}
                  </p>
                  <p className="text-sm text-slate-600">
                    {profile.vehicule.immatriculation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile icon={FaUser} label="Nom" value={profile.nom} />
        <InfoTile icon={FaUser} label="Postnom" value={profile.postnom} />
        <InfoTile icon={FaUser} label="Prénom" value={profile.prenom} />
        <InfoTile icon={FaEnvelope} label="Email" value={profile.user?.email} />
        <InfoTile icon={FaPhone} label="Téléphone" value={profile.telephone} />
        <InfoTile icon={FaUser} label="Sexe" value={sexeLabel} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FaShieldAlt className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Sécurité du compte</p>
              <p className="text-sm text-slate-500">
                Modifiez votre mot de passe par email de vérification.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <FaLock className="h-3.5 w-3.5" />
            Modifier le mot de passe
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={profile?.user?.email}
      />
    </div>
  );
};

export default ProfileChauffeur;
