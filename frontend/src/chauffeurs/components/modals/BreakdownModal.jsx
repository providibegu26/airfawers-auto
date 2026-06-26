import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaExclamationTriangle,
  FaCar,
  FaSpinner,
  FaCheckCircle,
  FaCrosshairs,
} from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import DraggableLocationMap from "../../../components/Pannes/DraggableLocationMap";
import {
  fetchPanneMeta,
  fetchChauffeurProfile,
  reportPanne,
} from "../../../services/panneService";

const GOOD_ACCURACY_M = 80;
const STABILIZE_TIMEOUT_MS = 8000;

const BreakdownModal = ({ isOpen, onClose }) => {
  const [vehicle, setVehicle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [niveauGravite, setNiveauGravite] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [repere, setRepere] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [markerAdjusted, setMarkerAdjusted] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const bestAccuracyRef = useRef(Infinity);
  const watchIdRef = useRef(null);
  const markerAdjustedRef = useRef(false);

  const handlePositionChange = useCallback((lat, lng, fromUser = false) => {
    if (fromUser) {
      markerAdjustedRef.current = true;
      setMarkerAdjusted(true);
    }
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  const isLowAccuracy = accuracy != null && accuracy > GOOD_ACCURACY_M;
  const needsManualConfirm = isLowAccuracy && !markerAdjusted;

  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      setLoading(true);
      setError("");
      setSuccess(false);
      setType("");
      setDescription("");
      setNiveauGravite("");
      setRepere("");
      setLatitude(null);
      setLongitude(null);
      setAccuracy(null);
      setMarkerAdjusted(false);
      markerAdjustedRef.current = false;
      setLocationError(null);
      setVehicle(null);
      bestAccuracyRef.current = Infinity;

      try {
        const [metaData, profileData] = await Promise.all([
          fetchPanneMeta(),
          fetchChauffeurProfile(),
        ]);
        setMeta(metaData);
        if (!profileData.chauffeur?.vehicule) {
          setError("Aucun véhicule attribué.");
        } else {
          setVehicle(profileData.chauffeur.vehicule);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();

    if (!navigator.geolocation) {
      setLocationError("GPS indisponible — cliquez sur la carte.");
      setIsLocating(false);
    } else {
      setIsLocating(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng, accuracy: acc } =
            position.coords;
          setAccuracy(acc);
          setIsLocating(false);
          if (
            !markerAdjustedRef.current &&
            (acc < bestAccuracyRef.current ||
              !Number.isFinite(bestAccuracyRef.current))
          ) {
            bestAccuracyRef.current = acc;
            setLatitude(lat);
            setLongitude(lng);
          }
        },
        () => {
          setLocationError("GPS indisponible — cliquez sur la carte.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    }

    const timeout = setTimeout(() => setIsLocating(false), STABILIZE_TIMEOUT_MS);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearTimeout(timeout);
    };
  }, [isOpen]);

  const recentreOnGps = () => {
    markerAdjustedRef.current = false;
    setMarkerAdjusted(false);
    bestAccuracyRef.current = Infinity;
    setIsLocating(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!vehicle) return setError("Aucun véhicule attribué.");
    if (!type) return setError("Sélectionnez un type de panne.");
    if (!niveauGravite) return setError("Indiquez l'état du véhicule.");
    if (latitude == null || longitude == null)
      return setError("Placez le marqueur sur la carte.");
    if (needsManualConfirm) {
      return setError(
        "GPS imprécis : déplacez le marqueur sur la carte pour confirmer."
      );
    }

    try {
      setSubmitting(true);
      await reportPanne({
        type,
        description: description.trim(),
        niveauGravite,
        latitude,
        longitude,
        localisation: repere.trim() || null,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabels = meta?.labels?.types || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlay={!submitting}
      title="Signaler une panne"
      icon={FaExclamationTriangle}
      size="md"
      scrollable
      footer={
        !loading &&
        !success && (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={submitting}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={submitting}
              disabled={!vehicle}
              onClick={handleSubmit}
            >
              Envoyer
            </Button>
          </>
        )
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <FaSpinner className="animate-spin" />
          Chargement…
        </div>
      ) : success ? (
        <div className="py-8 text-center">
          <FaCheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
          <p className="text-sm font-medium text-slate-900">
            Signalement envoyé
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {vehicle && (
            <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <FaCar className="shrink-0 text-indigo-500" />
              <span className="truncate">
                {vehicle.marque} {vehicle.modele} — {vehicle.immatriculation}
              </span>
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Type de panne *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner…</option>
              {(meta?.types || []).map((t) => (
                <option key={t} value={t}>
                  {typeLabels[t] || t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="Décrivez le problème…"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              État du véhicule *
            </label>
            <div className="flex gap-2">
              {(meta?.niveauxGravite || []).map((niveau) => (
                <label
                  key={niveau}
                  className={`flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs ${
                    niveauGravite === niveau
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="niveauGravite"
                    value={niveau}
                    checked={niveauGravite === niveau}
                    onChange={(e) => setNiveauGravite(e.target.value)}
                    className="sr-only"
                  />
                  {niveau === "utilisable"
                    ? "Utilisable"
                    : niveau === "limite"
                      ? "Limité"
                      : "Immobilisé"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Position *
              </span>
              <button
                type="button"
                onClick={recentreOnGps}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                <FaCrosshairs className="h-3 w-3" />
                Recentrer GPS
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <DraggableLocationMap
                latitude={latitude}
                longitude={longitude}
                onPositionChange={handlePositionChange}
                followGps={!markerAdjusted}
                height="140px"
              />
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {isLocating && <span className="text-indigo-600">GPS en cours…</span>}
              {!isLocating && accuracy != null && (
                <span className={isLowAccuracy ? "text-amber-600" : "text-emerald-600"}>
                  Précision ±{Math.round(accuracy)} m
                  {isLowAccuracy && " — confirmez sur la carte"}
                </span>
              )}
              {markerAdjusted && (
                <span className="block text-emerald-600">Position confirmée</span>
              )}
              {locationError && (
                <span className="block text-amber-600">{locationError}</span>
              )}
            </div>
            <input
              type="text"
              value={repere}
              onChange={(e) => setRepere(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Repère (optionnel)"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
};

export default BreakdownModal;
