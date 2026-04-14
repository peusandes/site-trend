import { useState, useMemo } from 'react';
import { DATA } from '../data';
import Sparkle from '../components/Sparkle';
import Modal from '../components/Modal';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const MEDALS = [
  { icon: '🥇', color: '#FBBF24', glow: 'rgba(251,191,36,0.3)' },
  { icon: '🥈', color: '#C0C0C0', glow: 'rgba(192,192,192,0.2)' },
  { icon: '🥉', color: '#CD853F', glow: 'rgba(205,133,63,0.25)' },
];
const PIE_COLORS = ['#DA6FD8', '#9333EA', '#A090B8'];

const STATUS_STYLE = {
  'REALIZADA': { bg: 'rgba(160,144,184,0.12)', border: 'rgba(160,144,184,0.25)', color: '#A090B8', label: 'Realizada' },
  'EM VENDAS': { bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.30)',  color: '#4ADE80', label: 'Em Vendas' },
};

function calcIdade(nasc) {
  if (!nasc) return null;
  try {
    const [d, m, y] = nasc.split('/');
    const age = Math.floor((new Date(2026, 3, 13) - new Date(+y, m - 1, +d)) / (365.25 * 86400000));
    return age >= 10 && age <= 100 ? age : null;
  } catch { return null; }
}

export default function EventPage({ eventoKey, onBack }) {
  const [modalPessoa, setModalPessoa] = useState(null);
  const { isDark } = useTheme();
  const evento = DATA.eventos.find(e => e.key === eventoKey);
  if (!evento) return null;

  const tickColor = isDark ? '#A090B8' : '#7060A0';

  const st      = STATUS_STYLE[evento.status] || STATUS_STYLE['REALIZADA'];
  const pieData = useMemo(() => [
    { name: 'Feminino',  value: evento.genero.feminino },
    { name: 'Masculino', value: evento.genero.masculino },
    ...(evento.genero.naoInformado > 0 ? [{ name: 'N/I', value: evento.genero.naoInformado }] : []),
  ], [evento.genero]);

  return (
    <div className="page-enter" style={{ padding: '30px 34px', flex: 1 }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(218,111,216,0.07)',
          border:     '1px solid rgba(218,111,216,0.18)',
          borderRadius: 10, color: '#DA6FD8',
          cursor: 'pointer', padding: '7px 14px',
          fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-display)',
          marginBottom: 24,
          transition: 'background .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,111,216,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,111,216,0.07)'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Visão Geral
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <Sparkle size={14} color="#DA6FD8" />
        <h1 className="page-heading">{evento.nome}</h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: st.bg, border: `1px solid ${st.border}`,
          borderRadius: 8, padding: '4px 12px',
        }}>
          {evento.status === 'EM VENDAS' && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ADE80',
              display: 'inline-block', animation: 'ringPulse 2s infinite', flexShrink: 0,
            }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{evento.data}</span>
      </div>

      {/* 3 metrics */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
        {[
          { label: 'Total Ingressos', val: evento.totalIngressos.toLocaleString('pt-BR'), sub: 'ingressos vendidos' },
          { label: 'Pessoas Únicas',  val: evento.totalPessoas.toLocaleString('pt-BR'),   sub: 'compradores distintos' },
          { label: 'Idade Média',     val: `${evento.idadeMedia} anos`,                   sub: 'dos compradores' },
        ].map((m, i) => (
          <div key={m.label} className="grad-border-wrap" style={{ flex: 1, minWidth: 160, animationDelay: `${i * 80}ms` }}>
            <div className="grad-border-inner" style={{ padding: '20px 22px', borderRadius: 20 }}>
              <p className="metric-label" style={{ marginBottom: 10 }}>{m.label}</p>
              <p className="display-num" style={{ fontSize: 32, animationDelay: `${i * 100}ms` }}>{m.val}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table + Pie */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Ranking table */}
        <div className="glass" style={{ flex: 2, minWidth: 300, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--c-row-border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkle size={9} color="#DA6FD8" />
            <h2 className="section-heading">Top 20 Compradores</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--c-thead-bg)' }}>
                  {['#', 'Nome', 'Ingressos', 'Sexo', 'Idade'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: 10, color: tickColor, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                      opacity: 0.6,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evento.ranking.map((pessoa, i) => {
                  const medal = MEDALS[i];
                  const idade = pessoa.idade ?? calcIdade(pessoa.nascimento);
                  return (
                    <tr
                      key={pessoa.cpf}
                      className="tr-stagger"
                      onClick={() => setModalPessoa(pessoa)}
                      style={{
                        borderBottom: '1px solid var(--c-row-border)',
                        cursor: 'pointer',
                        transition: 'background .18s',
                        animationDelay: `${Math.min(i * 30, 400)}ms`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--c-row-hover)';
                        e.currentTarget.style.borderLeft = '2px solid rgba(218,111,216,0.4)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeft = 'none';
                      }}
                    >
                      {/* Position */}
                      <td style={{ padding: '12px 14px', width: 50 }}>
                        {medal ? (
                          <span style={{
                            fontSize: 17,
                            filter: `drop-shadow(0 0 5px ${medal.glow})`,
                          }}>{medal.icon}</span>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: tickColor, opacity: 0.5 }}>{i + 1}</span>
                        )}
                      </td>
                      {/* Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: 13, fontWeight: medal ? 700 : 500,
                          color: medal ? medal.color : 'var(--c-text)',
                        }}>{pessoa.nome}</span>
                      </td>
                      {/* Tickets */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: 'rgba(218,111,216,0.12)',
                          border: '1px solid rgba(218,111,216,0.25)',
                          borderRadius: 7, padding: '3px 10px',
                          fontSize: 13, fontWeight: 800,
                          fontFamily: 'var(--font-display)',
                          color: '#DA6FD8',
                        }}>{pessoa.ingressos}</span>
                      </td>
                      {/* Gender */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>
                        {pessoa.sexo === 'Feminino' ? '♀' : pessoa.sexo === 'Masculino' ? '♂' : '—'}
                        {' '}{pessoa.sexo}
                      </td>
                      {/* Age */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>
                        {idade ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie chart */}
        <div className="glass" style={{ flex: 1, minWidth: 230, borderRadius: 20, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Sparkle size={9} color="#DA6FD8" />
            <h2 className="section-heading">Gênero</h2>
          </div>

          <ResponsiveContainer width="100%" height={195}>
            <PieChart>
              <defs>
                {PIE_COLORS.map((c, i) => (
                  <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor={c} stopOpacity={1} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                  </radialGradient>
                ))}
              </defs>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={52} outerRadius={82}
                paddingAngle={4} dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={`url(#pieGrad${i})`} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [v.toLocaleString('pt-BR'), n]}
                contentStyle={{
                  background: 'var(--c-surface-solid)',
                  border: '1px solid rgba(218,111,216,0.3)',
                  borderRadius: 10,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: 'var(--c-text)', fontWeight: 700 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: PIE_COLORS[i],
                    boxShadow: `0 0 8px ${PIE_COLORS[i]}80`,
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
                  {((d.value / evento.totalPessoas) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalPessoa && (
        <Modal
          pessoa={modalPessoa}
          eventoNome={evento.nome}
          onClose={() => setModalPessoa(null)}
        />
      )}
    </div>
  );
}
