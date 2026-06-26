import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button";

/**
 * Enveloppe commune des pages entretiens : header, états loading/erreur.
 */
const MaintenancePageShell = ({
  title,
  subtitle,
  icon,
  backTo = "/admin/entretiens",
  actions,
  loading,
  error,
  children,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-500">
        Chargement des données…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(backTo)}>
          Retour aux entretiens
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={FaArrowLeft}
              onClick={() => navigate(backTo)}
            >
              Retour
            </Button>
            {actions}
          </>
        }
      />
      {children}
    </div>
  );
};

export default MaintenancePageShell;
