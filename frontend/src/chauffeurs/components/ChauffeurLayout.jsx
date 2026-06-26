import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ChauffeurSidebar from "./ChauffeurSidebar";
import HeaderChauffeur from "./HeaderChauffeur";
import ChauffeurBottomNav from "./ChauffeurBottomNav";
import ChauffeurVehicleModal from "./modals/ChauffeurVehicleModal";
import ChauffeurMaintenanceModal from "./modals/ChauffeurMaintenanceModal";
import FuelModal from "./modals/FuelModal";
import BreakdownModal from "./modals/BreakdownModal";
import MileageChauffeurModal from "./modals/MileageChauffeurModal";

const ChauffeurLayout = () => {
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  return (
    <div className="flex h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <ChauffeurSidebar
        openModal={openModal}
        closeSidebar={() => setSidebarOpen(false)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderChauffeur onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 lg:pb-6 lg:px-6">
          <Outlet context={{ openModal, closeModal }} />
        </main>

        <ChauffeurBottomNav onPanic={() => openModal("panne")} />
      </div>

      <ChauffeurVehicleModal isOpen={modal === "vehicule"} onClose={closeModal} />
      <ChauffeurMaintenanceModal isOpen={modal === "entretien"} onClose={closeModal} />
      <FuelModal isOpen={modal === "carburant"} onClose={closeModal} />
      <BreakdownModal isOpen={modal === "panne"} onClose={closeModal} />
      <MileageChauffeurModal isOpen={modal === "kilometrage"} onClose={closeModal} />
    </div>
  );
};

export default ChauffeurLayout;
