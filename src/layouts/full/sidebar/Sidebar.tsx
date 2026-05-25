import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import adminItems, { type MenuItem, type ChildItem } from '../sidebar/itemSidebar';
import FullLogo from '../../logo/FullLogo';
import '../../css/sidebar.css';
import { useAuth } from '../../../context/authContext';
import { useEffect, useState } from 'react';
import type { InvoiceFullRead } from '../../../types/invoice.type';
import { listInvoices } from '../../../api/services/invoice.service';

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const { pathname } = useLocation();
  const { logout }   = useAuth();
  const navigate     = useNavigate();

  const [recentInvoices, setRecentInvoices] = useState<InvoiceFullRead[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // ── Cargar facturas al montar el componente ──
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const invoices = await listInvoices();
        // Toma las últimas 5 facturas
        setRecentInvoices(invoices.slice(0, 5));
      } catch (error) {
        console.error('Error loading invoices:', error);
        setRecentInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    // ── Obtener color según estado ──
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '#10b981'; // Verde
      case 'PENDING':
        return '#f59e0b'; // Amarillo/Naranja
      case 'REJECTED':
        return '#ef4444'; // Rojo
      default:
        return '#6b7280'; // Gris
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'Aprobado';
      case 'PENDING':
        return 'Pendiente';
      case 'REJECTED':
        return 'Rechazado';
      default:
        return status;
    }
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

      {/* ── FACTURAS PROCESADAS ── */}
      {!loadingInvoices && recentInvoices.length > 0 && (
        <div className="sidebar-invoices">
          <div className="sidebar-invoices-header">
            <h3 className="sidebar-invoices-title">FACTURAS PROCESADAS</h3>
            <Link 
              to="/admin/historial-facturas" 
              onClick={onClose}
              className="sidebar-invoices-link"
              title="Ver todas"
            >
              <Icon icon="solar:arrow-right-linear" width={16} />
            </Link>
          </div>

          <div className="sidebar-invoices-list">
            {recentInvoices.map((invoice) => (
              <button
                key={invoice.invoice.id}
                onClick={() => {
                  navigate(`/admin/detalles-factura/${invoice.invoice.id}`);
                  onClose?.();
                }}
                className="sidebar-invoice-item"
              >
                {/* Status indicator */}
                <span 
                  className="sidebar-invoice-status"
                  style={{ backgroundColor: getStatusColor(invoice.invoice.status) }}
                  title={getStatusLabel(invoice.invoice.status)}
                />

                {/* Provider name */}
                <div className="sidebar-invoice-content">
                  <p className="sidebar-invoice-provider">{invoice.provider.name}</p>
                  <p className="sidebar-invoice-number">
                    #{invoice.invoice.invoice_number}
                  </p>
                </div>

                {/* Menu icon */}
                <span className="sidebar-invoice-menu">
                  <Icon icon="solar:menu-dots-bold" width={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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