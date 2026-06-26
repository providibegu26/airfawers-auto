import React from "react";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaCircleNotch,
  FaShieldAlt,
  FaUser,
  FaRoute,
  FaMapMarkerAlt,
  FaChartLine,
} from "react-icons/fa";

const THEMES = {
  admin: {
    roleLabel: "Espace administrateur",
    badgeIcon: FaShieldAlt,
    illustration: AdminIllustration,
  },
  chauffeur: {
    roleLabel: "Portail chauffeur",
    badgeIcon: FaUser,
    illustration: ChauffeurIllustration,
  },
};

const Brand = ({ compact = false }) => (
  <div className={compact ? "flex justify-center" : ""}>
    <img
      src="/logo.png"
      alt="Airfawers Auto — Gestion de flotte"
      className={`object-contain ${
        compact
          ? "h-11 w-auto max-w-[220px]"
          : "h-14 w-auto max-w-[280px] sm:h-16 sm:max-w-[320px]"
      }`}
    />
  </div>
);

const AuthShell = ({
  role = "admin",
  title,
  subtitle,
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  loading = false,
  error = "",
  emailPlaceholder = "vous@exemple.com",
}) => {
  const theme = THEMES[role] ?? THEMES.admin;
  const Illustration = theme.illustration;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-[1.15fr_1fr]">
        {/* ---- Panneau illustration (desktop) ---- */}
        <div className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-indigo-900 lg:block">
          {/* bokeh subtil */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute right-20 top-14 h-16 w-16 rounded-full bg-white/5" />
            <div className="absolute left-24 bottom-24 h-10 w-10 rounded-full bg-white/5" />
          </div>

          {/* bord organique vers le panneau blanc */}
          <svg
            className="absolute inset-y-0 -right-px h-full w-24 text-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,0 H40 C70,22 35,40 55,52 C72,64 38,82 50,100 H0 Z"
              fill="currentColor"
            />
          </svg>

          <div className="relative flex h-full flex-col justify-between p-10">
            <Brand />

            <div className="flex flex-1 items-center justify-center py-6">
              <Illustration />
            </div>

            <p className="text-[11px] text-indigo-100/70">
              © {new Date().getFullYear()} Airfawers Auto — Tous droits réservés.
            </p>
          </div>
        </div>

        {/* ---- Panneau formulaire ---- */}
        <div className="relative px-7 py-9 sm:px-10 sm:py-12">
          {/* En-tête mobile */}
          <div className="mb-8 lg:hidden">
            <Brand compact />
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {theme.roleLabel}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Adresse email
              </label>
              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FaCircleNotch className="animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <FaShieldAlt className="text-slate-300" />
            Accès sécurisé par authentification
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============ Illustrations (SVG inline sur le panneau indigo) ============ */

function IllustrationFrame({ children }) {
  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-white/10" />
      <div className="absolute inset-6 rounded-full bg-white/5" />
      <svg
        viewBox="0 0 220 220"
        className="relative h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    </div>
  );
}

function AdminIllustration() {
  return (
    <div className="flex flex-col items-center gap-6">
      <IllustrationFrame>
        <rect x="46" y="52" width="128" height="84" rx="10" fill="#ffffff" />
        <rect x="46" y="52" width="128" height="22" rx="10" fill="#c7d2fe" />
        <circle cx="58" cy="63" r="3" fill="#6366f1" />
        <circle cx="68" cy="63" r="3" fill="#a5b4fc" />
        <rect x="60" y="104" width="14" height="20" rx="3" fill="#a5b4fc" />
        <rect x="82" y="94" width="14" height="30" rx="3" fill="#818cf8" />
        <rect x="104" y="86" width="14" height="38" rx="3" fill="#6366f1" />
        <path
          d="M128 116 L140 104 L152 110 L164 92"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="164" cy="92" r="4" fill="#4338ca" />
        <rect x="92" y="136" width="36" height="10" rx="3" fill="#e0e7ff" />
        <rect x="78" y="146" width="64" height="6" rx="3" fill="#c7d2fe" />
      </IllustrationFrame>
      <div className="flex items-center gap-3">
        <Pill icon={FaChartLine} label="Analytics" />
        <Pill icon={FaMapMarkerAlt} label="Flotte" />
      </div>
    </div>
  );
}

function ChauffeurIllustration() {
  return (
    <div className="flex flex-col items-center gap-6">
      <IllustrationFrame>
        <path
          d="M40 168 C80 150 70 110 110 96 C150 82 140 60 178 52"
          stroke="#a5b4fc"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <path
          d="M178 36 c-11 0 -19 8 -19 18 c0 13 19 28 19 28 s19 -15 19 -28 c0 -10 -8 -18 -19 -18 z"
          fill="#4f46e5"
        />
        <circle cx="178" cy="54" r="6" fill="#eef2ff" />
        <rect x="48" y="120" width="78" height="34" rx="8" fill="#ffffff" />
        <path d="M126 130 h20 l14 16 v8 h-34 z" fill="#c7d2fe" />
        <rect x="132" y="132" width="20" height="12" rx="3" fill="#6366f1" />
        <circle cx="70" cy="158" r="11" fill="#4338ca" />
        <circle cx="70" cy="158" r="4" fill="#c7d2fe" />
        <circle cx="146" cy="158" r="11" fill="#4338ca" />
        <circle cx="146" cy="158" r="4" fill="#c7d2fe" />
      </IllustrationFrame>
      <div className="flex items-center gap-3">
        <Pill icon={FaRoute} label="Missions" />
        <Pill icon={FaMapMarkerAlt} label="Trajets" />
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
      <Icon className="text-[11px]" />
      {label}
    </span>
  );
}

export default AuthShell;
