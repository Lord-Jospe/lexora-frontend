import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import adminItems, { type MenuItem, type ChildItem } from '../sidebar/itemSidebar';
import FullLogo from '../../logo/FullLogo';
import '../../css/sidebar.css';
import { useAuth } from '../../../context/authContext';
import { useEffect, useState } from 'react';
import type { InvoiceFullRead } from '../../../types/invoice.type';
import { getRecentInvoices } from '../../../api/services/invoice.service';

const STATUS_COLORS: Record<string, string> = {
  PROCESSED: '#10b981',
  APPROVED:  '#10b981',
  PENDING:   '#f59e0b',
  ERROR:     '#ef4444',
  REJECTED:  '#ef4444',
};

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const { pathname } = useLocation();
  const { logout, user }   = useAuth();
  const navigate     = useNavigate();

  const [recentInvoices, setRecentInvoices]     = useState<InvoiceFullRead[]>([]);
  const [loadingInvoices, setLoadingInvoices]   = useState(true);

  // Cambio en el useEffect:
  useEffect(() => {
    let isMounted = true;

    const loadInvoices = async () => {
      if (!user?.id) return; 

      try {
        setLoadingInvoices(true);
        const invoices = await getRecentInvoices(user?.id || '', 5);
        if (isMounted) {
          setRecentInvoices(invoices);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        if (isMounted) {
          setRecentInvoices([]);
        }
      } finally {
        if (isMounted) {
          setLoadingInvoices(false);
        }
      }
    };

    loadInvoices();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar-root">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <Link to="/admin" onClick={onClose}>
          <FullLogo />
        </Link>
      </div>

      {/* ── Nav — todo dentro del mismo scroll ── */}
      <nav className="sidebar-nav">

        {/* Items estáticos del menú */}
        {adminItems.map((section: MenuItem, sectionIndex: number) => (
          <div key={sectionIndex}>
            {section.heading && (
              <p className="sidebar-heading">{section.heading}</p>
            )}
            {section.children?.map((item: ChildItem) => {
              const isActive = pathname === item.url ||
                (item.url !== '/admin' && pathname.startsWith(item.url ?? ''));
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

        {/* Facturas procesadas — como sección extra dentro del mismo nav */}
        {!loadingInvoices && recentInvoices.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {/* Heading igual que los demás */}
            <div className="sidebar-invoices-header">
              <p className="sidebar-heading" style={{ margin: 0 }}>
                Facturas Procesadas
              </p>
              <Link
                to="/admin/historial-facturas"
                onClick={onClose}
                className="sidebar-invoices-link"
                title="Ver todas"
              >
                <Icon icon="solar:arrow-right-linear" width={16} />
              </Link>
            </div>

            {/* Lista de facturas con el mismo estilo que los items */}
            <div className="sidebar-invoices-list">
              {recentInvoices.map((invoice) => (
                <button
                  key={invoice.invoice.id}
                  onClick={() => {
                    navigate(`/admin/historial-facturas/${invoice.invoice.id}`);
                    onClose?.();
                  }}
                  className="sidebar-invoice-item"
                >
                  <span
                    className="sidebar-invoice-status"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[invoice.invoice.status?.toUpperCase()] ?? '#6b7280',
                    }}
                  />
                  <div className="sidebar-invoice-content">
                    <p className="sidebar-invoice-provider">{invoice.provider.name}</p>
                    <p className="sidebar-invoice-number">#{invoice.invoice.invoice_number}</p>
                  </div>
                  <span className="sidebar-invoice-menu">
                    <Icon icon="solar:menu-dots-bold" width={16} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </nav>

      {/* ── Logout ── */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
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