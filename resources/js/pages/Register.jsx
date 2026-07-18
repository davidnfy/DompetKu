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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#f6fff7_0%,_#eef8f0_35%,_#f7fbf8_100%)] px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-[#78b98d]/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#2d6b49]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[480px] animate-fade-in rounded-[32px] border border-[#e4efe7] bg-white/95 p-8 shadow-[0_24px_70px_rgba(31,63,45,0.12)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f6b49] to-[#74b67c] shadow-[0_16px_36px_rgba(47,107,73,0.24)]">
            <FontAwesomeIcon icon={faWallet} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-semibold text-[#18372b]">Buat Akun Baru</h1>
          <p className="mt-2 text-sm leading-6 text-[#6d7a72]">
            {step === 1 ? 'Mulai mengelola keuangan Anda hari ini dengan akun yang aman.' : `Verifikasi OTP yang dikirim ke ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#f2d5d9] bg-[#fff5f7] px-4 py-3 text-sm font-medium text-[#b13b4f] animate-fade-in">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">Nama Lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8aa08f]">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
                  placeholder="Tulis nama lengkap"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
                placeholder="Buat username unik"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">Alamat Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#8aa08f]">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
                  placeholder="example@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#274d37]">Konfirmasi Password</label>
              <PasswordInput
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Konfrimasi password"
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
                  Daftar & Kirim OTP
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyRegister} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-semibold text-[#6d7a72] transition-colors duration-300 hover:text-[#274d37]"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Kembali
            </button>

            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-[#274d37]">Masukkan 6 Digit OTP</label>
              <OtpInput value={code} onChange={setCode} isError={error !== ''} />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f6b49] to-[#74b67c] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,73,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(47,107,73,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Verifikasi & Daftarkan Akun
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendOtp}
                className="text-sm font-medium text-[#2f6b49] transition-colors duration-300 hover:text-[#274d37] hover:underline disabled:text-[#95a29b]"
              >
                {resendCooldown > 0 ? `Kirim ulang OTP dalam ${resendCooldown}s` : 'Kirim Ulang OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-[#ebf2ec] pt-6">
          <p className="text-center text-sm font-medium text-[#6d7a72]">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-[#2f6b49] underline-offset-4 transition-all duration-300 hover:text-[#274d37] hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

