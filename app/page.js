'use client';
import { useState } from 'react';

const GRADE_CONFIG = {
  Weak:      { color: '#ff4444', bg: 'rgba(255,68,68,0.1)',     label: 'Weak' },
  Average:   { color: '#ff9500', bg: 'rgba(255,149,0,0.1)',     label: 'Average' },
  Good:      { color: '#c8ff00', bg: 'rgba(200,255,0,0.1)',     label: 'Good' },
  Excellent: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',     label: 'Excellent' },
};

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const grade = score <= 25 ? 'Weak' : score <= 50 ? 'Average' : score <= 75 ? 'Good' : 'Excellent';
  const cfg = GRADE_CONFIG[grade];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={cfg.color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
          style={{ fill: cfg.color, fontSize: 28, fontFamily: "'Bebas Neue'", transform: 'rotate(90deg)', transformOrigin: '70px 70px', letterSpacing: 1 }}>
          {score}
        </text>
        <text x="70" y="90" textAnchor="middle" dominantBaseline="central"
          style={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'DM Mono'", transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>
          / 100
        </text>
      </svg>
      <div style={{
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        padding: '4px 16px', fontSize: 12,
        fontFamily: "'DM Mono'", letterSpacing: '0.15em', textTransform: 'uppercase'
      }}>
        {cfg.label}
      </div>
    </div>
  );
}

