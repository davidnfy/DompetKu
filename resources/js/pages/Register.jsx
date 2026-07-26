import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCircleNotch, faUser, faEnvelope, faCheck, faChevronRight, faChevronLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OtpInput from '../components/OtpInput';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const { sendOtp, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info & Send OTP, 2: Verify OTP
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [code, setCode] = useState('');
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

  useEffect(() => {
    if (name && step === 1) {
      const suggested = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      setUsername(suggested);
    }
  }, [name, step]);

  const validateEmail = (e) => {
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !password || !passwordConfirmation) {
      setError('Mohon lengkapi seluruh field.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
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
      const res = await sendOtp(email, 'register');
      if (res.debug_code) {
        showToast(`OTP dikirim (Local Mode): ${res.debug_code}`, 'info', 7000);
      } else {
        showToast('Kode OTP berhasil dikirim ke email Anda.', 'success');
      }
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Email atau username mungkin sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Kode OTP harus 6 digit.');
      return;
    }

    setLoading(true);
    try {
      await register(name, username, email, password, code);
      showToast('Registrasi sukses! Selamat bergabung.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Kode OTP salah atau kedaluwarsa.');
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
          <h1 className="text-2xl font-bold text-black">Buat Akun Baru</h1>
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
                Nama lengkap <FontAwesomeIcon icon={faUser} className="ml-1 text-gray-700" />
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4d3e] transition-shadow"
                placeholder="Tulis nama lengkap"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
                Username <FontAwesomeIcon icon={faUser} className="ml-1 text-gray-700" />
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4d3e] transition-shadow"
                placeholder="Buat username unik"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
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

            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
                Password <FontAwesomeIcon icon={faLock} className="ml-1 text-gray-700" />
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-black">
                Konfirmasi Password <FontAwesomeIcon icon={faLock} className="ml-1 text-gray-700" />
              </label>
              <PasswordInput
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Konfirmasi Password"
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
                  Daftar & Kirim OTP &gt;
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyRegister} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4d3e] hover:bg-[#153b2f] px-4 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-70"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Verifikasi & Daftarkan Akun
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
          </form>
        )}

        <div className="mt-6 border-t border-gray-150 pt-5">
          <p className="text-center text-xs text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-[#1b4d3e] transition-all hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

