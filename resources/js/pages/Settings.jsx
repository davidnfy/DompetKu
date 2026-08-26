import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faCheck, faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AppLayout from '../components/AppLayout';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    setProfileLoading(true);
    try {
      const { data } = await api.put('/profile', { name, username, email });
      updateUser(data.user);
      setProfileSuccess('Profil berhasil diperbarui.');
      showToast('Profil Anda berhasil diperbarui.', 'success');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil.');
      showToast('Gagal memperbarui profil.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/profile/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setPasswordSuccess('Password berhasil diganti.');
      showToast('Password berhasil diganti.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengganti password.');
      showToast('Gagal mengganti password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#1b4d3e]">Pengaturan</h1>

        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-emerald-700 text-sm" />
            </span>
            <h2 className="text-sm font-bold text-gray-700">Informasi Profil</h2>
          </div>

          {profileError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} /> {profileSuccess}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/20 transition-all font-medium"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/20 transition-all font-medium"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Alamat Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/20 transition-all font-medium"
                placeholder="Masukkan email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-[#1b4d3e] hover:bg-[#153b2f] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {profileLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
            Simpan Profil
          </button>
        </form>

        <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="text-red-700 text-sm" />
            </span>
            <h2 className="text-sm font-bold text-gray-700">Ganti Password</h2>
          </div>

          {passwordError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} /> {passwordSuccess}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Password Saat Ini</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password lama"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Password Baru</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Konfirmasi Password Baru</label>
            <PasswordInput
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-[#1b4d3e] hover:bg-[#153b2f] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {passwordLoading && <FontAwesomeIcon icon={faCircleNotch} spin />}
            Ganti Password
          </button>
        </form>
      </div>
    </AppLayout>
  );
}