import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaTools, FaCar, FaUser, FaExclamationTriangle } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import {
  DATE_TOLERANCE_DAYS,
  fetchSchedulingCandidates,
  planMaintenances,
  isDateWithinPlanningTolerance,
} from "../../services/maintenanceService";

const ScheduleMaintenanceModal = ({
  isOpen,
  onClose,
  selectedDate,
  plannedOnDate = [],
  onScheduled,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [others, setOthers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !selectedDate) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSchedulingCandidates(selectedDate);
        if (!cancelled) {
          setSuggestions(data.suggestions || []);
          setOthers(data.others || []);
          const preselected = new Set(
            (data.suggestions || []).map((s) => `${s.vehiculeId}-${s.type}`)
          );
          setSelected(preselected);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedDate]);

  const toggle = (vehiculeId, type) => {
    const key = `${vehiculeId}-${type}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = async () => {
    const allItems = [...suggestions, ...others];
    const items = allItems
      .filter((item) => selected.has(`${item.vehiculeId}-${item.type}`))
      .map((item) => ({ vehiculeId: item.vehiculeId, type: item.type }));

    if (!items.length) {
      setError("Sélectionnez au moins un véhicule");
      return;
    }

    const invalid = allItems.find(
      (item) =>
        selected.has(`${item.vehiculeId}-${item.type}`) &&
        !isDateWithinPlanningTolerance(selectedDate, item.daysRemaining)
    );

    if (invalid) {
      setError(
        `La date est à plus de ${DATE_TOLERANCE_DAYS} jours de l'estimation pour ${invalid.immatriculation}`
      );
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await planMaintenances(selectedDate, items);
      onScheduled?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderItem = (item, isSuggestion) => {
    const key = `${item.vehiculeId}-${item.type}`;
    const checked = selected.has(key);
    const inTolerance = isDateWithinPlanningTolerance(selectedDate, item.daysRemaining);

    return (
      <label
        key={key}
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
          checked
            ? "border-indigo-300 bg-indigo-50"
            : "border-slate-200 bg-white hover:bg-slate-50"
        } ${!inTolerance ? "opacity-60" : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={!inTolerance}
          onChange={() => toggle(item.vehiculeId, item.type)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900">{item.immatriculation}</span>
            {isSuggestion && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Suggestion
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {item.marque} {item.modele} — {item.typeLabel}
          </p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FaTools className="text-slate-400" />
              {item.daysRemaining < 0
                ? `${Math.abs(item.daysRemaining)} j de retard`
                : `${item.daysRemaining} j restants`}
            </span>
            {item.chauffeur && (
              <span className="flex items-center gap-1">
                <FaUser className="text-slate-400" />
                {item.chauffeur}
              </span>
            )}
          </div>
          {!inTolerance && (
            <p className="mt-1 text-xs text-red-600">
              Hors tolérance ±{DATE_TOLERANCE_DAYS} j par rapport à l'estimation
            </p>
          )}
        </div>
      </label>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planifier des entretiens"
      subtitle={selectedDate ? formatDate(selectedDate) : undefined}
      icon={FaCalendarAlt}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Fermer
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || loading || selected.size === 0}
          >
            {submitting ? "Planification…" : `Confirmer (${selected.size})`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {plannedOnDate.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-indigo-900">
              Déjà planifiés ce jour
            </h3>
            <div className="space-y-2">
              {plannedOnDate.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium text-indigo-900">
                    <FaCar />
                    {p.immatriculation} — {p.typeLabel}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <p className="text-center text-sm text-slate-500">Chargement…</p>
        ) : (
          <>
            {suggestions.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Suggestions (estimation proche de cette date)
                </h3>
                <div className="space-y-2">
                  {suggestions.map((item) => renderItem(item, true))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Autres véhicules à planifier
                </h3>
                <div className="space-y-2">
                  {others.map((item) => renderItem(item, false))}
                </div>
              </section>
            )}

            {!loading && suggestions.length === 0 && others.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                Aucun véhicule à planifier pour cette date.
              </p>
            )}
          </>
        )}

        <p className="text-xs text-slate-500">
          La date doit être à ±{DATE_TOLERANCE_DAYS} jours de l'estimation km. Le chauffeur
          sera notifié par email et dans l'application.
        </p>
      </div>
    </Modal>
  );
};

export default ScheduleMaintenanceModal;
