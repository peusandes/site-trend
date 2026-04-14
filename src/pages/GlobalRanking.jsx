import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DATA } from '../data';
import Sparkle from '../components/Sparkle';
import Modal from '../components/Modal';

const MEDALS = [
  { icon: '🥇', color: '#FBBF24' },
  { icon: '🥈', color: '#C0C0C0' },
  { icon: '🥉', color: '#CD853F' },
];

const EVENTO_META = {
  retronejo: { label: 'Retronejo', short: 'RN', color: '#DA6FD8' },
  oboe:      { label: 'Oboé',     short: 'OB', color: '#B94DB7' },
  augeboys:  { label: 'Augeboys', short: 'AB', color: '#9333EA' },
};

const N_TOTAL = DATA.eventos.length;
const TOP_N   = 30;

function attendanceBadge(n) {
  if (n === N_TOTAL) return { color: '#4ADE80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.28)' };
  if (n === 2)       return { color: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)' };
  return                    { color: '#A090B8', bg: 'rgba(160,144,184,0.08)', border: 'rgba(160,144,184,0.18)' };
}

function EvBadge({ eventoKey, qtd }) {
  const m = EVENTO_META[eventoKey];
  if (!m) return null;
  return (
    <span style={{
      background: `${m.color}14`, border: `1px solid ${m.color}38`,
      borderRadius: 6, padding: '2px 8px',
      fontSize: 11, fontWeight: 700, color: m.color,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'var(--font-display)',
    }}>
      {qtd}<span style={{ fontWeight: 400, opacity: 0.7, fontSize: 10 }}>{m.short}</span>
    </span>
  );
}

const FILTERS = [
  { n: N_TOTAL, label: `${N_TOTAL}/${N_TOTAL} eventos` },
  { n: 2,       label: `2/${N_TOTAL} eventos` },
  { n: 1,       label: `1/${N_TOTAL} evento` },
];

