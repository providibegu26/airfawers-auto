import { FaHistory } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const FuelGlobalHistoryModal = ({
  show,
  onClose,
  history = [],
  vehiclesMap = {},
}) => {
  if (!show) return null;

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("fr-FR");
  };

  const formatFc = (n) => `${(n || 0).toLocaleString("fr-FR")} FC`;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Historique global des attributions"
      icon={FaHistory}
      size="2xl"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Immatriculation
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Véhicule
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Quantité
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Coût
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {history.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-500"
                  colSpan={5}
                >
                  Aucune attribution enregistrée
                </td>
              </tr>
            )}
            {history.map((a, idx) => {
              const v = vehiclesMap[a.vehiculeId];
              const vehLabel = v
                ? `${v.marque || ""} ${v.modele || ""}`.trim()
                : "-";
              return (
                <tr key={a.id || idx}>
                  <td className="whitespace-nowrap px-4 py-2">
                    {formatDate(a.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {v?.immatriculation || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {vehLabel || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {a.quantite} L
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {formatFc(a.cout)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default FuelGlobalHistoryModal;
