import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Sparkle from './Sparkle';

const EVENTO_LABELS = {
  retronejo: { label: 'Retronejo', color: '#DA6FD8' },
  oboe:      { label: 'Oboé',     color: '#B94DB7' },
  augeboys:  { label: 'Augeboys', color: '#9333EA' },
};

function calcIdade(nasc) {
  if (!nasc) return null;
  try {
    const [d, m, y] = nasc.split('/');
    const diff = new Date(2026, 3, 13) - new Date(+y, m - 1, +d);
    const age = Math.floor(diff / (365.25 * 86400000));
    return age >= 10 && age <= 100 ? age : null;
  } catch { return null; }
}

function DataRow({ label, value }) {
  if (!value || value === 'undefined' || value === 'null') return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 0',
      borderBottom: '1px solid var(--c-row-border)',
    }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
        color: 'var(--c-text)', textAlign: 'right', maxWidth: '62%', wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function Modal({ pessoa, eventoNome, onClose, isGlobal = false }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!pessoa) return null;

  const idade = pessoa.idade ?? calcIdade(pessoa.nascimento);
  const tickets = isGlobal ? pessoa.totalIngressos : pessoa.ingressos;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--c-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Gradient border wrapper */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: 'linear-gradient(140deg, rgba(218,111,216,0.55), rgba(147,51,234,0.25), rgba(218,111,216,0.08))',
          borderRadius: 24,
          padding: '1px',
          animation: 'modalUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(218,111,216,0.12)',
        }}
      >
        <div style={{
          background: 'var(--c-surface-solid)',
          borderRadius: 23,
          padding: '26px 28px',
          backdropFilter: 'blur(30px)',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <Sparkle size={8} color="#DA6FD8" />
                <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>
                  {isGlobal ? 'Ranking Global' : eventoNome}
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 21, fontWeight: 800, color: 'var(--c-text)', lineHeight: 1.15,
              }}>
                {pessoa.nome}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(218,111,216,0.08)',
                border: '1px solid rgba(218,111,216,0.18)',
                borderRadius: 10, color: '#DA6FD8',
                cursor: 'pointer', padding: '7px 10px',
                fontSize: 14, lineHeight: 1,
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,111,216,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,111,216,0.08)'}
            >
              ✕
            </button>
          </div>

          {/* Ticket count hero */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(218,111,216,0.12), rgba(147,51,234,0.06))',
            border: '1px solid rgba(218,111,216,0.22)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 44, fontWeight: 800,
              background: 'linear-gradient(135deg, var(--c-text), #DA6FD8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}>
              {tickets}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', fontFamily: 'var(--font-display)' }}>
                ingresso{tickets !== 1 ? 's' : ''}
              </div>
              {isGlobal ? (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  em {pessoa.numEventos} evento{pessoa.numEventos !== 1 ? 's' : ''}
                </div>
              ) : eventoNome ? (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>no {eventoNome}</div>
              ) : null}
            </div>
          </div>

          {/* Data rows */}
          <div>
            <DataRow label="CPF"         value={pessoa.cpf} />
            <DataRow label="E-mail"      value={pessoa.email} />
            <DataRow label="Celular"     value={pessoa.celular} />
            <DataRow label="Sexo"        value={pessoa.sexo} />
            <DataRow label="Idade"       value={idade ? `${idade} anos` : null} />
            <DataRow label="Nascimento"  value={pessoa.nascimento} />
          </div>

          {/* Event breakdown (global) */}
          {isGlobal && pessoa.eventos && Object.keys(pessoa.eventos).length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Ingressos por evento
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(pessoa.eventos).map(([key, qtd]) => {
                  const ev = EVENTO_LABELS[key] || { label: key, color: '#A090B8' };
                  return (
                    <div key={key} style={{
                      background: `${ev.color}12`,
                      border: `1px solid ${ev.color}35`,
                      borderRadius: 10,
                      padding: '7px 13px',
                      display: 'flex', alignItems: 'center', gap: 7,
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: ev.color }}>{qtd}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ev.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
