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
    <div className="relative flex min-h-screen items-center justify-center bg-[#ecf7f2] px-4 py-8 sm:py-12">
      <div className="relative z-10 w-full max-w-[440px] rounded-[32px] bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b4d3e] shadow-sm">
            <FontAwesomeIcon icon={faWallet} className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">DompetKu</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
                Email <FontAwesomeIcon icon={faEnvelope} className="ml-1 text-gray-700" />
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4d3e] transition-shadow"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
                Password <FontAwesomeIcon icon={faLock} className="ml-1 text-gray-700" />
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d3e] hover:bg-[#153b2f] px-4 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-70"
            >
              {loading ? (
                <FontAwesomeIcon icon={faCircleNotch} spin />
              ) : (
                <>
                  Masuk Sekarang
                  <FontAwesomeIcon icon={faPaperPlane} className="text-xs ml-1" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-center text-xs font-semibold text-black">Masukkan 6 Digit OTP</label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <OtpInput value={code} onChange={setCode} isError={error !== ''} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d3e] hover:bg-[#153b2f] px-4 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-70"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Verifikasi & Masuk
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-sm font-bold text-[#1b4d3e] transition-colors duration-300 hover:underline disabled:text-gray-400"
              >
                {resendCooldown > 0 ? `Kirim ulang OTP dalam ${resendCooldown}s` : 'Kirim Ulang OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-gray-150 pt-5">
          <div className="mb-4 text-center">
            <Link to="/forgot-password" className="text-xs font-semibold text-[#1b4d3e] transition-all hover:underline">
              Lupa Password?
            </Link>
          </div>
          <p className="text-center text-xs text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-[#1b4d3e] transition-all hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}