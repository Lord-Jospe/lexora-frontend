import { useState, useEffect } from 'react';
//import { Link } from 'react-router-dom';
import ProfileMenu from './Profile';
import Notifications from './Messages';
import SidebarLayout from '../sidebar/Sidebar';

// ─── Íconos SVG inline ───────────────────────

const MenuIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1"  x2="12" y2="3"  />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3"  y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Componente Header ───────────────────────

const Header = () => {
  const [isSticky, setIsSticky]     = useState(false);
  const [darkMode, setDarkMode]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sticky al hacer scroll
  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra drawer al agrandar la ventana
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setDrawerOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Aplica clase dark al <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <>
      <header
        className={`sticky top-0 z-20 transition-shadow ${
          isSticky
            ? 'bg-white dark:bg-gray-900 shadow-md'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-3 max-w-full">

          {/* — Izquierda: hamburger (mobile) + buscador (desktop) — */}
          <div className="flex items-center gap-3">
            {/* Hamburger — solo mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <MenuIcon />
            </button>

            {/* Buscador — solo desktop */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-72">
              <span className="text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search for anything..."
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </div>

          {/* — Derecha: dark mode + notificaciones + perfil — */}
          <div className="flex items-center gap-1">
            {/* Toggle dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notificaciones */}
            <Notifications />

            {/* Perfil */}
            <ProfileMenu />
          </div>

        </nav>
      </header>

      {/* — Drawer mobile (sidebar) — */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="fixed left-0 top-0 z-40 h-screen lg:hidden">
            <SidebarLayout onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}
    </>
  );
};

export default Header;