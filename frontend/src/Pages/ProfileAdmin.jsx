import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCog,
  FaChartLine,
  FaUsers,
  FaCar,
} from "react-icons/fa";

const ACCESS_ITEMS = [
  { icon: FaCar, label: "Gestion de la flotte" },
  { icon: FaUsers, label: "Gestion des chauffeurs" },
  { icon: FaChartLine, label: "Statistiques et rapports" },
  { icon: FaCog, label: "Configuration système" },
];

const ProfileAdmin = () => {
  const profile = {
    email: "airfawersauto@gmail.com",
    role: "Administrateur Système",
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-1 sm:px-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-28 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 sm:h-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>

        <div className="relative px-4 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 shadow-lg sm:h-28 sm:w-28">
              <FaUser className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Administrateur
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  <FaShieldAlt className="h-3 w-3" />
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FaEnvelope className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Email de connexion
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {profile.email}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FaShieldAlt className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Niveau d&apos;accès
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Accès complet
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Permissions actives
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Vous disposez de tous les droits sur la plateforme Airfawers Auto.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACCESS_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
