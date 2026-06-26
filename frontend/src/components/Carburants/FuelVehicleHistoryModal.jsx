import { FaGasPump } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import ExportMenu from "../UI/ExportMenu";
import { downloadCsv, downloadPdf } from "../../utils/exportData";

const formatDate = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("fr-FR");
};

const formatFc = (n) => `${(n || 0).toLocaleString("fr-FR")} FC`;

const EXPORT_HEADERS = ["Date", "Quantité (L)", "Coût (FC)"];

export default function FuelVehicleHistoryModal({
  show,
  onClose,
  vehicle,
  history = [],
}) {
  if (!show || !vehicle) return null;

  const buildRows = () =>
    history.map((a) => [formatDate(a.date), a.quantite, formatFc(a.cout)]);

  const handleExportPdf = () =>
    downloadPdf({
      filename: `historique-${vehicle.immatriculation}`,
      title: `Historique carburant - ${vehicle.immatriculation}`,
      subtitle: `${history.length} attribution(s)`,
      headers: EXPORT_HEADERS,
      rows: buildRows(),
      orientation: "portrait",
    });

  const handleExportCsv = () =>
    downloadCsv({
      filename: `historique-${vehicle.immatriculation}`,
      headers: EXPORT_HEADERS,
      rows: buildRows(),
    });

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`Historique carburant - ${vehicle.immatriculation}`}
      icon={FaGasPump}
      size="2xl"
      footer={
        <>
          <ExportMenu onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </>
      }
    >
      <div id="fuel-vehicle-history-modal" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Quantité (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Coût (FC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {history.length === 0 && (
              <tr>
                <td
                  className="px-6 py-6 text-center text-slate-500"
                  colSpan={3}
                >
                  Aucune attribution pour ce véhicule
                </td>
              </tr>
            )}
            {history.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  {formatDate(a.date)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">{a.quantite}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {formatFc(a.cout)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
