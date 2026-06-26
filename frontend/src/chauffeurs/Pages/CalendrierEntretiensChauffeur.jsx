import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import ChauffeurMaintenanceCalendar from "../components/ChauffeurMaintenanceCalendar";

const CalendrierEntretiensChauffeur = () => {
  return (
    <div className="mx-auto max-w-lg space-y-4 lg:max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <FaCalendarAlt className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Calendrier entretiens
            </h1>
            <p className="text-sm text-slate-500">
              Échéances de maintenance de votre véhicule
            </p>
          </div>
        </div>
      </div>

      <ChauffeurMaintenanceCalendar />
    </div>
  );
};

export default CalendrierEntretiensChauffeur;
