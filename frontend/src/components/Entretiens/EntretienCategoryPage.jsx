import { useEffect, useState } from "react";
import { FaTools } from "react-icons/fa";
import MaintenancePageShell from "./MaintenancePageShell";
import MaintenanceTable from "./MaintenanceTable";
import Card from "../UI/Card";
import { useMaintenanceVehicles } from "../../hooks/useMaintenanceVehicles";
import { getNonUrgentMaintenance, formatMaintenanceData } from "../../services/maintenanceService";

/**
 * Page catégorie d'entretien réutilisable (A / B / C).
 */
const EntretienCategoryPage = ({
  title,
  subtitle,
  categoryKey,
  tableHint,
  emptyTitle,
}) => {
  const { vehicles, loading, error } = useMaintenanceVehicles();
  const [maintenanceData, setMaintenanceData] = useState([]);

  useEffect(() => {
    if (vehicles.length === 0 && !loading) {
      setMaintenanceData([]);
      return;
    }
    const list = getNonUrgentMaintenance(vehicles, categoryKey);
    setMaintenanceData(formatMaintenanceData(list));
  }, [vehicles, categoryKey, loading]);

  return (
    <MaintenancePageShell
      title={title}
      subtitle={subtitle}
      icon={FaTools}
      loading={loading}
      error={error}
    >
      <Card padding={false} className="overflow-hidden">
        {tableHint && (
          <div className="border-b border-slate-200 px-5 py-3">
            <p className="text-xs text-amber-700">{tableHint}</p>
          </div>
        )}
        <MaintenanceTable
          data={maintenanceData}
          loading={loading}
          emptyTitle={emptyTitle}
        />
      </Card>
    </MaintenancePageShell>
  );
};

export default EntretienCategoryPage;
