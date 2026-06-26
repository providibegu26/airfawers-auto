import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSync } from '@fortawesome/free-solid-svg-icons';
import PannesMap from '../Pannes/PannesMap';
import { fetchPannesMap } from '../../services/panneService';

const FullMap = () => {
  const [pannes, setPannes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPannes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPannesMap();
      setPannes(data);
    } catch (err) {
      setError(err.message);
      setPannes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPannes();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <Link
          to="/admin"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </Link>
        <h2 className="text-xl font-semibold">Carte des pannes actives</h2>
        <button
          type="button"
          onClick={loadPannes}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
          title="Actualiser"
        >
          <FontAwesomeIcon icon={faSync} spin={loading} />
        </button>
      </div>

      <div className="relative">
        {error ? (
          <div className="h-[clamp(420px,calc(100vh_-_260px),780px)] flex items-center justify-center bg-red-50 text-red-600">
            {error}
          </div>
        ) : loading ? (
          <div className="h-[clamp(420px,calc(100vh_-_260px),780px)] flex items-center justify-center bg-gray-100 text-gray-500">
            Chargement de la carte…
          </div>
        ) : (
          <PannesMap pannes={pannes} height="clamp(420px, calc(100vh - 260px), 780px)" />
        )}
      </div>

      <div className="px-4 py-3 border-t flex gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-1" />
          <span>En attente</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
          <span>En cours</span>
        </div>
        {!loading && (
          <span className="ml-auto text-gray-500">
            {pannes.length} panne{pannes.length !== 1 ? 's' : ''} géolocalisée{pannes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default FullMap;
