import { useState, useMemo } from 'react';
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

export default function GlobalRanking() {
  const [modal, setModal]   = useState(null);
  const [filter, setFilter] = useState('todos');
  const { rankingGlobal }   = DATA;

  const filtrado = useMemo(
    () => filter === 'todos'
      ? rankingGlobal
      : rankingGlobal.filter(p => p.numEventos === parseInt(filter, 10)),
    [filter, rankingGlobal]
  );

  return (
    <div className="page-enter" style={{ padding: '30px 34px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <Sparkle size={14} color="#DA6FD8" style={{ marginTop: 5 }} />
        <div>
          <h1 className="page-heading">Ranking Global</h1>
          <p style={{ fontSize: 13, color: '#A090B8', marginTop: 4, fontWeight: 300 }}>
            Top 30 compradores considerando todos os eventos
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        {FILTERS.map(({ n, label }) => {
          const b     = attendanceBadge(n);
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
              Top {filtrado.length}{' '}
              {filter !== 'todos' && (
                <span style={{ fontSize: 12, color: '#A090B8', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
                  ({filter} evento{parseInt(filter) !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(160,144,184,0.5)' }}>Clique para ver detalhes</span>
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
              {filtrado.map((pessoa, localIdx) => {
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
                    {/* Rank */}
                    <td style={{ padding: '12px 14px', width: 52 }}>
                      {medal
                        ? <span style={{ fontSize: 16 }}>{medal.icon}</span>
                        : <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(160,144,184,0.4)' }}>{globalIdx + 1}</span>
                      }
                    </td>
                    {/* Name */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: medal ? 700 : 500,
                        color: medal ? medal.color : '#fff',
                      }}>{pessoa.nome}</span>
                    </td>
                    {/* Total tickets */}
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
                    {/* Events count */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: evStyle.bg, border: `1px solid ${evStyle.border}`,
                        borderRadius: 7, padding: '3px 10px',
                        fontSize: 12, fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        color: evStyle.color, whiteSpace: 'nowrap',
                      }}>
                        {pessoa.numEventos}/{N_TOTAL}
                      </span>
                    </td>
                    {/* Breakdown */}
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
    </div>
  );
}
