const Filters = ({ onFilterChange, onMileageUpdate, onExportPDF }) => {
  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto mb-6">
      <div className="relative">
        <select 
          onChange={(e) => onFilterChange(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="urgent">Urgent (moins de 7 jours)</option>
          <option value="warning">À venir (7-14 jours)</option>
          <option value="ok">Valide (plus de 14 jours)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
      
      <button 
        onClick={onMileageUpdate}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center"
      >
        <i className="fas fa-sync-alt mr-2"></i> Màj kilométrage
      </button>
      
      <button 
        onClick={onExportPDF}
        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center"
      >
        <i className="fas fa-file-pdf mr-2"></i> Exporter PDF
      </button>
    </div>
  );
};

export default Filters;