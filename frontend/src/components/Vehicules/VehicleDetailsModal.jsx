import { FaCar, FaFilePdf, FaUserTie } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { downloadRecordPdf } from "../../utils/exportData";

export const VehicleDetailsModal = ({ isOpen, vehicle, onClose }) => {
  if (!isOpen || !vehicle) return null;

  const chauffeur = vehicle.chauffeur;

  const handleExportPdf = () =>
    downloadRecordPdf({
      filename: `vehicule-${vehicle.immatriculation}`,
      title: `Véhicule ${vehicle.immatriculation}`,
      sections: [
        {
          heading: "Informations générales",
          rows: [
            ["Immatriculation", vehicle.immatriculation],
            ["Marque", vehicle.marque],
            ["Modèle", vehicle.modele],
            ["Catégorie", vehicle.categorie],
            ["Statut", vehicle.chauffeur ? "Attribué" : "Non attribué"],
          ],
        },
        {
          heading: "Chauffeur attribué",
          rows: chauffeur
            ? [
                ["Nom", `${chauffeur.nom || ""} ${chauffeur.prenom || ""}`.trim()],
                ["Téléphone", chauffeur.telephone],
                ["Email", chauffeur.user?.email || chauffeur.email || "Non défini"],
              ]
            : [["Chauffeur", "Aucun chauffeur attribué"]],
        },
        {
          heading: "Informations techniques",
          rows: [
            ["Kilométrage actuel", `${vehicle.kilometrage} km`],
            [
              "Date d'ajout",
              vehicle.dateAjout
                ? new Date(vehicle.dateAjout).toLocaleDateString("fr-FR")
                : "—",
            ],
          ],
        },
      ],
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du véhicule"
      icon={FaCar}
      size="lg"
      footer={
        <>
          <Button
            variant="primary"
            size="sm"
            icon={FaFilePdf}
            onClick={handleExportPdf}
          >
            Exporter en PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </>
      }
    >
      <div id="vehicle-details-modal" className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <h4 className="mb-3 font-bold text-slate-800">
              Informations générales
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="text-slate-600">Immatriculation:</span>{" "}
                {vehicle.immatriculation}
              </div>
              <div>
                <span className="text-slate-600">Marque:</span> {vehicle.marque}
              </div>
              <div>
                <span className="text-slate-600">Modèle:</span> {vehicle.modele}
              </div>
              <div>
                <span className="text-slate-600">Catégorie:</span>{" "}
                {vehicle.categorie}
              </div>
              <div>
                <span className="text-slate-600">Statut:</span>{" "}
                <span
                  className={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    vehicle.chauffeur
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vehicle.chauffeur ? "Attribué" : "Non attribué"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <h4 className="mb-3 flex items-center font-bold text-slate-800">
              <FaUserTie className="mr-2 text-indigo-500" />
              Chauffeur attribué
            </h4>
            {chauffeur ? (
              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="font-medium text-slate-600">Nom:</span>{" "}
                  {chauffeur.nom} {chauffeur.prenom}
                </div>
                <div>
                  <span className="font-medium text-slate-600">Téléphone:</span>{" "}
                  {chauffeur.telephone}
                </div>
                <div>
                  <span className="font-medium text-slate-600">Email:</span>{" "}
                  <span className="text-indigo-600">
                    {chauffeur.user?.email || chauffeur.email || "Non défini"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Aucun chauffeur attribué
              </div>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <h4 className="mb-3 font-bold text-slate-800">
              Informations techniques
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-medium text-slate-600">
                  Kilométrage actuel:
                </span>{" "}
                {vehicle.kilometrage} km
              </div>
              <div>
                <span className="font-medium text-slate-600">Date d'ajout:</span>{" "}
                {new Date(vehicle.dateAjout).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
