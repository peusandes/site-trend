import { useMemo } from 'react';
import { DATA } from '../data';
import Sparkle from '../components/Sparkle';
import { useCounter } from '../hooks/useCounter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';

const STATUS_BADGE = {
  'REALIZADA': { bg: 'rgba(160,144,184,0.12)', border: 'rgba(160,144,184,0.25)', color: '#A090B8', label: 'Realizada' },
  'EM VENDAS': { bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.30)',  color: '#4ADE80', label: 'Em Vendas' },
};

const BAR_COLORS = ['#DA6FD8', '#B94DB7', '#9333EA'];

/* ── Animated metric card ───────────────────────────────────── */
function MetricCard({ icon, label, rawValue, formatted, sub, delay = 0 }) {
  const count = useCounter(rawValue, 1100, delay);
  const displayed = formatted
    ? formatted(count)
    : count.toLocaleString('pt-BR');

  return (
    <div className="grad-border-wrap" style={{ flex: 1, minWidth: 160 }}>
      <div className="grad-border-inner glass-clickable" style={{
        padding: '22px 24px',
        borderRadius: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span className="metric-label">{label}</span>
        </div>
        <div className="display-num" style={{ fontSize: 38, animationDelay: `${delay}ms` }}>
          {displayed}
        </div>
        {sub && <p style={{ fontSize: 12, color: '#A090B8', marginTop: 7 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Event card ─────────────────────────────────────────────── */
function EventCard({ evento, onClick, index }) {
  const badge = STATUS_BADGE[evento.status] || STATUS_BADGE['REALIZADA'];
  const glow = BAR_COLORS[index % BAR_COLORS.length];

  return (
    <div
      className="grad-border-wrap glass-clickable"
      style={{
        flex: 1, minWidth: 220,
        animationDelay: `${index * 80}ms`,
        animation: `slideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms both`,
      }}
      onClick={() => onClick(evento.key)}
    >
      <div
        className="grad-border-inner"
        style={{ padding: '22px', borderRadius: 20, position: 'relative', overflow: 'hidden' }}
      >
        {/* ambient glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120,
          background: `radial-gradient(circle, ${glow}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Status */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: badge.bg, border: `1px solid ${badge.border}`,
          borderRadius: 8, padding: '3px 10px', marginBottom: 14,
        }}>
          {evento.status === 'EM VENDAS' && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ADE80',
              display: 'inline-block', animation: 'ringPulse 2s infinite',
              flexShrink: 0,
            }} />
          )}
          <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, letterSpacing: 0.5 }}>
            {badge.label}
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          {evento.nome}
        </h3>
        <p style={{ fontSize: 12, color: '#A090B8', marginBottom: 18 }}>{evento.data}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <MetricRow label="Ingressos" value={evento.totalIngressos.toLocaleString('pt-BR')} color={glow} />
          <MetricRow label="Pessoas únicas" value={evento.totalPessoas.toLocaleString('pt-BR')} />
          <MetricRow label="Idade média" value={`${evento.idadeMedia} anos`} />
        </div>

        <div style={{
          marginTop: 18, display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-display)',
          color: glow, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
        }}>
          Ver detalhes
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#A090B8' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || '#fff' }}>{value}</span>
    </div>
  );
}

/* ── Custom tooltip ─────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-glass" style={{ padding: '10px 14px', minWidth: 140 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', marginBottom: 8, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.fill, marginBottom: 2 }}>
          {p.name}: <strong style={{ color: '#fff' }}>{p.value.toLocaleString('pt-BR')}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Page ───────────────────────────────────────────────────── */
export default function Overview({ onEventClick }) {
  const { resumo, eventos } = DATA;

  const chartData = useMemo(() => eventos.map(ev => ({
    name: ev.nome,
    Ingressos: ev.totalIngressos,
    Pessoas:   ev.totalPessoas,
  })), [eventos]);

  return (
    <div className="page-enter" style={{ padding: '30px 34px', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 32 }}>
        <Sparkle size={14} color="#DA6FD8" style={{ marginTop: 5, flexShrink: 0 }} />
        <div>
          <h1 className="page-heading">Visão Geral</h1>
          <p style={{ fontSize: 13, color: '#A090B8', marginTop: 4, fontWeight: 300 }}>
            Programa de Fidelidade Trend — Salvador-BA
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
        <MetricCard
          icon="👥" label="Pessoas únicas"
          rawValue={resumo.totalPessoas}
          sub="CPF único cross-evento"
          delay={0}
        />
        <MetricCard
          icon="🎟" label="Total de ingressos"
          rawValue={resumo.totalIngressos}
          sub={`${(resumo.totalIngressos / resumo.totalPessoas).toFixed(1)} ingressos/pessoa`}
          delay={120}
        />
        <MetricCard
          icon="🎂" label="Idade média"
          rawValue={Math.round(resumo.idadeMedia)}
          formatted={(n) => `${n} anos`}
          sub="média geral dos compradores"
          delay={240}
        />
        <MetricCard
          icon="✦" label="Eventos"
          rawValue={resumo.numEventos}
          sub="2 em vendas · 1 realizado"
          delay={360}
        />
      </div>

      {/* Events section heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <Sparkle size={10} color="#DA6FD8" />
        <h2 className="section-heading">Eventos</h2>
      </div>

      {/* Event cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 34 }}>
        {eventos.map((ev, i) => (
          <EventCard key={ev.key} evento={ev} onClick={onEventClick} index={i} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="glass" style={{ padding: '24px', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
          <Sparkle size={10} color="#DA6FD8" />
          <h2 className="section-heading">Comparativo por Evento</h2>
        </div>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={5}>
            <defs>
              <linearGradient id="gradIngressos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#DA6FD8" stopOpacity={1} />
                <stop offset="100%" stopColor="#B94DB7" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="gradPessoas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#9333EA" stopOpacity={1} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(218,111,216,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="transparent"
              tick={{ fill: '#A090B8', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: 'rgba(160,144,184,0.5)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(218,111,216,0.05)' }} />
            <Legend
              formatter={v => <span style={{ color: '#A090B8', fontSize: 12, fontFamily: 'var(--font-body)' }}>{v}</span>}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Ingressos" fill="url(#gradIngressos)" radius={[7, 7, 0, 0]} maxBarSize={56} />
            <Bar dataKey="Pessoas"   fill="url(#gradPessoas)"   radius={[7, 7, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
