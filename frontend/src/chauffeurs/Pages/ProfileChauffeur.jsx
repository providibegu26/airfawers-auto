import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaBell,
  FaCamera,
  FaCar,
  FaSpinner,
  FaIdCard,
} from "react-icons/fa";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import {
  ProfileSettingsPage,
  ProfileSettingsHeader,
  ProfileSummaryCard,
  SettingsSectionLabel,
  SettingsGroup,
  SettingsRow,
  SettingsDivider,
  SettingsExpandPanel,
  DetailField,
  ThemeToggleRow,
} from "../../components/profile/ProfileSettingsLayout";
import { apiPath } from "@/config/api";

const ProfileChauffeur = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
      <ProfileSettingsPage>
        <div className="flex min-h-[50vh] items-center justify-center">
          <FaSpinner className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </ProfileSettingsPage>
    );
  }

  if (error || !profile) {
    return (
      <ProfileSettingsPage>
        <ProfileSettingsHeader title="Paramètres" />
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-600 ring-1 ring-red-100 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
          {error || "Aucun profil trouvé."}
        </div>
      </ProfileSettingsPage>
    );
  }

  const sexeLabel =
    profile.sexe === "M"
      ? "Masculin"
      : profile.sexe === "F"
        ? "Féminin"
        : profile.sexe;

  const avatar = profile.photoUrl ? (
    <img
      src={profile.photoUrl}
      alt={`${profile.prenom} ${profile.nom}`}
      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
    />
  ) : (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
      <FaUser className="h-6 w-6" />
    </div>
  );

  return (
    <ProfileSettingsPage>
      <ProfileSettingsHeader title="Paramètres" onBack={() => navigate("/chauffeur")} />

      <ProfileSummaryCard
        avatar={avatar}
        name={`${profile.prenom} ${profile.nom}`}
        subtitle={`Chauffeur · ${profile.statut || "Actif"}`}
        onClick={() => setShowDetails((v) => !v)}
      />

      {photoError && (
        <p className="-mt-4 mb-4 text-center text-xs text-red-600">{photoError}</p>
      )}

      <SettingsSectionLabel>Autres paramètres</SettingsSectionLabel>

      <SettingsGroup>
        <SettingsRow
          icon={FaIdCard}
          label="Détails du profil"
          onClick={() => setShowDetails((v) => !v)}
        />
        {showDetails && (
          <SettingsExpandPanel>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <DetailField label="Nom" value={profile.nom} />
              <DetailField label="Postnom" value={profile.postnom} />
              <DetailField label="Prénom" value={profile.prenom} />
              <DetailField label="Email" value={profile.user?.email} />
              <DetailField label="Téléphone" value={profile.telephone} />
              <DetailField label="Sexe" value={sexeLabel} />
            </div>
          </SettingsExpandPanel>
        )}
        <SettingsDivider />
        <SettingsRow
          icon={FaLock}
          label="Mot de passe"
          onClick={() => setShowPasswordModal(true)}
        />
        <SettingsDivider />
        <SettingsRow
          icon={FaBell}
          label="Notifications"
          onClick={() => navigate("/chauffeur/notifications")}
        />
        <SettingsDivider />
        <SettingsRow
          icon={FaCamera}
          label="Photo de profil"
          onClick={() => fileInputRef.current?.click()}
          trailing={
            uploadingPhoto ? (
              <FaSpinner className="h-4 w-4 animate-spin text-slate-400" />
            ) : null
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        {profile.vehicule && (
          <>
            <SettingsDivider />
            <SettingsRow
              icon={FaCar}
              label="Mon véhicule"
              onClick={() => navigate("/chauffeur")}
              trailing={
                <span className="max-w-[120px] truncate text-xs text-slate-500 dark:text-slate-400">
                  {profile.vehicule.immatriculation}
                </span>
              }
            />
          </>
        )}
        <SettingsDivider />
        <ThemeToggleRow />
      </SettingsGroup>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={profile?.user?.email}
      />
    </ProfileSettingsPage>
  );
};

export default ProfileChauffeur;
