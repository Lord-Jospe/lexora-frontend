import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import adminItems, { type MenuItem, type ChildItem } from '../sidebar/itemSidebar';
import FullLogo from '../../logo/FullLogo';
import '../../css/sidebar.css';
import { useAuth } from '../../../context/authContext';

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const { pathname } = useLocation();
  const { logout }   = useAuth();
  const navigate     = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar-root">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <Link to="/admin" onClick={onClose}>
          <FullLogo />
        </Link>
      </div>

      {/* ── Items ── */}
      <nav className="sidebar-nav">
        {adminItems.map((section: MenuItem, sectionIndex: number) => (
          <div key={sectionIndex}>
            {section.heading && (
              <p className="sidebar-heading">{section.heading}</p>
            )}
            {section.children?.map((item: ChildItem) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  to={item.url ?? '#'}
                  onClick={onClose}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-item-icon">
                    <Icon icon={item.icon ?? 'solar:circle-linear'} width={18} height={18} />
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-item-icon">
            <Icon icon="solar:logout-2-linear" width={18} height={18} />
          </span>
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
};

export default SidebarLayout;