import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCircleNotch, faCheck, faEnvelope, faLock, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OtpInput from '../components/OtpInput';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPassword() {
  const { sendOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Masukkan alamat email Anda.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email, 'reset');
      if (res.debug_code) {
        showToast(`OTP dikirim (Local Mode): ${res.debug_code}`, 'info', 7000);
      } else {
        showToast('Kode OTP berhasil dikirim ke email Anda.', 'success');
      }
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Email tidak terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e && e.preventDefault();
    setError('');

    if (!code) {
      setError('Masukkan kode OTP terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/verify-reset-code', { email, code });
      setResetToken(res.data.token);
      setStep(3);
      showToast('Kode terverifikasi. Silakan masukkan password baru.', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Verifikasi kode gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !passwordConfirmation) {
      setError('Mohon lengkapi seluruh field.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password minimal 8 karakter dan mengandung huruf serta angka.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password', {
        email,
        token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess('Password berhasil direset! Mengarahkan ke halaman login...');
      showToast('Password berhasil diperbarui.', 'success');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset password. Pastikan token masih valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#ecf7f2] px-4 py-8 sm:py-12">
      <div className="relative z-10 w-full max-w-[440px] rounded-[32px] bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b4d3e] shadow-sm">
            <FontAwesomeIcon icon={faKey} className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Lupa Password</h1>
          <p className="mt-2 text-xs text-gray-500">
            {step === 1 ? 'Masukkan email akun Anda yang terdaftar' : `Buat password baru untuk ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} /> {success}
          </div>
        )}

        {step === 1 && !success && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-black mb-2 block">
                Email <FontAwesomeIcon icon={faEnvelope} className="ml-1 text-gray-700" />
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4d3e] transition-shadow"
                placeholder="example@gmail.com"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d3e] hover:bg-[#153b2f] px-4 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-70"
            >
              {loading ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Kirim OTP Reset Password'}
            </button>
          </form>
        )}

        {step === 2 && !success && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-bold text-gray-600 transition-colors hover:text-black"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Kembali
            </button>

            <div>
              <label className="mb-2 block text-center text-xs font-semibold text-black">Masukkan 6 Digit OTP</label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <OtpInput value={code} onChange={setCode} isError={error !== ''} />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1b4d3e] hover:bg-[#153b2f] px-4 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-70"
              >
                {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                Verifikasi Kode
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-sm font-bold text-[#1b4d3e] transition-colors duration-300 hover:underline disabled:text-gray-400"
                >
                  {resendCooldown > 0 ? `Kirim ulang OTP dalam ${resendCooldown}s` : 'Kirim Ulang OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && !success && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Kembali ke Verifikasi
            </button>

            <div>
              <label className="text-xs font-semibold text-black mb-2 block">
                Password Baru <FontAwesomeIcon icon={faLock} className="ml-1 text-gray-700" />
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-black mb-2 block">
                Konfirmasi Password Baru <FontAwesomeIcon icon={faLock} className="ml-1 text-gray-700" />
              </label>
              <PasswordInput
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password baru"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b4d3e] hover:bg-[#153b2f] text-white text-sm font-bold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Reset Password
            </button>
          </form>
        )}

        <div className="border-t border-gray-150 mt-6 pt-5">
          <p className="text-xs text-gray-500 text-center">
            Ingat password anda?{' '}
            <Link to="/login" className="font-bold text-[#1b4d3e] transition-all hover:underline">
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}