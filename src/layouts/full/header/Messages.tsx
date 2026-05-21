import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

const mockNotifications = [
  { id: 1, text: 'Factura de Farmacias SAS procesada',        time: 'Hace 5 min', unread: true  },
  { id: 2, text: 'Error en factura de Distribuciones García', time: 'Hace 1h',    unread: true  },
  { id: 3, text: 'Insumos Norte LTA — pago pendiente',        time: 'Hace 3h',    unread: false },
];

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-gray-500
                   hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon icon="solar:bell-linear" width={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-700
                        rounded-xl shadow-lg z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="text-xs bg-violet-100 text-violet-600
                               dark:bg-violet-900/40 dark:text-violet-400
                               px-2 py-0.5 rounded-full font-medium">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          {/* Lista */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {mockNotifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                            ${n.unread ? 'bg-violet-50/60 dark:bg-violet-900/10' : ''}`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0
                                 ${n.unread ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
            <button className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;