function DimBar({ dim }) {
  const pct = (dim.score / 20) * 100;
  const color = pct <= 25 ? '#ff4444' : pct <= 50 ? '#ff9500' : pct <= 75 ? '#c8ff00' : '#00ff88';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: "'Outfit'", fontSize: 13, fontWeight: 600, color: '#efefef' }}>{dim.dimension}</span>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color }}>{dim.score}/20</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color, borderRadius: 2,
          transition: 'width 0.8s ease', boxShadow: `0 0 8px ${color}60`
        }} />
      </div>
      <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{dim.feedback}</div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      background: copied ? 'rgba(200,255,0,0.15)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${copied ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
      color: copied ? '#c8ff00' : 'rgba(255,255,255,0.5)',
      padding: '7px 16px', fontSize: 11,
      fontFamily: "'DM Mono'", letterSpacing: '0.1em', textTransform: 'uppercase',
      cursor: 'pointer', transition: 'all 0.2s'
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); } else { setResult(data); }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#060606',
      fontFamily: "'Outfit', sans-serif", color: '#efefef',
      position: 'relative', overflowX: 'hidden'
    }}>
      {/* Noise */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.022,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ paddingTop: 72, paddingBottom: 56, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#c8ff00', border: '1px solid rgba(200,255,0,0.2)', padding: '5px 14px', marginBottom: 28
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8ff00', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Prompt Engineering Tool
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue'", fontSize: 'clamp(52px, 9vw, 96px)',
            letterSpacing: 3, lineHeight: 0.95, margin: '0 0 20px',
            color: '#efefef'
          }}>
            PROMPT<span style={{ color: '#c8ff00' }}>GRADE</span>
          </h1>
          <p style={{
            fontFamily: "'DM Mono'", fontSize: 14, fontWeight: 300,
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto'
          }}>
            Paste any prompt. Get a score, see exactly what is weak, and get a perfectly rewritten version in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.07)',
          padding: '36px', marginBottom: 4
        }}>
          <label style={{
            display: 'block', fontFamily: "'DM Mono'", fontSize: 11,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8ff00', marginBottom: 12
          }}>Your Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Paste the prompt you want to analyze..."
            rows={6}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#efefef',
              fontFamily: "'Outfit'", fontSize: 15, fontWeight: 300,
              padding: '16px', lineHeight: 1.7, resize: 'vertical',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.3)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.07)',
          borderTop: 'none', padding: '24px 36px 36px'
        }}>
          <label style={{
            display: 'block', fontFamily: "'DM Mono'", fontSize: 11,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 12
          }}>Extra Context <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>(optional — purpose, expected output, anything else)</span></label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. This is for a marketing email to startup founders. I want 3 subject line options, punchy and under 8 words each."
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', color: '#efefef',
              fontFamily: "'Outfit'", fontSize: 14, fontWeight: 300,
              padding: '14px', lineHeight: 1.7, resize: 'vertical',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.2)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
        </div>

        {/* Button */}
        <button
          onClick={analyze}
          disabled={loading || !prompt.trim()}
          style={{
            width: '100%', marginTop: 4,
            background: loading || !prompt.trim() ? 'rgba(200,255,0,0.3)' : '#c8ff00',
            color: loading || !prompt.trim() ? 'rgba(0,0,0,0.4)' : '#000',
            border: 'none', padding: '18px',
            fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 3,
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'
          }}
        >
          {loading ? 'ANALYZING...' : 'ANALYZE & IMPROVE'}
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#c8ff00',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
            <p style={{ fontFamily: "'DM Mono'", fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              Reading your prompt...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.2)', padding: '16px 24px',
            fontFamily: "'DM Mono'", fontSize: 13, color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: 4 }}>

            {/* Score + Verdict */}
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              padding: '40px 36px', display: 'flex', alignItems: 'center',
              gap: 48, flexWrap: 'wrap'
            }}>
              <ScoreRing score={result.score} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12
                }}>Verdict</div>
                <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: '#efefef', margin: 0 }}>
                  {result.one_line_verdict}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderTop: 'none', padding: '36px'
            }}>
              <div style={{
                fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#c8ff00', marginBottom: 28,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ width: 20, height: 1, background: '#c8ff00', display: 'inline-block' }} />
                Score Breakdown
              </div>
              {result.breakdown.map((dim, i) => <DimBar key={i} dim={dim} />)}
            </div>

            {/* What's Weak */}
            {result.whats_weak?.length > 0 && (
              <div style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                borderTop: 'none', padding: '36px'
              }}>
                <div style={{
                  fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#ff9500', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span style={{ width: 20, height: 1, background: '#ff9500', display: 'inline-block' }} />
                  What Needs Work
                </div>
                {result.whats_weak.map((issue, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start'
                  }}>
                    <span style={{
                      color: '#ff9500', fontFamily: "'DM Mono'", fontSize: 12,
                      marginTop: 2, flexShrink: 0
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{
                      fontFamily: "'Outfit'", fontSize: 14, fontWeight: 300,
                      color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0
                    }}>{issue}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Rewritten Prompt */}
            <div style={{
              background: 'rgba(200,255,0,0.025)', border: '1px solid rgba(200,255,0,0.15)',
              borderTop: 'none', padding: '36px'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
              }}>
                <div style={{
                  fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#c8ff00',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span style={{ width: 20, height: 1, background: '#c8ff00', display: 'inline-block' }} />
                  Rewritten Prompt
                </div>
                <CopyButton text={result.rewritten_prompt} />
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,255,0,0.1)',
                padding: '24px', fontFamily: "'DM Mono'", fontSize: 13, fontWeight: 300,
                color: 'rgba(255,255,255,0.8)', lineHeight: 1.85,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                {result.rewritten_prompt}
              </div>
            </div>

            {/* What Changed */}
            {result.what_changed?.length > 0 && (
              <div style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                borderTop: 'none', padding: '36px'
              }}>
                <div style={{
                  fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
                  What Changed & Why
                </div>
                {result.what_changed.map((change, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono'", fontSize: 12, marginTop: 2, flexShrink: 0 }}>
                      →
                    </span>
                    <p style={{ fontFamily: "'Outfit'", fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
                      {change}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Try Again */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => { setResult(null); setPrompt(''); setContext(''); }}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', padding: '10px 28px',
                  fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: '0.15em',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                Analyze Another Prompt
              </button>
            </div>

          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontFamily: "'DM Mono'", fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            Built by <a href="https://linkedin.com/in/anshulgupta" target="_blank" rel="noopener noreferrer"
              style={{ color: '#c8ff00', textDecoration: 'none' }}>Anshul Gupta</a> · Powered by Claude API
          </p>
        </div>

      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.18); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060606; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
