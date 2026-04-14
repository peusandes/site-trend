import { useState } from 'react';
import Sparkle from './Sparkle';
import { DATA } from '../data';

const NAV = [
  { key: 'overview',    label: 'Visão Geral',    Icon: IconGrid },
  { key: 'ranking',     label: 'Ranking Global', Icon: IconTrophy },
  { key: 'statistics',  label: 'Estatísticas',   Icon: IconChart },
];

const EVENTO_COLORS = { retronejo: '#DA6FD8', oboe: '#B94DB7', augeboys: '#9333EA' };

/* ── Icons ────────────────────────────────────────────────────── */
function IconGrid() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="10" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="1" y="10" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor"/>
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M8.5 11.5C5.74 11.5 3.5 9.26 3.5 6.5V2h10v4.5c0 2.76-2.24 5-5 5Z" fill="currentColor"/>
      <path d="M3.5 4H2a1 1 0 0 0-1 1v.5a3 3 0 0 0 2.5 2.97M13.5 4H15a1 1 0 0 1 1 1v.5a3 3 0 0 1-2.5 2.97" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8.5 11.5V14M6 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1" y="8"  width="4" height="8" rx="1" fill="currentColor"/>
      <rect x="6.5" y="4" width="4" height="12" rx="1" fill="currentColor"/>
      <rect x="12" y="1" width="4" height="15" rx="1" fill="currentColor"/>
    </svg>
  );
}

/* ── Trend Logo SVG ───────────────────────────────────────────── */
function TrendLogo({ size = 26 }) {
  return (
    <svg height={size} viewBox="0 0 90 28" fill="none" style={{ display: 'block' }}>
      <text x="0" y="23"
        fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif"
        fontWeight="800" fontSize="25"
        fill="#FFFFFF">trend</text>
      {/* Sparkle at the top of the 'd' ascender */}
      <path d="M74 0 L75.2 3.5 L79 5 L75.2 6.5 L74 10 L72.8 6.5 L69 5 L72.8 3.5 Z"
        fill="#DA6FD8" />
    </svg>
  );
}

export default function Sidebar({ activePage, onNavigate, activeEvent, onEventClick }) {
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (key) => activePage === key && !activeEvent;

  return (
    <aside style={{
      width:     collapsed ? 62 : 236,
      minWidth:  collapsed ? 62 : 236,
      background:'rgba(12, 4, 26, 0.92)',
      borderRight: '1px solid rgba(218,111,216,0.12)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      display:   'flex',
      flexDirection: 'column',
      padding:   collapsed ? '20px 8px' : '20px 14px',
      transition:'width .32s var(--ease-spring), min-width .32s var(--ease-spring), padding .32s ease',
      overflow:  'hidden',
      position:  'sticky',
      top: 0,
      height:    '100vh',
      zIndex:    10,
      flexShrink: 0,
    }}>

      {/* ── Top: logo + collapse ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: 32,
        gap: 8,
      }}>
        {!collapsed && <TrendLogo size={24} />}
        {collapsed && (
          <div style={{ animation: 'fadeIn .3s ease' }}>
            <Sparkle size={22} color="#DA6FD8" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expandir' : 'Recolher'}
          style={{
            flexShrink: 0,
            background: 'rgba(218,111,216,0.08)',
            border:     '1px solid rgba(218,111,216,0.18)',
            borderRadius: 9,
            color: '#DA6FD8',
            cursor: 'pointer',
            padding: '5px 7px',
            display: 'flex',
            alignItems: 'center',
            transition: 'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,111,216,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,111,216,0.08)'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}>
            <path d="M9 3L5 7l4 4" stroke="#DA6FD8" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Main nav ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {!collapsed && (
          <p style={{ fontSize: 10, color: 'rgba(160,144,184,0.5)', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', padding: '0 10px', marginBottom: 6 }}>
            Menu
          </p>
        )}
        {NAV.map(({ key, label, Icon }) => {
          const active = isActive(key);
          return (
            <div
              key={key}
              onClick={() => onNavigate(key)}
              className={active ? 'nav-active' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '11px 12px' : '11px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                color:  active ? '#DA6FD8' : '#A090B8',
                borderLeft: active ? undefined : '2px solid transparent',
                transition: 'all .2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                userSelect: 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#F0B4EF'; e.currentTarget.style.background = 'rgba(218,111,216,0.06)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#A090B8';  e.currentTarget.style.background = 'transparent'; }}}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}><Icon /></span>
              {!collapsed && (
                <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}>{label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(218,111,216,0.08)', margin: '18px 0' }} />

      {/* ── Eventos ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {!collapsed && (
          <p style={{ fontSize: 10, color: 'rgba(160,144,184,0.5)', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
            Eventos
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {DATA.eventos.map(ev => {
            const active = activeEvent === ev.key;
            const color  = EVENTO_COLORS[ev.key] || '#DA6FD8';
            return (
              <div
                key={ev.key}
                onClick={() => onEventClick(ev.key)}
                className={active ? 'nav-active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  gap: 8,
                  padding: collapsed ? '10px 10px' : '10px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  borderLeft: active ? undefined : '2px solid transparent',
                  transition: 'all .2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(218,111,216,0.06)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; }}}
              >
                {collapsed ? (
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: active ? color : 'rgba(160,144,184,0.4)',
                    flexShrink: 0,
                    boxShadow: active ? `0 0 8px ${color}` : 'none',
                    transition: 'all .2s',
                  }} />
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: active ? color : 'rgba(160,144,184,0.3)',
                        flexShrink: 0,
                        boxShadow: active ? `0 0 8px ${color}` : 'none',
                        transition: 'all .2s',
                      }} />
                      <span style={{
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        color: active ? '#fff' : '#A090B8',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color .2s',
                      }}>{ev.nome}</span>
                    </div>
                    {ev.status === 'EM VENDAS' && (
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        color: '#4ADE80',
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.25)',
                        borderRadius: 5,
                        padding: '2px 6px',
                        animation: 'ringPulse 2.2s infinite',
                        flexShrink: 0,
                      }}>LIVE</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      {!collapsed && (
        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(218,111,216,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Sparkle size={7} color="rgba(160,144,184,0.4)" />
            <span style={{ fontSize: 11, color: 'rgba(160,144,184,0.5)', fontFamily: 'var(--font-display)' }}>
              Trend Fidelidade v1.0
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(160,144,184,0.3)', paddingLeft: 13 }}>
            {DATA.geradoEm}
          </span>
        </div>
      )}
    </aside>
  );
}
