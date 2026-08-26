import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faXmark } from '@fortawesome/free-solid-svg-icons';
import PasswordInput from '../../components/PasswordInput';
import api from '../../api/axios';
import ModalPortal from '../../components/ModalPortal';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/reset-password`, { password });
      setSuccess('Password berhasil direset.');
      showToast('Password berhasil direset.', 'success');
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password.');
      showToast(err.response?.data?.message || 'Gagal reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Reset Password @{user.username}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

        {error && <div className="text-sm text-expense bg-expense/10 px-4 py-2 rounded-lg mb-4">{error}</div>}
        {success && <div className="text-sm text-income bg-income/10 px-4 py-2 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Password Baru</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-income hover:bg-income/90 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
