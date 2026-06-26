import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportMenu from '../components/UI/ExportMenu';
import { downloadCsv, downloadPdf } from '../utils/exportData';
import { apiPath } from '@/config/api';

const EXPORT_HEADERS = ['Date', 'Immatriculation', 'Véhicule', 'Quantité (L)', 'Coût (FC)'];

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('fr-FR');
};

const formatFc = (n) => `${(n || 0).toLocaleString('fr-FR')} FC`;

export default function FuelHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hRes, vRes] = await Promise.all([
        fetch(apiPath('/admin/carburant/historique/global')),
        fetch(apiPath('/admin/vehicules'))
      ]);
      const hData = await hRes.json();
      const vData = await vRes.json();
      setHistory(hData.attributions || []);
      const map = {};
      (vData.vehicules || []).forEach(v => { map[v.id] = v; });
      setVehiclesMap(map);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (!search) return history;
    const q = search.toLowerCase();
    return history.filter(a => {
      const v = vehiclesMap[a.vehiculeId];
      const imm = v?.immatriculation?.toLowerCase() || '';
      const label = `${v?.marque || ''} ${v?.modele || ''}`.toLowerCase();
      return imm.includes(q) || label.includes(q);
    });
  }, [history, vehiclesMap, search]);

  const buildExportRows = () =>
    filtered.map((a) => {
      const v = vehiclesMap[a.vehiculeId];
      const veh = v ? `${v.marque || ''} ${v.modele || ''}`.trim() : '-';
      return [
        formatDate(a.date),
        v?.immatriculation || '-',
        veh || '-',
        a.quantite,
        formatFc(a.cout),
      ];
    });

  const handleExportPdf = () =>
    downloadPdf({
      filename: 'historique-carburant',
      title: 'Historique carburant - flotte',
      subtitle: `${filtered.length} attribution(s)`,
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
      orientation: 'landscape',
    });

  const handleExportCsv = () =>
    downloadCsv({
      filename: 'historique-carburant',
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
    });

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Historique Carburant</h2>
          <p className="text-gray-500 text-sm">Toutes les attributions de la flotte</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Rechercher un véhicule..."
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ExportMenu onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
          <button onClick={() => navigate('/admin/carburants')} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Retour</button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 text-gray-500">Chargement...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div id="fuel-history-table-pdf" className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Immatriculation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût (FC)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>Aucune attribution</td>
                  </tr>
                )}
                {filtered.map((a, idx) => {
                  const v = vehiclesMap[a.vehiculeId];
                  const veh = v ? `${v.marque || ''} ${v.modele || ''}`.trim() : '-';
                  return (
                    <tr key={a.id || idx}>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(a.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{v?.immatriculation || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{veh || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{a.quantite}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatFc(a.cout)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
