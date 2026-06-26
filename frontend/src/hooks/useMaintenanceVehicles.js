import { useState, useEffect, useCallback } from "react";
import { fetchVehicles } from "../services/maintenanceService";

/** Charge les véhicules pour les pages entretiens. */
export function useMaintenanceVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { vehicles, setVehicles, loading, error, reload };
}
