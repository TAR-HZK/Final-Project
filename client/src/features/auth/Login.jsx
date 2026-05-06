import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from './authSlice';

const ForgePattern = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="forge-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <polygon points="30,4 56,30 30,56 4,30" fill="none" stroke="#C5A059" strokeWidth="0.8" />
        <circle cx="30" cy="30" r="1.5" fill="#C5A059" />
        <circle cx="0"  cy="0"  r="1" fill="#C5A059" />
        <circle cx="60" cy="0"  r="1" fill="#C5A059" />
        <circle cx="0"  cy="60" r="1" fill="#C5A059" />
        <circle cx="60" cy="60" r="1" fill="#C5A059" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#forge-pattern)" />
  </svg>
);

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) navigate('/dashboard');
    dispatch(reset());
  }, [user, isError, isSuccess, navigate, dispatch]);

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#1A120E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ fontSize: '1.875rem', color: '#C5A059', letterSpacing: '0.15em' }}>
          Consulting the Archives…
        </h1>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'row',
      fontFamily: 'Georgia, "Times New Roman", serif',
      background: '#1A120E', overflow: 'hidden',
      height: '100vh',
    }}>

      {/* LEFT */}
      <div style={{
        width: '40%', height: '100vh', flexShrink: 0,
        background: '#1A120E',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2.5rem', position: 'relative', overflow: 'hidden',
      }}>
        <ForgePattern />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(139,90,43,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', right: 0, top: 0, height: '100%', width: '1px',
          background: 'linear-gradient(to bottom, transparent 0%, #5C4033 30%, #5C4033 70%, transparent 100%)',
          opacity: 0.4,
        }} />

        <div style={{
          width: '6.5rem', height: '6.5rem', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #5C4033',
          background: 'radial-gradient(circle at 40% 35%, #2C221B, #1A120E)',
          boxShadow: '0 0 48px rgba(139,90,43,0.22), inset 0 1px 0 rgba(197,160,89,0.1)',
          marginBottom: '1.75rem', position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontSize: '3rem' }}>⚒️</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.6rem, 2.8vw, 2.8rem)', fontWeight: 800,
          color: '#E8DCC4', letterSpacing: '0.25em', textAlign: 'center',
          marginBottom: '1rem', textShadow: '0 2px 24px rgba(197,160,89,0.15)',
          position: 'relative', zIndex: 1,
        }}>
          BUILDFORGE
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ height: '1px', width: '2.5rem', background: 'linear-gradient(to right, transparent, #5C4033)' }} />
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8B5A2B' }} />
          <div style={{ height: '1px', width: '2.5rem', background: 'linear-gradient(to left, transparent, #5C4033)' }} />
        </div>

        <p style={{ color: '#7A6F63', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', maxWidth: '200px', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>
          "Theory-craft, share, and conquer."
        </p>
      </div>

      {/* RIGHT */}
      <div style={{
        width: '60%', height: '100vh', flexShrink: 0,
        position: 'relative',
        overflowY: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', // Flexbox handles the centering
        background: 'linear-gradient(160deg, #CBAC72 0%, #D6BA88 25%, #C2A06A 50%, #CEAF7B 75%, #BF9D65 100%)',
      }}>
        <img
          src="/parchment.jpg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(26,18,14,0.32) 100%)',
          pointerEvents: 'none',
        }} />

        {/* THE FIX: Removed position: 'absolute', top, left, and transform */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: 'calc(100% - 4rem)',
          maxWidth: '420px',
          background: 'rgba(244, 235, 208, 0.94)',
          border: '1px solid rgba(139, 90, 43, 0.5)',
          borderRadius: '2px',
          padding: '2.5rem 2.5rem',
          boxShadow: '0 4px 6px rgba(26,18,14,0.06), 0 16px 48px rgba(26,18,14,0.22)',
        }}>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.875rem)', fontWeight: 800, color: '#2C1A10', marginBottom: '1rem' }}>
              Enter the Realm
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,90,43,0.3)' }} />
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(139,90,43,0.5)' }} />
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,90,43,0.3)' }} />
            </div>
          </div>

          {isError && (
            <div style={{
              background: 'rgba(107,0,0,0.88)', color: '#F4EBD0',
              padding: '0.75rem 1rem', textAlign: 'center',
              border: '1px solid #3D0000', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '1.5rem', borderRadius: '2px',
            }}>
              {message || 'The gates remain closed.'}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A2618' }}>
                Traveler's Email
              </label>
              <input
                type="email" name="email" value={email} onChange={onChange} required
                placeholder="strider@gondor.com"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem',
                  background: '#EDE3CB', border: '1px solid rgba(160,120,72,0.55)',
                  color: '#2C221B', fontSize: '0.9rem', fontFamily: 'Georgia, serif', outline: 'none',
                  WebkitBoxShadow: '0 0 0px 1000px #EDE3CB inset', WebkitTextFillColor: '#2C221B',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A2618' }}>
                Secret Passphrase
              </label>
              <input
                type="password" name="password" value={password} onChange={onChange} required
                placeholder="Speak friend and enter…"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem',
                  background: '#EDE3CB', border: '1px solid rgba(160,120,72,0.55)',
                  color: '#2C221B', fontSize: '0.9rem', fontFamily: 'Georgia, serif', outline: 'none',
                  WebkitBoxShadow: '0 0 0px 1000px #EDE3CB inset', WebkitTextFillColor: '#2C221B',
                }}
              />
            </div>
          </div>

          <button
            onClick={onSubmit}
            style={{
              width: '100%', marginTop: '2rem', padding: '0.875rem',
              background: '#2C1A10', color: '#F4EBD0',
              border: '1px solid #1A120E', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'Georgia, serif', borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(26,18,14,0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3D2615')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2C1A10')}
          >
            Unlock the Gates
          </button>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.82rem', color: '#5C4033', fontWeight: 600 }}>
            A new traveler?{' '}
            <Link to="/register" style={{ color: '#8B0000', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Inscribe your name
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;