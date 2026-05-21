import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Mi perfil',     url: '/admin/perfil',          icon: 'solar:user-linear'         },
  { label: 'Configuración', url: '/admin/configuraciones',  icon: 'solar:settings-linear'     },
];

const Profile = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative ml-1">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* Avatar placeholder — reemplaza por <img> cuando tengas la foto */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          JF
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
            Joseph Ferrer
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
            Empresa Fruver
          </p>
        </div>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={14}
          className={`hidden sm:block text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-700
                        rounded-xl shadow-lg z-50 py-1 overflow-hidden">

          {/* Info header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Joseph Ferrer</p>
            <p className="text-xs text-gray-400 mt-0.5">Empresa Fruver</p>
          </div>

          {/* Links */}
          {menuItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         hover:text-violet-600 dark:hover:text-violet-400
                         transition-colors"
            >
              <Icon icon={item.icon} width={16} className="text-gray-400" />
              {item.label}
            </Link>
          ))}

          {/* Logout */}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <button
              onClick={() => console.log('logout — pendiente implementar')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                         text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                         transition-colors"
            >
              <Icon icon="solar:logout-2-linear" width={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;