/* ── Full ranking modal ─────────────────────────────────────── */
function FullRankingModal({ onClose }) {
  const [search, setSearch] = useState('');
  const { rankingGlobal } = DATA;

  const filtered = useMemo(() => {
    if (!search.trim()) return rankingGlobal;
    const q = search.toLowerCase();
    return rankingGlobal.filter(p => p.nome.toLowerCase().includes(q));
  }, [search, rankingGlobal]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,3,18,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 820,
          maxHeight: '90vh',
          background: 'linear-gradient(140deg, rgba(218,111,216,0.45), rgba(147,51,234,0.2), rgba(218,111,216,0.06))',
          borderRadius: 24,
          padding: '1px',
          animation: 'modalUp 0.28s cubic-bezier(0.22,1,0.36,1) both',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(218,111,216,0.1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          background: 'rgba(12,4,26,0.98)',
          borderRadius: 23,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '22px 26px 18px',
            borderBottom: '1px solid rgba(218,111,216,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkle size={9} color="#DA6FD8" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                Ranking Completo
              </h2>
              <span style={{
                background: 'rgba(218,111,216,0.12)',
                border: '1px solid rgba(218,111,216,0.25)',
                borderRadius: 7, padding: '2px 10px',
                fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: '#DA6FD8',
              }}>
                {filtered.length.toLocaleString('pt-BR')} pessoa{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(218,111,216,0.08)',
                border: '1px solid rgba(218,111,216,0.18)',
                borderRadius: 10, color: '#DA6FD8',
                cursor: 'pointer', padding: '7px 10px',
                fontSize: 14, lineHeight: 1,
                transition: 'background .2s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,111,216,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,111,216,0.08)'}
            >✕</button>
          </div>

          {/* Search */}
          <div style={{ padding: '14px 26px', borderBottom: '1px solid rgba(218,111,216,0.07)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="#A090B8" strokeWidth="1.5"/>
                <path d="M10.5 10.5L13 13" stroke="#A090B8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                autoFocus
                placeholder="Buscar por nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(218,111,216,0.06)',
                  border: '1px solid rgba(218,111,216,0.18)',
                  borderRadius: 10, padding: '9px 14px 9px 36px',
                  color: '#fff', fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(218,111,216,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(218,111,216,0.18)'}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#A090B8',
                    cursor: 'pointer', fontSize: 14, padding: 2,
                  }}
                >✕</button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'rgba(12,4,26,0.98)', zIndex: 1 }}>
                <tr style={{ background: 'rgba(218,111,216,0.04)' }}>
                  {['#', 'Nome', 'Total', 'Eventos', 'Por Evento'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 10, color: 'rgba(160,144,184,0.55)', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(218,111,216,0.1)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 14px', textAlign: 'center', color: '#A090B8', fontSize: 13 }}>
                      Nenhum resultado para "{search}"
                    </td>
                  </tr>
                ) : filtered.map((pessoa, localIdx) => {
                  const globalIdx  = pessoa.posicao - 1;
                  const medal      = MEDALS[globalIdx];
                  const evStyle    = attendanceBadge(pessoa.numEventos);
                  return (
                    <tr
                      key={pessoa.cpf}
                      style={{
                        borderBottom: '1px solid rgba(218,111,216,0.06)',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,111,216,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', width: 52 }}>
                        {medal
                          ? <span style={{ fontSize: 15 }}>{medal.icon}</span>
                          : <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(160,144,184,0.4)' }}>{globalIdx + 1}</span>
                        }
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: 13, fontWeight: medal ? 700 : 400,
                          color: medal ? medal.color : '#fff',
                        }}>{pessoa.nome}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: 'rgba(218,111,216,0.12)',
                          border: '1px solid rgba(218,111,216,0.25)',
                          borderRadius: 7, padding: '2px 10px',
                          fontSize: 13, fontWeight: 900,
                          fontFamily: 'var(--font-display)',
                          color: '#DA6FD8',
                        }}>{pessoa.totalIngressos}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: evStyle.bg, border: `1px solid ${evStyle.border}`,
                          borderRadius: 7, padding: '2px 10px',
                          fontSize: 12, fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          color: evStyle.color, whiteSpace: 'nowrap',
                        }}>{pessoa.numEventos}/{N_TOTAL}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {Object.entries(pessoa.eventos).map(([key, qtd]) => (
                            <EvBadge key={key} eventoKey={key} qtd={qtd} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function GlobalRanking() {
  const [modal,       setModal]       = useState(null);
  const [filter,      setFilter]      = useState('todos');
  const [showAllModal, setShowAllModal] = useState(false);
  const { rankingGlobal } = DATA;

  const filtrado = useMemo(
    () => filter === 'todos'
      ? rankingGlobal
      : rankingGlobal.filter(p => p.numEventos === parseInt(filter, 10)),
    [filter, rankingGlobal]
  );

  const tableRows = useMemo(() => filtrado.slice(0, TOP_N), [filtrado]);

  return (
    <div className="page-enter" style={{ padding: '30px 34px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <Sparkle size={14} color="#DA6FD8" style={{ marginTop: 5 }} />
        <div>
          <h1 className="page-heading">Ranking Global</h1>
          <p style={{ fontSize: 13, color: '#A090B8', marginTop: 4, fontWeight: 300 }}>
            Top {TOP_N} compradores considerando todos os eventos
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        {FILTERS.map(({ n, label }) => {
          const b      = attendanceBadge(n);
          const active = filter === String(n);
          return (
            <button
              key={n}
              onClick={() => setFilter(active ? 'todos' : String(n))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: active ? b.bg : 'transparent',
                border:     `1px solid ${active ? b.border : 'rgba(160,144,184,0.15)'}`,
                borderRadius: 10, padding: '6px 14px',
                cursor: 'pointer', color: b.color,
                fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-body)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = b.border; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(160,144,184,0.15)'; }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: b.color,
                boxShadow: active ? `0 0 8px ${b.color}` : 'none',
                flexShrink: 0,
                transition: 'box-shadow .2s',
              }} />
              {label}
            </button>
          );
        })}
        {filter !== 'todos' && (
          <button
            onClick={() => setFilter('todos')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(218,111,216,0.18)',
              borderRadius: 10, padding: '6px 14px',
              cursor: 'pointer', color: '#A090B8',
              fontSize: 12, fontWeight: 500,
              fontFamily: 'var(--font-body)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#DA6FD8'; e.currentTarget.style.borderColor = 'rgba(218,111,216,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A090B8'; e.currentTarget.style.borderColor = 'rgba(218,111,216,0.18)'; }}
          >
            Limpar ✕
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid rgba(218,111,216,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkle size={9} color="#DA6FD8" />
            <h2 className="section-heading">
              Top {tableRows.length}{' '}
              {filter !== 'todos' && (
                <span style={{ fontSize: 12, color: '#A090B8', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
                  ({filter} evento{parseInt(filter) !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>

          {/* Ver todos button */}
          <button
            onClick={() => setShowAllModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(218,111,216,0.08)',
              border: '1px solid rgba(218,111,216,0.22)',
              borderRadius: 10, padding: '7px 14px',
              cursor: 'pointer', color: '#DA6FD8',
              fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-display)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(218,111,216,0.16)'; e.currentTarget.style.borderColor = 'rgba(218,111,216,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(218,111,216,0.08)'; e.currentTarget.style.borderColor = 'rgba(218,111,216,0.22)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="currentColor" opacity=".7"/>
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" fill="currentColor"/>
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity=".7"/>
            </svg>
            Ver todos ({rankingGlobal.length.toLocaleString('pt-BR')})
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(218,111,216,0.03)' }}>
                {['#', 'Nome', 'Total', 'Eventos', 'Por Evento'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 10, color: 'rgba(160,144,184,0.55)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((pessoa, localIdx) => {
                const globalIdx = pessoa.posicao - 1;
                const medal     = MEDALS[globalIdx];
                const evStyle   = attendanceBadge(pessoa.numEventos);
                return (
                  <tr
                    key={pessoa.cpf}
                    className="tr-stagger"
                    onClick={() => setModal(pessoa)}
                    style={{
                      borderBottom: '1px solid rgba(218,111,216,0.07)',
                      cursor: 'pointer',
                      transition: 'background .18s',
                      animationDelay: `${Math.min(localIdx * 25, 500)}ms`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(218,111,216,0.07)';
                      e.currentTarget.style.boxShadow = 'inset 2px 0 0 rgba(218,111,216,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td style={{ padding: '12px 14px', width: 52 }}>
                      {medal
                        ? <span style={{ fontSize: 16 }}>{medal.icon}</span>
                        : <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(160,144,184,0.4)' }}>{globalIdx + 1}</span>
                      }
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: medal ? 700 : 500,
                        color: medal ? medal.color : '#fff',
                      }}>{pessoa.nome}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: 'rgba(218,111,216,0.12)',
                        border: '1px solid rgba(218,111,216,0.25)',
                        borderRadius: 7, padding: '3px 11px',
                        fontSize: 14, fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        color: '#DA6FD8',
                      }}>{pessoa.totalIngressos}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: evStyle.bg, border: `1px solid ${evStyle.border}`,
                        borderRadius: 7, padding: '3px 10px',
                        fontSize: 12, fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        color: evStyle.color, whiteSpace: 'nowrap',
                      }}>{pessoa.numEventos}/{N_TOTAL}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {Object.entries(pessoa.eventos).map(([key, qtd]) => (
                          <EvBadge key={key} eventoKey={key} qtd={qtd} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal pessoa={modal} isGlobal onClose={() => setModal(null)} />
      )}

      {showAllModal && (
        <FullRankingModal onClose={() => setShowAllModal(false)} />
      )}
    </div>
  );
}
