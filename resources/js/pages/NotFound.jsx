import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faHouse, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <FontAwesomeIcon icon={faWallet} style={{ fontSize: '14px', color: '#fff' }} />
        </div>
        <span style={styles.logoText}>DompetKu</span>
      </div>

      {/* 404 */}
      <div style={styles.code}>404</div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Heading & description */}
      <h1 style={styles.heading}>Halaman Tidak Ditemukan</h1>
      <p style={styles.description}>
        URL yang kamu akses tidak tersedia atau sudah dipindahkan.
        <br />
        Kembali ke halaman utama.
      </p>

      {/* URL badge */}
      <div style={styles.urlBadge}>
        <span style={styles.urlLabel}>URL</span>
        <span style={styles.urlPath}>{window.location.pathname}</span>
      </div>

      {/* Buttons */}
      <div style={styles.actions}>
        <button
          id="btn-back"
          onClick={() => navigate(-1)}
          style={styles.btnSecondary}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.btnSecondaryHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.btnSecondary)}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '11px' }} />
          Kembali
        </button>

        <button
          id="btn-dashboard"
          onClick={() => navigate('/dashboard')}
          style={styles.btnPrimary}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.btnPrimaryHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.btnPrimary)}
        >
          <FontAwesomeIcon icon={faHouse} style={{ fontSize: '11px' }} />
          Ke Dashboard
        </button>
      </div>

      {/* Footer */}
      <p style={styles.footer}>Error 404 · Page Not Found</p>
    </div>
  );
}

const BASE_BTN = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  flex: 1,
  padding: '10px 20px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    textAlign: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '40px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #1b4d3e, #2d7a5f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.02em',
  },
  code: {
    fontSize: 'clamp(96px, 20vw, 156px)',
    fontWeight: 900,
    lineHeight: 1,
    color: '#e2e8f0',
    letterSpacing: '-0.04em',
    userSelect: 'none',
    marginBottom: '12px',
  },
  divider: {
    width: '40px',
    height: '3px',
    borderRadius: '999px',
    background: '#1b4d3e',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 8px 0',
    letterSpacing: '-0.01em',
  },
  description: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: '0 0 24px 0',
    maxWidth: '320px',
  },
  urlBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '32px',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  urlLabel: {
    fontSize: '10px',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#f87171',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  urlPath: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#ef4444',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    width: '100%',
    maxWidth: '360px',
  },
  btnSecondary: {
    ...BASE_BTN,
    background: '#fff',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  btnSecondaryHover: {
    ...BASE_BTN,
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#1e293b',
  },
  btnPrimary: {
    ...BASE_BTN,
    background: '#1b4d3e',
    border: '1px solid #1b4d3e',
    color: '#fff',
  },
  btnPrimaryHover: {
    ...BASE_BTN,
    background: '#153b2f',
    border: '1px solid #153b2f',
    color: '#fff',
  },
  footer: {
    marginTop: '40px',
    fontSize: '11px',
    color: '#cbd5e1',
  },
};
