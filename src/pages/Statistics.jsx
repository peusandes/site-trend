import { useMemo } from 'react';
import { DATA } from '../data';
import Sparkle from '../components/Sparkle';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS  = ['#DA6FD8', '#9333EA', '#A090B8'];
const EVENTO_COLS = { retronejo: '#DA6FD8', oboe: '#B94DB7', augeboys: '#9333EA' };

const STATUS_STYLE = {
  'REALIZADA': { color: '#A090B8', bg: 'rgba(160,144,184,0.08)', border: 'rgba(160,144,184,0.18)', label: 'Realizada' },
  'EM VENDAS': { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.22)',  label: 'Em Vendas' },
};

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-glass" style={{ padding: '10px 14px' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.fill }}>
          {p.name}: <strong style={{ color: 'var(--c-text)' }}>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function PieCard({ titulo, data, total }) {
  const { isDark } = useTheme();
  const tickColor = isDark ? '#A090B8' : '#7060A0';

  return (
    <div className="glass" style={{ flex: 1, minWidth: 195, borderRadius: 18, padding: '18px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Sparkle size={7} color="#DA6FD8" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>{titulo}</h3>
      </div>
      <ResponsiveContainer width="100%" height={145}>
        <PieChart>
          <defs>
            {PIE_COLORS.map((c, i) => (
              <radialGradient key={i} id={`sg${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={c} stopOpacity={1} />
                <stop offset="100%" stopColor={c} stopOpacity={0.65} />
              </radialGradient>
            ))}
          </defs>
          <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={4} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={`url(#sg${i})`} />)}
          </Pie>
          <Tooltip
            formatter={v => [v, '']}
            contentStyle={{ background: 'var(--c-surface-solid)', border: '1px solid rgba(218,111,216,0.3)', borderRadius: 8 }}
            itemStyle={{ color: tickColor }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i], boxShadow: `0 0 6px ${PIE_COLORS[i]}88`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const { eventos, resumo } = DATA;
  const { isDark } = useTheme();

  const tickColor      = isDark ? '#A090B8'               : '#7060A0';
  const tickColorFaint = isDark ? 'rgba(160,144,184,0.5)' : 'rgba(112,96,160,0.6)';

  const idades = useMemo(() => [
    ...eventos.map(ev => ({ name: ev.nome, 'Idade Média': ev.idadeMedia })),
    { name: 'Geral', 'Idade Média': resumo.idadeMedia },
  ], [eventos, resumo.idadeMedia]);

  const maxIngressos = useMemo(
    () => Math.max(...eventos.map(e => e.totalIngressos)),
    [eventos]
  );

  const generoGlobal = useMemo(() => [
    { name: 'Feminino',  value: resumo.genero.feminino },
    { name: 'Masculino', value: resumo.genero.masculino },
    ...(resumo.genero.naoInformado > 0 ? [{ name: 'Não Inf.', value: resumo.genero.naoInformado }] : []),
  ], [resumo.genero]);

  return (
    <div className="page-enter" style={{ padding: '30px 34px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 30 }}>
        <Sparkle size={14} color="#DA6FD8" style={{ marginTop: 5 }} />
        <div>
          <h1 className="page-heading">Estatísticas</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontWeight: 300 }}>
            Análise detalhada por evento e geral
          </p>
        </div>
      </div>

      {/* Age chart */}
      <div className="glass" style={{ padding: '24px', borderRadius: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Sparkle size={9} color="#DA6FD8" />
          <h2 className="section-heading">Idade Média por Evento</h2>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={idades} barCategoryGap="40%">
            <defs>
              <linearGradient id="ageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#DA6FD8" stopOpacity={1} />
                <stop offset="100%" stopColor="#B94DB7" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(218,111,216,0.07)" vertical={false} />
            <XAxis dataKey="name" stroke="transparent" tick={{ fill: tickColor, fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600 }} tickLine={false} axisLine={false} />
            <YAxis stroke="transparent" tick={{ fill: tickColorFaint, fontSize: 11 }} tickLine={false} axisLine={false} domain={[18, 28]} />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(218,111,216,0.05)' }} />
            <Bar dataKey="Idade Média" fill="url(#ageGrad)" radius={[7, 7, 0, 0]} maxBarSize={64}
              label={{ position: 'top', fill: '#DA6FD8', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-display)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Volume bars */}
      <div className="glass" style={{ padding: '24px', borderRadius: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <Sparkle size={9} color="#DA6FD8" />
          <h2 className="section-heading">Volume de Ingressos por Evento</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {eventos.map((ev, idx) => {
            const pct  = (ev.totalIngressos / resumo.totalIngressos * 100).toFixed(1);
            const barW = (ev.totalIngressos / maxIngressos * 100).toFixed(1);
            const col  = EVENTO_COLS[ev.key] || '#DA6FD8';
            return (
              <div key={ev.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}`, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>{ev.nome}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{ev.data}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: col }}>
                      {ev.totalIngressos.toLocaleString('pt-BR')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{pct}%</span>
                  </div>
                </div>
                <div className="progress-bar" style={{
                  height: 8,
                  background: 'rgba(218,111,216,0.08)',
                  borderRadius: 10,
                  border: '1px solid rgba(218,111,216,0.1)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${barW}%`,
                    background: `linear-gradient(90deg, ${col}, ${col}99)`,
                    borderRadius: 10,
                    boxShadow: `0 0 12px ${col}60`,
                    transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                    animationDelay: `${idx * 150}ms`,
                  }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.6, marginTop: 5 }}>
                  {ev.totalPessoas.toLocaleString('pt-BR')} pessoas · {ev.idadeMedia} anos média
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gender pies */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkle size={9} color="#DA6FD8" />
          <h2 className="section-heading">Distribuição de Gênero</h2>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {eventos.map(ev => (
            <PieCard key={ev.key} titulo={ev.nome}
              data={[
                { name: 'Feminino',  value: ev.genero.feminino },
                { name: 'Masculino', value: ev.genero.masculino },
                ...(ev.genero.naoInformado > 0 ? [{ name: 'N/I', value: ev.genero.naoInformado }] : []),
              ]}
              total={ev.totalPessoas}
            />
          ))}
          <PieCard titulo="Geral" data={generoGlobal} total={resumo.totalPessoas} />
        </div>
      </div>

      {/* Summary table */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--c-row-border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Sparkle size={9} color="#DA6FD8" />
          <h2 className="section-heading">Resumo por Evento</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--c-thead-bg)' }}>
                {['Evento','Data','Status','Ingressos','Pessoas','Idade Méd.','% Fem.','% Masc.'].map(h => (
                  <th key={h} style={{
                    padding: '9px 14px', textAlign: 'left',
                    fontSize: 10, color: tickColor, opacity: 0.65, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventos.map(ev => {
                const st  = STATUS_STYLE[ev.status] || STATUS_STYLE['REALIZADA'];
                const col = EVENTO_COLS[ev.key] || '#DA6FD8';
                return (
                  <tr key={ev.key} style={{ borderBottom: '1px solid var(--c-row-border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, boxShadow: `0 0 7px ${col}`, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: 13 }}>{ev.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: 12 }}>{ev.data}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: col, fontSize: 14 }}>
                        {ev.totalIngressos.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--c-text)', fontSize: 13 }}>{ev.totalPessoas.toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--c-text)', fontSize: 13 }}>{ev.idadeMedia}a</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#DA6FD8' }}>{ev.genero.pctFeminino}%</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#9333EA' }}>{ev.genero.pctMasculino}%</span>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ background: 'var(--c-thead-bg)', borderTop: '1px solid rgba(218,111,216,0.15)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#DA6FD8', fontSize: 13, letterSpacing: 0.5 }}>TOTAL</span>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--muted)', opacity: 0.4, fontSize: 12 }}>—</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#4ADE80' }}>
                    {DATA.eventos.filter(e => e.status === 'EM VENDAS').length} em vendas
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#DA6FD8', fontSize: 16 }}>
                    {resumo.totalIngressos.toLocaleString('pt-BR')}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)', fontSize: 14 }}>
                    {resumo.totalPessoas.toLocaleString('pt-BR')}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--c-text)', fontSize: 13, fontWeight: 700 }}>{resumo.idadeMedia}a</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#DA6FD8' }}>{resumo.genero.pctFeminino}%</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#9333EA' }}>{resumo.genero.pctMasculino}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
