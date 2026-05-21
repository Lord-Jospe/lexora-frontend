import { useState, useRef, useEffect } from 'react';

const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Notificaciones de ejemplo — luego vendrán de la BD
const mockNotifications = [
  { id: 1, text: 'Factura de Farmacias SAS procesada', time: 'Hace 5 min',  unread: true  },
  { id: 2, text: 'Error en factura de Distribuciones García', time: 'Hace 1h', unread: true  },
  { id: 3, text: 'Insumos Norte LTA — pago pendiente',  time: 'Hace 3h',  unread: false },
];

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          <ul>
            {mockNotifications.map((n) => (
              <li
                key={n.id}
                className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  n.unread ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''
                }`}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;