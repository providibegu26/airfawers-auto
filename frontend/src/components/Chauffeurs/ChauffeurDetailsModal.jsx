import { FaUserTie, FaFilePdf, FaCar } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { downloadRecordPdf } from "../../utils/exportData";

export const ChauffeurDetailsModal = ({ chauffeur, onClose, vehicles }) => {
  const vehiculeAssigne =
    chauffeur.vehiculeAssigne ||
    vehicles?.find((v) => v.chauffeurId === chauffeur.id);

  const getVehiculeCategorie = () => {
    if (vehiculeAssigne?.categorie) {
      return vehiculeAssigne.categorie;
    }
    const vehiculeFromProps = vehicles?.find(
      (v) => v.chauffeurId === chauffeur.id
    );
    return vehiculeFromProps?.categorie || "N/A";
  };

  const handleExportPdf = () =>
    downloadRecordPdf({
      filename: `chauffeur-${chauffeur.id}`,
      title: `Chauffeur ${chauffeur.nom || ""} ${chauffeur.prenom || ""}`.trim(),
      sections: [
        {
          heading: "Informations personnelles",
          rows: [
            ["ID", chauffeur.id],
            ["Nom", chauffeur.nom],
            ["Post-nom", chauffeur.postnom],
            ["Prénom", chauffeur.prenom],
            ["Sexe", chauffeur.sexe],
            ["Téléphone", chauffeur.telephone],
            ["Email", chauffeur.user?.email || "Non défini"],
          ],
        },
        {
          heading: "Véhicule attribué",
          rows: vehiculeAssigne
            ? [
                ["Immatriculation", vehiculeAssigne.immatriculation],
                ["Marque", vehiculeAssigne.marque],
                ["Modèle", vehiculeAssigne.modele],
                ["Catégorie", getVehiculeCategorie()],
              ]
            : [["Véhicule", "Aucun véhicule attribué"]],
        },
      ],
    });

  return (
    <Modal
      show
      onClose={onClose}
      title="Détails du chauffeur"
      icon={FaUserTie}
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
      <div id="chauffeur-details-modal" className="space-y-3">
        <div className="flex justify-center">
          {chauffeur.photoUrl ? (
            <img
              src={chauffeur.photoUrl}
              alt={`${chauffeur.prenom} ${chauffeur.nom}`}
              className="h-24 w-24 rounded-full border-2 border-indigo-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <FaUserTie className="text-3xl" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <h4 className="mb-3 font-bold text-slate-800">
              Informations personnelles
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-medium text-slate-600">ID:</span>{" "}
                {chauffeur.id}
              </div>
              <div>
                <span className="font-medium text-slate-600">Nom:</span>{" "}
                {chauffeur.nom}
              </div>
              <div>
                <span className="font-medium text-slate-600">Post-nom:</span>{" "}
                {chauffeur.postnom}
              </div>
              <div>
                <span className="font-medium text-slate-600">Prénom:</span>{" "}
                {chauffeur.prenom}
              </div>
              <div>
                <span className="font-medium text-slate-600">Sexe:</span>{" "}
                {chauffeur.sexe}
              </div>
              <div>
                <span className="font-medium text-slate-600">Téléphone:</span>{" "}
                {chauffeur.telephone}
              </div>
              <div>
                <span className="font-medium text-slate-600">Email:</span>{" "}
                <span className="text-indigo-600">
                  {chauffeur.user?.email || "Non défini"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <h4 className="mb-3 flex items-center font-bold text-slate-800">
              <FaCar className="mr-2 text-indigo-500" />
              Véhicule attribué
            </h4>
            {vehiculeAssigne ? (
              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="font-medium text-slate-600">
                    Immatriculation:
                  </span>{" "}
                  {vehiculeAssigne.immatriculation}
                </div>
                <div>
                  <span className="font-medium text-slate-600">Marque:</span>{" "}
                  {vehiculeAssigne.marque}
                </div>
                <div>
                  <span className="font-medium text-slate-600">Modèle:</span>{" "}
                  {vehiculeAssigne.modele}
                </div>
                <div>
                  <span className="font-medium text-slate-600">Catégorie:</span>{" "}
                  <span
                    className={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      getVehiculeCategorie() === "HEAVY"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {getVehiculeCategorie()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Aucun véhicule attribué
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
