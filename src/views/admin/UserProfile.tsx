import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getProfile, updateUser, deleteUser } from '../../api/services/user.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { UserProfileResponse, UserUpdateRequest } from '../../types/user.types';
import { toast } from 'sonner';

const UserProfile = () => {
  const { user: authUser, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState<UserProfileResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  // ── Formulario de datos ──
  const [form, setForm] = useState<UserUpdateRequest>({
    name:  '',
    email: '',
  });

  // ── Modal contraseña ──
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ── Modal eliminar cuenta ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Carga inicial ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Guardar datos personales ──
  const handleSave = async () => {
    setSaving(true);
    try {
        const updated = await updateUser({ name: form.name, email: form.email });
        setProfile(updated);
        toast.success('Perfil actualizado correctamente');
        setUser((prev) => ({
            ...prev!,
            name: updated.name,
            email: updated.email
        }));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Cambiar contraseña ──
  const handlePasswordSave = async () => {
    setPasswordError(null);
    
    if (!passwords.password || !passwords.confirm) {
      toast.error('Completa ambos campos.');
      return;
    }

    if (passwords.password !== passwords.confirm) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (passwords.password.length < 6) {
      toast.error('Mínimo 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await updateUser({ password: passwords.password });

      setShowPasswordModal(false);

      setPasswords({ password: '', confirm: '' });

      toast.success('Contraseña actualizada correctamente');

    } catch (err: unknown) {
        toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar cuenta ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUser();
      logout();
      navigate('/login');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      setShowDeleteModal(false);
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : authUser?.name?.[0]?.toUpperCase() ?? '?';

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
      <Icon icon="solar:refresh-linear" width={28} className="animate-spin" />
      <p className="text-sm">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-24">

      {/* ── Título ── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Configuraciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu perfil y cuenta</p>
      </div>

      {/* ── Alertas ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lighterror text-error text-sm font-medium">
          <Icon icon="solar:danger-triangle-bold" width={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><Icon icon="solar:close-linear" width={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lightsuccess text-success text-sm font-medium">
          <Icon icon="solar:check-circle-bold" width={18} className="flex-shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)}><Icon icon="solar:close-linear" width={14} /></button>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="flex items-center gap-5 p-6 bg-card border border-border rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center
                        text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{profile?.name ?? '—'}</p>
          <p className="text-sm text-muted-foreground">{profile?.email ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Miembro desde {formatDate(profile?.created_at)}
          </p>
        </div>
      </div>

      {/* ── Grid: datos + seguridad ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Datos personales */}
        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Información personal</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Actualiza tu nombre y correo</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white
                         text-sm font-semibold hover:bg-primaryemphasis transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon icon="solar:diskette-linear" width={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-background
                           text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-border bg-background
                           text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Seguridad</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Gestiona tu contraseña y cuenta</p>
          </div>

          {/* Cambiar contraseña */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lightprimary flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:lock-password-linear" width={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Contraseña</p>
                <p className="text-xs text-muted-foreground">Cambia tu contraseña de acceso</p>
              </div>
            </div>
            <button
              onClick={() => { setShowPasswordModal(true); setPasswordError(null); }}
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold
                         text-foreground hover:bg-muted transition-colors"
            >
              Cambiar
            </button>
          </div>

          {/* Eliminar cuenta */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-lighterror">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lighterror flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:trash-bin-trash-linear" width={18} className="text-error" />
              </div>
              <div>
                <p className="text-sm font-semibold text-error">Eliminar cuenta</p>
                <p className="text-xs text-muted-foreground">Esta acción es irreversible</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-lighterror text-error text-sm font-semibold
                         hover:bg-error hover:text-white transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal contraseña ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg mx-4">
            <h3 className="text-lg font-bold text-foreground mb-1">Cambiar contraseña</h3>
            <p className="text-sm text-muted-foreground mb-5">Introduce tu nueva contraseña</p>

            {passwordError && (
              <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl
                              bg-lighterror text-error text-sm">
                <Icon icon="solar:danger-circle-bold" width={16} />
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="px-3 py-2.5 rounded-xl border border-border bg-background
                             text-foreground text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Repite la contraseña"
                  className="px-3 py-2.5 rounded-xl border border-border bg-background
                             text-foreground text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold
                           text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold
                           hover:bg-primaryemphasis transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal eliminar cuenta ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-lg mx-4">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-lighterror flex items-center justify-center">
                <Icon icon="solar:danger-triangle-bold" width={24} className="text-error" />
              </div>
              <h3 className="text-lg font-bold text-foreground">¿Eliminar cuenta?</h3>
              <p className="text-sm text-muted-foreground">
                Se eliminarán todos tus datos permanentemente. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold
                           text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold
                           hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;