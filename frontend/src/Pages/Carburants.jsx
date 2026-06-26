import { useState, useEffect, useMemo } from "react";
import { FaGasPump, FaHistory } from "react-icons/fa";
import FuelCards from "../components/Carburants/FuelCards";
import FuelConsumptionChart from "../components/Carburants/FuelConsumptionChart";
import FuelTable from "../components/Carburants/FuelTable";
import AssignFuelModal from "../components/Carburants/AssignFuelModal";
import FuelGlobalHistoryModal from "../components/Carburants/FuelGlobalHistoryModal";
import FuelVehicleHistoryModal from "../components/Carburants/FuelVehicleHistoryModal";
import PageHeader from "../components/UI/PageHeader";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import SearchBar from "../components/common/SearchBar";
import { apiPath } from "@/config/api";

const API_VEHICULES = apiPath("/admin/vehicules");
const API_HISTORIQUE = apiPath("/admin/carburant/historique/global");
const API_RAPPORTS = apiPath("/admin/carburant/rapports?periode=monthly");

const Carburants = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastAttributions, setLastAttributions] = useState({});
  const [monthlyCostUSD, setMonthlyCostUSD] = useState(0);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [globalHistory, setGlobalHistory] = useState([]);
  const [vehicleHistoryOpen, setVehicleHistoryOpen] = useState(false);
  const [vehicleHistory, setVehicleHistory] = useState([]);

  const fetchVehicles = async () => {
    const response = await fetch(API_VEHICULES);
    if (!response.ok) throw new Error("Erreur lors de la récupération des véhicules");
    const data = await response.json();
    setVehicles(data.vehicules || []);
  };

  const fetchLastAttributions = async () => {
    const res = await fetch(API_HISTORIQUE);
    if (!res.ok) return;
    const data = await res.json();
    const map = {};
    (data.attributions || []).forEach((a) => {
      if (a.vehiculeId && !map[a.vehiculeId]) {
        map[a.vehiculeId] = { quantite: a.quantite, date: a.date };
      }
    });
    setLastAttributions(map);
  };

  const fetchMonthlyCost = async () => {
    const res = await fetch(API_RAPPORTS);
    if (!res.ok) return;
    const data = await res.json();
    const now = new Date();
    const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const fc = (data.aggreg && data.aggreg[key]?.cout) || 0;
    setMonthlyCostUSD(fc / 2850);
  };

  const refreshAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchVehicles(), fetchLastAttributions(), fetchMonthlyCost()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return vehicles
      .filter((vehicle) => {
        if (!q) return true;
        return (
          vehicle.immatriculation?.toLowerCase().includes(q) ||
          `${vehicle.marque} ${vehicle.modele}`.toLowerCase().includes(q) ||
          (vehicle.chauffeur &&
            `${vehicle.chauffeur.prenom} ${vehicle.chauffeur.nom}`.toLowerCase().includes(q))
        );
      })
      .map((v) => ({
        ...v,
        lastAttribution: lastAttributions[v.id] || null,
      }));
  }, [vehicles, searchTerm, lastAttributions]);

  const vehiclesMap = useMemo(
    () => vehicles.reduce((acc, v) => { acc[v.id] = v; return acc; }, {}),
    [vehicles]
  );

  const openGlobalHistory = async () => {
    const res = await fetch(API_HISTORIQUE);
    if (!res.ok) return;
    const data = await res.json();
    setGlobalHistory(data.attributions || []);
    setHistoryModalOpen(true);
  };

  const handleRowClick = async (vehicle) => {
    const res = await fetch(
      apiPath(`/admin/carburant/historique/vehicule/${vehicle.id}`)
    );
    const data = await res.json();
    setVehicleHistory(data.attributions || []);
    setSelectedVehicle(vehicle);
    setVehicleHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion du carburant"
        subtitle={`${filteredVehicles.length} véhicule${filteredVehicles.length !== 1 ? "s" : ""} — attributions et consommation`}
        icon={FaGasPump}
        actions={
          <>
            <div className="w-full sm:w-56">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher un véhicule…"
              />
            </div>
            <Button variant="secondary" size="sm" icon={FaHistory} onClick={openGlobalHistory}>
              Historique
            </Button>
          </>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FuelCards
          vehicles={vehicles}
          monthlyCostUSD={monthlyCostUSD}
          loading={loading}
        />
        <FuelConsumptionChart />
      </div>

      <Card padding={false} className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Attributions par véhicule</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Cliquez sur une ligne pour voir l&apos;historique du véhicule
          </p>
        </div>
        <FuelTable
          vehicles={filteredVehicles}
          loading={loading}
          onAssignFuel={(vehicle) => {
            setSelectedVehicle(vehicle);
            setShowModal(true);
          }}
          onRowClick={handleRowClick}
        />
      </Card>

      <AssignFuelModal
        show={showModal}
        onClose={() => setShowModal(false)}
        vehicle={selectedVehicle}
        onSuccess={refreshAll}
      />

      <FuelGlobalHistoryModal
        show={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={globalHistory}
        vehiclesMap={vehiclesMap}
      />

      <FuelVehicleHistoryModal
        show={vehicleHistoryOpen}
        onClose={() => setVehicleHistoryOpen(false)}
        vehicle={selectedVehicle}
        history={vehicleHistory}
      />
    </div>
  );
};

export default Carburants;
