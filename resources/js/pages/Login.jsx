import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCircleNotch, faEnvelope, faPaperPlane, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OtpInput from '../components/OtpInput';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { sendOtp, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
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

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const isAdminLogin = email.trim().toLowerCase() === 'mail.dompetku@gmail.com';

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');

    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
      return;
    }

    if (!password) {
      setError('Password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      // If server returned token, login complete
      if (res.token) {
        showToast('Berhasil masuk. Selamat datang kembali.', 'success');
        navigate('/dashboard');
        return;
      }

      // No token => OTP was sent, proceed to OTP step
      if (res.message) {
        showToast('Kode OTP berhasil dikirim ke email Anda.', 'info');
        if (res.debug_code) console.log('OTP Debug Code:', res.debug_code);
      }
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Email tidak terdaftar atau salah.');
      } else if (status === 401) {
        setError('Password salah.');
      } else {
        setError(err.response?.data?.message || 'Login gagal.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const r = await sendOtp(email, 'login');
      showToast('Kode OTP berhasil dikirim ke email Anda.', 'info');
      if (r.debug_code) console.log('OTP Debug Code:', r.debug_code);
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError('Email tidak terdaftar atau salah.');
      else setError(err.response?.data?.message || 'Gagal mengirim OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Kode OTP harus 6 digit.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, code);
      showToast('Berhasil masuk! Selamat datang kembali.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verifikasi gagal. Kode OTP salah.');
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
            <svg viewBox="0 0 64 64" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6Z" />
              <path d="M24 24h16" />
              <path d="M28 30h8" />
              <path d="M26 36h12" />
              <path d="M22 10v-2" />
              <path d="M42 10v-2" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-[#18372b]">Masuk ke DompetKu</h1>

        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#f2d5d9] bg-[#fff5f7] px-4 py-3 text-sm font-medium text-[#b13b4f] animate-fade-in">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">
                Email
                <FontAwesomeIcon icon={faEnvelope} className="ml-2 text-[#8aa08f]" />
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">
                Password 
                <FontAwesomeIcon icon={faLock} className="ml-2 text-[#8aa08f]" />
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={email.trim().toLowerCase() === 'mail.dompetku@gmail.com' ? 'Masukkan password admin' : 'Masukan Password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(47,107,73,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <FontAwesomeIcon icon={faCircleNotch} spin />
              ) : (
                <>
                  {isAdminLogin ? 'Masuk Sekarang' : 'Masuk Sekarang'}
                  <FontAwesomeIcon icon={faPaperPlane} className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-[#274d37]">Masukkan 6 Digit OTP</label>
              <div className="rounded-[24px] border border-[#e7f0e8] bg-[#f7fcf8] p-4">
                <OtpInput value={code} onChange={setCode} isError={error !== ''} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(47,107,73,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Verifikasi & Masuk
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-sm font-medium text-[#2f6b49] transition-colors duration-300 hover:text-[#274d37] hover:underline disabled:text-[#95a29b]"
              >
                {resendCooldown > 0 ? `Kirim ulang OTP dalam ${resendCooldown}s` : 'Kirim Ulang OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-[#ebf2ec] pt-6">
          <div className="mb-3 text-center">
            <Link to="/forgot-password" className="text-sm font-semibold text-[#2f6b49] underline-offset-4 transition-all duration-300 hover:text-[#274d37] hover:underline">
              Lupa password?
            </Link>
          </div>
          <p className="text-center text-sm font-medium text-[#6d7a72]">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-[#2f6b49] underline-offset-4 transition-all duration-300 hover:text-[#274d37] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}