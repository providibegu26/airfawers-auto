import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export function ProfileSettingsPage({ title, children }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-2 sm:py-4">
      {children}
    </div>
  );
}

export function ProfileSettingsHeader({ title, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="relative mb-6 flex items-center justify-center">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
        aria-label="Retour"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>
    </div>
  );
}

export function ProfileSummaryCard({
  avatar,
  name,
  subtitle,
  onClick,
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`mb-6 flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700 ${
        onClick ? "transition hover:bg-slate-50 dark:hover:bg-slate-800" : ""
      }`}
    >
      <div className="shrink-0">{avatar}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {onClick && (
        <FaChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
      )}
    </Wrapper>
  );
}

export function SettingsSectionLabel({ children }) {
  return (
    <p className="mb-2 px-1 text-sm text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

export function SettingsGroup({ children }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700">
      {children}
    </div>
  );
}

export function SettingsRow({
  icon: Icon,
  label,
  onClick,
  trailing,
  destructive = false,
  showChevron = true,
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
        onClick
          ? "hover:bg-slate-50 dark:hover:bg-slate-800/80"
          : ""
      } ${destructive ? "text-red-600 dark:text-red-400" : ""}`}
    >
      {Icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            destructive
              ? "bg-red-50 text-red-500 dark:bg-red-950/50"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span
        className={`flex-1 text-sm font-medium ${
          destructive
            ? "text-red-600 dark:text-red-400"
            : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {label}
      </span>
      {trailing}
      {showChevron && onClick && !trailing && (
        <FaChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      )}
    </Wrapper>
  );
}

export function SettingsDivider() {
  return <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />;
}

export function SettingsExpandPanel({ children }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/40">
      {children}
    </div>
  );
}

export function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

export function ThemeToggleRow() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const ThemeIcon = isDark ? FaMoon : FaSun;

  return (
    <SettingsRow
      icon={ThemeIcon}
      label="Mode sombre"
      showChevron={false}
      trailing={
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleTheme}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            isDark ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              isDark ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      }
    />
  );
}
