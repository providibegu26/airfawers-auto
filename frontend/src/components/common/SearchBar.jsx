import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange, placeholder = "Rechercher…" }) => (
  <div className="relative">
    <FaSearch
      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    />
    <input
      type="search"
      className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
