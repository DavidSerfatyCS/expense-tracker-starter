import { useState, useMemo } from 'react';
import './thailand.css';
import ViajeTailandia from './ViajeTailandia';
import ThailandInsights from './ThailandInsights';
import Modal from '../Modal';
import { useThailandGoal } from '../../hooks/useThailandGoal';
import { fundBalance, monthlyInsights, estimateTripCost } from '../../utils/thailandCalc';
import { todayYMD } from '../../utils/dateUtils';

const money = (n) => `₪${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

// --- onboarding (first run) ------------------------------------------------

function Onboarding({ onSave }) {
  const [form, setForm] = useState({ targetAmount: '', startingAmount: '', tripDate: '2027-11-15' });
  const [showEst, setShowEst] = useState(false);
  const [est, setEst] = useState({ flights: '', nights: '', nightlyStay: '', days: '', dailyBudget: '', activities: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setE = (k) => (e) => setEst((s) => ({ ...s, [k]: e.target.value }));

  const applyEstimate = () => {
    const total = estimateTripCost({
      flights: Number(est.flights) || 0,
      nights: Number(est.nights) || 0,
      nightlyStay: Number(est.nightlyStay) || 0,
      days: Number(est.days) || 0,
      dailyBudget: Number(est.dailyBudget) || 0,
      activities: Number(est.activities) || 0,
    });
    setForm((f) => ({ ...f, targetAmount: String(total) }));
  };

  const submit = () => {
    if (!Number(form.targetAmount) || !form.tripDate) {
      alert('Pon al menos la meta total y la fecha del viaje.');
      return;
    }
    onSave({
      targetAmount: Number(form.targetAmount),
      startingAmount: Number(form.startingAmount) || 0,
      tripDate: form.tripDate,
      dailyBudget: Number(est.dailyBudget) || 0,
    });
  };

  return (
    <div className="thailand-view">
      <div className="th-onboard">
        <div className="th-onboard-emoji">🏝️</div>
        <h1>Empecemos tu viaje a Tailandia</h1>
        <p>Define tu meta y la fecha. A partir de ahí tu fondo crece con lo que registras a mano y con el superávit real de tus finanzas en Notion.</p>

        <div className="th-card th-onboard-card">
          <div className="th-onboard-row">
            <div className="th-field">
              <label>Meta total (₪)</label>
              <input className="th-input th-num" type="number" inputMode="numeric" placeholder="18000" value={form.targetAmount} onChange={set('targetAmount')} />
            </div>
            <div className="th-field">
              <label>Ya ahorrado (₪)</label>
              <input className="th-input th-num" type="number" inputMode="numeric" placeholder="0" value={form.startingAmount} onChange={set('startingAmount')} />
            </div>
          </div>
          <div className="th-field">
            <label>Fecha del viaje</label>
            <input className="th-input" type="date" value={form.tripDate} onChange={set('tripDate')} />
          </div>

          <button className="th-estimate-toggle" onClick={() => setShowEst((v) => !v)}>
            {showEst ? '− Ocultar estimador' : '¿No sabes la meta? Estímala →'}
          </button>

          {showEst && (
            <div style={{ marginTop: 14 }}>
              <div className="th-onboard-row">
                <div className="th-field"><label>Vuelos (₪)</label><input className="th-input th-num" type="number" value={est.flights} onChange={setE('flights')} /></div>
                <div className="th-field"><label>Actividades (₪)</label><input className="th-input th-num" type="number" value={est.activities} onChange={setE('activities')} /></div>
              </div>
              <div className="th-onboard-row">
                <div className="th-field"><label>Noches</label><input className="th-input th-num" type="number" value={est.nights} onChange={setE('nights')} /></div>
                <div className="th-field"><label>₪ / noche</label><input className="th-input th-num" type="number" value={est.nightlyStay} onChange={setE('nightlyStay')} /></div>
              </div>
              <div className="th-onboard-row">
                <div className="th-field"><label>Días</label><input className="th-input th-num" type="number" value={est.days} onChange={setE('days')} /></div>
                <div className="th-field"><label>₪ / día gastos</label><input className="th-input th-num" type="number" value={est.dailyBudget} onChange={setE('dailyBudget')} /></div>
              </div>
              <button className="th-btn th-btn-ghost" onClick={applyEstimate}>Calcular meta (+15% colchón)</button>
            </div>
          )}

          <button className="th-btn" onClick={submit}>Crear mi fondo de Tailandia ✈️</button>
        </div>
      </div>
    </div>
  );
}

// --- fund manager modal ----------------------------------------------------

function FundModal({ fb, contributions, onAdd, onDelete, onReset, onClose }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const box = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' };
  const input = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' };
  const label = { fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' };

  const submit = () => {
    const v = Number(amount);
    if (!v || v <= 0) { alert('Pon un monto válido.'); return; }
    onAdd({ amount: v, note });
    setAmount('');
    setNote('');
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ maxWidth: 460 }}>
        <h2 style={{ fontFamily: 'var(--font-display, serif)', margin: '0 0 4px', fontSize: 24 }}>Tu fondo de Tailandia</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '0 0 16px' }}>Tu ahorro combina lo que registras a mano con el superávit real de tus finanzas en Notion.</p>

        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
          <div style={{ ...box, display: 'flex', justifyContent: 'space-between' }}>
            <span>Superávit real (Notion)<br /><small style={{ color: 'var(--muted)' }}>ingresos − gastos desde {fb.start}</small></span>
            <strong className="num" style={{ color: 'var(--income)' }}>{money(fb.auto)}</strong>
          </div>
          <div style={{ ...box, display: 'flex', justifyContent: 'space-between' }}>
            <span>Aportes manuales + inicial</span>
            <strong className="num">{money(fb.manual)}</strong>
          </div>
          <div style={{ ...box, display: 'flex', justifyContent: 'space-between', background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
            <span><strong>Total ahorrado</strong></span>
            <strong className="num" style={{ color: 'var(--accent)', fontSize: 18 }}>{money(fb.total)}</strong>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Aporte manual (₪)</label>
          <input style={input} className="num" type="number" inputMode="numeric" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Nota (opcional)</label>
          <input style={input} type="text" placeholder="ej. regalo de cumpleaños" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={submit}>Aportar al fondo ✈️</button>

        {contributions.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ ...label, marginBottom: 8 }}>Aportes registrados</div>
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              {contributions.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span><strong className="num">{money(c.amount)}</strong> <small style={{ color: 'var(--muted)' }}>{c.date}{c.note ? ` · ${c.note}` : ''}</small></span>
                  <button onClick={() => onDelete(c.id)} aria-label="Eliminar" style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-ghost" style={{ width: '100%', marginTop: 16 }} onClick={() => { if (confirm('¿Reiniciar la meta y borrar todos los aportes? No se puede deshacer.')) { onReset(); onClose(); } }}>
          Reiniciar meta
        </button>
      </div>
    </Modal>
  );
}

// --- main container --------------------------------------------------------

function ThailandView({ transactions, theme }) {
  const { config, contributions, saveConfig, addContribution, deleteContribution, resetGoal } = useThailandGoal();
  const [showFund, setShowFund] = useState(false);
  const today = todayYMD();

  const fb = useMemo(
    () => fundBalance(config, contributions, transactions, today),
    [config, contributions, transactions, today]
  );

  const ins = useMemo(
    () => monthlyInsights(config, fb.total, transactions, today),
    [config, fb.total, transactions, today]
  );

  if (!config || !config.targetAmount) {
    return <Onboarding onSave={saveConfig} />;
  }

  return (
    <>
      <ViajeTailandia
        saved={fb.total}
        goal={config.targetAmount}
        tripDate={config.tripDate}
        theme={theme}
        afterOcean={<ThailandInsights ins={ins} theme={theme} />}
      />

      <button
        onClick={() => setShowFund(true)}
        aria-label="Gestionar fondo"
        style={{
          position: 'fixed', right: 24, bottom: 24, zIndex: 70,
          padding: '14px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff',
          background: 'linear-gradient(120deg,#ff6a5d,#ff5f8d)',
          boxShadow: '0 10px 30px -8px rgba(255,95,141,.7)',
        }}
      >
        ＋ Aportar al fondo
      </button>

      {showFund && (
        <FundModal
          fb={fb}
          contributions={contributions}
          onAdd={addContribution}
          onDelete={deleteContribution}
          onReset={resetGoal}
          onClose={() => setShowFund(false)}
        />
      )}
    </>
  );
}

export default ThailandView;
