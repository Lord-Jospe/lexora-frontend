import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import adminItems, { type MenuItem, type ChildItem } from '../sidebar/itemSidebar';

interface SearchResult {
  id: string;
  name: string;
  url: string;
  icon?: string;
  path: string;
}

/* Búsqueda recursiva en los items del sidebar */
const searchItems = (
  items: ChildItem[],
  query: string,
  parentName = '',
): SearchResult[] => {
  const results: SearchResult[] = [];
  for (const item of items) {
    const currentPath = parentName ? `${parentName} › ${item.name}` : item.name;
    if (item.name?.toLowerCase().includes(query.toLowerCase()) && item.url) {
      results.push({ id: item.id, name: item.name, url: item.url, icon: item.icon, path: currentPath });
    }
    if (item.children) {
      results.push(...searchItems(item.children, query, currentPath));
    }
  }
  return results;
};

const Search = () => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const allChildren = adminItems.flatMap((s: MenuItem) => s.children ?? []);
    return searchItems(allChildren, query);
  }, [query]);

  return (
    <div className="relative">
      {/* Input */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-72">
        <Icon icon="solar:magnifer-linear" width={17} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="bg-transparent text-sm text-gray-700 dark:text-gray-300
                     placeholder-gray-400 outline-none w-full"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-circle-linear" width={16} />
          </button>
        )}
      </div>

      {/* Dropdown resultados */}
      {query && (
        <div className="absolute top-11 left-0 w-full bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    onClick={() => setQuery('')}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm
                               text-gray-700 dark:text-gray-300
                               hover:bg-violet-50 dark:hover:bg-violet-900/20
                               hover:text-violet-600 dark:hover:text-violet-400
                               transition-colors"
                  >
                    <Icon
                      icon={item.icon ?? 'solar:circle-linear'}
                      width={16}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.path}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;