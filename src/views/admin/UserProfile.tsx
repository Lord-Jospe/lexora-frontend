import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getProfile, updateUser, deleteUser } from '../../api/services/user.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { UserProfileResponse, UserUpdateRequest } from '../../types/user.types';
import { toast } from 'sonner';

// ── Clases reutilizables ──────────────────────────────────────────────────────

const inputCls = `
  px-3 py-2.5 rounded-xl text-sm outline-none transition-colors
  border-2 border-gray-300 dark:border-gray-600
  bg-background text-foreground
  focus:border-violet-500 dark:focus:border-violet-400
`;

const btnPrimary = `
  flex items-center gap-2 px-5 py-2.5 rounded-xl
  bg-violet-500 text-white text-sm font-semibold
  hover:bg-violet-600 shadow-btn-shadow
  transition-all duration-200 cursor-pointer
  disabled:opacity-60 disabled:cursor-not-allowed
`;

const btnOutline = `
  px-5 py-2.5 rounded-xl text-sm font-semibold
  border-2 border-gray-300 dark:border-gray-600
  text-foreground hover:bg-muted transition-colors cursor-pointer
`;

// ─────────────────────────────────────────────────────────────────────────────

const UserProfile = () => {
  const { user: authUser, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const [form, setForm] = useState<UserUpdateRequest>({ name: '', email: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUser({ name: form.name, email: form.email });
      setProfile(updated);
      setUser((prev) => ({ ...prev!, name: updated.name, email: updated.email }));
      toast.success('Perfil actualizado correctamente');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError(null);
    if (!passwords.password || !passwords.confirm) {
      setPasswordError('Completa ambos campos.');
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (passwords.password.length < 6) {
      setPasswordError('Mínimo 6 caracteres.');
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
        <p className="text-base text-muted-foreground mt-1">Gestiona tu perfil y cuenta</p>
      </div>

      {/* ── Header card ── */}
      <div className="flex items-center gap-5 p-6 bg-card border-2 border-gray-300 dark:border-gray-700 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center
                        text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{profile?.name ?? '—'}</p>
          <p className="text-base text-muted-foreground">{profile?.email ?? '—'}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Miembro desde {formatDate(profile?.created_at)}
          </p>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Datos personales */}
        <div className="p-6 bg-card border-2 border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Información personal</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Actualiza tu nombre y correo</p>
          </div>
 
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-foreground">Nombre</label>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-foreground">Correo electrónico</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
 
          <div className="flex justify-end pt-10">
            <button onClick={handleSave} disabled={saving} className={btnPrimary}>
              <Icon icon="solar:diskette-linear" width={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>


        {/* Seguridad */}
        <div className="p-6 bg-card border-2 border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Seguridad</h2>
            <p className="text-sm font-semibold text-muted-foreground mt-0.5">Gestiona tu contraseña y cuenta</p>
          </div>

          {/* Contraseña */}
          <div className="flex items-center justify-between p-4 rounded-xl
                          border-2 border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30
                              flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:lock-password-linear" width={20} className="text-violet-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Contraseña</p>
                <p className="text-sm text-muted-foreground">Cambia tu contraseña de acceso</p>
              </div>
            </div>
            <button
              onClick={() => { setShowPasswordModal(true); setPasswordError(null); }}
              className="px-4 py-2 rounded-xl border border-border text-base font-semibold font-semibold
                         text-foreground hover:bg-muted transition-colors"
            >
              Cambiar
            </button>
          </div>

          {/* Eliminar cuenta */}
          <div className="flex items-center justify-between p-4 rounded-xl
                          border-2 border-red-200 dark:border-red-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lighterror flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:trash-bin-trash-linear" width={20} className="text-error" />
              </div>
              <div>
                <p className="text-base font-semibold text-error">Eliminar cuenta</p>
                <p className="text-sm text-muted-foreground">Esta acción es irreversible</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-lighterror text-error text-base font-semibold font-semibold
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
          <div className="w-full max-w-md bg-card border-2 border-gray-300 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <h3 className="text-xl font-bold text-foreground mb-1">Cambiar contraseña</h3>
            <p className="text-base text-muted-foreground mb-4">Introduce tu nueva contraseña</p>

            {passwordError && (
              <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl
                              bg-lighterror text-error text-sm border-2 border-red-200">
                <Icon icon="solar:danger-circle-bold" width={16} />
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-foreground">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold text-foreground">Confirmar contraseña</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Repite la contraseña"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <button onClick={() => setShowPasswordModal(false)} className={btnOutline}>
                Cancelar
              </button>
              <button onClick={handlePasswordSave} disabled={saving} className={btnPrimary}>
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal eliminar cuenta ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm bg-card border-2 border-gray-300 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-lighterror flex items-center justify-center">
                <Icon icon="solar:danger-triangle-bold" width={24} className="text-error" />
              </div>
              <h3 className="text-xl font-bold text-foreground">¿Eliminar cuenta?</h3>
              <p className="text-base text-muted-foreground">
                Se eliminarán todos tus datos permanentemente. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className={`flex-1 ${btnOutline}`}>
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-error text-white text-sm font-semibold
                           hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
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