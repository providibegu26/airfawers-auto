import React from "react";

const VARIANTS = {
  primary:
    "bg-indigo-600 text-white border border-transparent hover:bg-indigo-700",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-600 text-white border border-transparent hover:bg-red-700",
  ghost:
    "bg-transparent text-slate-600 border border-transparent hover:bg-slate-100",
  subtle:
    "bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200",
};

const SIZES = {
  sm: "px-2.5 py-1 text-xs gap-1.5",
  md: "px-3 py-1.5 text-sm gap-2",
  lg: "px-4 py-2 text-sm gap-2",
  icon: "p-2 gap-0",
};

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/**
 * Bouton standard FleetTech.
 *  variant: primary | secondary | danger | ghost | subtle
 *  size: sm | md | lg | icon
 *  icon / iconRight: composant icône (react-icons)
 *  as: "button" | "a" | composant (ex: Link)
 */
const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    as: Comp = "button",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    className = "",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <Comp
      ref={ref}
      disabled={Comp === "button" ? isDisabled : undefined}
      aria-disabled={Comp !== "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4" /> : null}
    </Comp>
  );
});

export default Button;
