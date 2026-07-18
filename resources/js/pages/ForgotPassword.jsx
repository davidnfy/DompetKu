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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#f6fff7_0%,_#eef8f0_35%,_#f7fbf8_100%)] px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-[#78b98d]/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#2d6b49]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[480px] animate-fade-in rounded-[32px] border border-[#e4efe7] bg-white/95 p-8 shadow-[0_24px_70px_rgba(31,63,45,0.12)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f6b49] to-[#74b67c] shadow-[0_16px_36px_rgba(47,107,73,0.24)]">
            <FontAwesomeIcon icon={faKey} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-semibold text-[#18372b]">Lupa Password</h1>
          <p className="mt-2 text-sm leading-6 text-[#6d7a72]">
            {step === 1 ? 'Masukkan email akun Anda yang terdaftar' : `Buat password baru untuk ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#f2d5d9] bg-[#fff5f7] px-4 py-3 text-sm font-medium text-[#b13b4f] animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl border border-[#d1fae0] bg-[#ecfdf5] px-4 py-3 text-sm font-medium text-[#065f46] animate-fade-in flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} /> {success}
          </div>
        )}

        {step === 1 && !success && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-[#274d37] mb-2 block">
                Email
                <FontAwesomeIcon icon={faEnvelope} className="ml-2 text-[#8aa08f]" />
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
                placeholder="example@email.com"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
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
              className="flex items-center gap-1 text-xs font-semibold text-[#6d7a72] transition-colors duration-300 hover:text-[#274d37]"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Kembali
            </button>

            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-[#274d37]">Masukkan 6 Digit OTP</label>
              <div className="rounded-[24px] border border-[#e7f0e8] bg-[#f7fcf8] p-4">
                <OtpInput value={code} onChange={setCode} isError={error !== ''} />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
                Verifikasi Kode
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-sm font-medium text-[#2f6b49] transition-colors duration-300 hover:text-[#274d37] disabled:text-[#95a29b]"
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
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Kembali ke Verifikasi
            </button>

            <div>
              <label className="text-sm font-semibold text-[#274d37] mb-2 block">
                Password Baru
                <FontAwesomeIcon icon={faLock} className="ml-2 text-[#8aa08f]" />
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#274d37] mb-2 block">
                Konfirmasi Password Baru
                <FontAwesomeIcon icon={faLock} className="ml-2 text-[#8aa08f]" />
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
              className="w-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] hover:from-[#2f6b49] hover:to-[#74b67c] text-white text-sm font-semibold py-3.5 rounded-full shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Reset Password
            </button>
          </form>
        )}

        <div className="border-t border-[#ebf2ec] mt-8 pt-6">
          <p className="text-sm text-[#6d7a72] text-center font-medium">
            Ingat password Anda?{' '}
            <Link to="/login" className="font-semibold text-[#2f6b49] hover:text-[#274d37] transition-colors">
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}