import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBell,
  FaIdCard,
  FaCar,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
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
} from "../components/profile/ProfileSettingsLayout";

const PERMISSIONS = [
  { icon: FaCar, label: "Gestion de la flotte" },
  { icon: FaUsers, label: "Gestion des chauffeurs" },
  { icon: FaChartLine, label: "Statistiques et rapports" },
];

const ProfileAdmin = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const profile = {
    email: "airfawersauto@gmail.com",
    role: "Administrateur Système",
    name: "Administrateur",
  };

  const avatar = (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
      <FaUser className="h-6 w-6" />
    </div>
  );

  return (
    <ProfileSettingsPage>
      <ProfileSettingsHeader title="Paramètres" onBack={() => navigate("/admin")} />

      <ProfileSummaryCard
        avatar={avatar}
        name={profile.name}
        subtitle={profile.role}
        onClick={() => setShowDetails((v) => !v)}
      />

      <SettingsSectionLabel>Autres paramètres</SettingsSectionLabel>

      <SettingsGroup>
        <SettingsRow
          icon={FaIdCard}
          label="Détails du compte"
          onClick={() => setShowDetails((v) => !v)}
        />
        {showDetails && (
          <SettingsExpandPanel>
            <DetailField label="Email de connexion" value={profile.email} />
            <DetailField label="Rôle" value={profile.role} />
            <DetailField label="Accès" value="Complet — toutes les fonctionnalités" />
            <div className="mt-3 space-y-2">
              {PERMISSIONS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 dark:bg-slate-900"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </SettingsExpandPanel>
        )}
        <SettingsDivider />
        <SettingsRow
          icon={FaBell}
          label="Notifications"
          onClick={() => navigate("/admin/notifications")}
        />
        <SettingsDivider />
        <ThemeToggleRow />
      </SettingsGroup>
    </ProfileSettingsPage>
  );
};

export default ProfileAdmin;
