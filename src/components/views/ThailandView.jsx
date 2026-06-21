import { useState, useEffect, useRef, useMemo } from 'react';
import { motion as Motion } from 'motion/react';
import './thailand.css';
import { useThailandGoal } from '../../hooks/useThailandGoal';
import { computeGoal, estimateTripCost } from '../../utils/thailandCalc';
import { todayYMD } from '../../utils/dateUtils';
import AnimatedNumber from '../AnimatedNumber';

// Whole-shekel formatter (the global formatCurrency shows 2 decimals — too noisy
// for big goal figures). Thousands separated for readability.
const money = (n) => `₪${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

// Rough per-item costs in ₪ for the "¿qué compra tu dinero?" framing.
// These are deliberately approximate — tweak the `cost` values to taste.
const EXPERIENCES = [
  { key: 'massage', emoji: '💆', name: 'masajes tailandeses', cost: 35, gradient: 'linear-gradient(160deg,#f6d365,#fda085)', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=70' },
  { key: 'food', emoji: '🍜', name: 'comidas callejeras', cost: 15, gradient: 'linear-gradient(160deg,#ff9a9e,#fad0c4)', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70' },
  { key: 'scooter', emoji: '🛵', name: 'días en scooter', cost: 25, gradient: 'linear-gradient(160deg,#a1c4fd,#c2e9fb)', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=70' },
];

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </Motion.div>
  );
}

// --- hero with mouse parallax + live countdown -----------------------------

function Hero({ goal, tripDate }) {
  const heroRef = useRef(null);
  const [left, setLeft] = useState(() => diff(tripDate));

  useEffect(() => {
    const id = setInterval(() => setLeft(diff(tripDate)), 1000);
    return () => clearInterval(id);
  }, [tripDate]);

  const onMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;  // -1..1
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
  };

  const layer = (depth) => ({
    transform: `translate3d(calc(var(--mx,0) * ${depth}px), calc(var(--my,0) * ${depth}px), 0)`,
  });

  return (
    <div className="th-hero" ref={heroRef} onMouseMove={onMove}>
      <div className="th-hero-layer th-sky" style={layer(8)} />
      <div className="th-sun th-hero-layer" style={layer(16)} />

      {/* far sea silhouette */}
      <svg className="th-hero-layer th-sea-svg" style={layer(22)} viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#19c3c9" fillOpacity="0.55" d="M0,224 C240,160 480,288 720,256 C960,224 1200,160 1440,224 L1440,320 L0,320 Z" />
        <path fill="#0a7d8a" fillOpacity="0.75" d="M0,272 C240,224 480,304 720,288 C960,272 1200,240 1440,288 L1440,320 L0,320 Z" />
      </svg>

      {/* foreground palm silhouettes */}
      <svg className="th-hero-layer th-palm-svg" style={layer(40)} viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
        <g fill="#06323a" fillOpacity="0.92">
          <path d="M120,320 C112,250 116,200 122,170 C100,180 70,178 48,196 C74,176 96,158 124,160 C108,150 86,150 70,140 C96,142 116,150 128,162 C132,150 142,138 158,132 C146,146 138,158 134,170 C140,200 144,250 138,320 Z" />
          <path d="M1320,320 C1312,250 1316,200 1322,170 C1300,180 1270,178 1248,196 C1274,176 1296,158 1324,160 C1308,150 1286,150 1270,140 C1296,142 1316,150 1328,162 C1332,150 1342,138 1358,132 C1346,146 1338,158 1334,170 C1340,200 1344,250 1338,320 Z" />
        </g>
      </svg>

      <div className="th-plane th-hero-layer" style={layer(30)}>✈️</div>

      <div className="th-hero-content">
        <p className="th-hero-kicker">Mi viaje · Noviembre 2027</p>
        <h1 className="th-hero-title">Tailandia <em>2027</em></h1>
        <p className="th-hero-tag">
          {goal.configured
            ? `Vas ${Math.round(goal.pct * 100)}% del camino. Cada shekel te acerca a la playa.`
            : 'El fondo que te lleva de los ₪ a la arena.'}
        </p>

        <div className="th-countdown">
          <Box n={left.days} label="días" />
          <Box n={left.hours} label="horas" />
          <Box n={left.mins} label="min" />
          <Box n={left.secs} label="seg" />
        </div>
      </div>

      <div className="th-scroll-hint">
        <span>Tu progreso</span>
        <span>↓</span>
      </div>
    </div>
  );
}

function Box({ n, label }) {
  return (
    <div className="th-count-box">
      <span className="th-count-num th-num">{String(n).padStart(2, '0')}</span>
      <span className="th-count-label">{label}</span>
    </div>
  );
}

function diff(tripDate) {
  const target = new Date(`${tripDate}T00:00:00`).getTime();
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const mins = Math.floor(s / 60); s -= mins * 60;
  return { days, hours, mins, secs: s };
}

// --- experience card with graceful image fallback --------------------------

function ExperienceCard({ exp, count }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="th-exp" style={{ background: exp.gradient }}>
      {!broken && (
        <img className="th-exp-bg" src={exp.img} alt="" loading="lazy" onError={() => setBroken(true)} />
      )}
      {broken && <div className="th-exp-fallback">{exp.emoji}</div>}
      <div className="th-exp-shade" />
      <div className="th-exp-body">
        <div className="th-exp-count th-num">{count.toLocaleString('en-US')}</div>
        <div className="th-exp-name">{exp.emoji} {exp.name}</div>
        <div className="th-exp-unit">≈ {money(exp.cost)} c/u</div>
      </div>
    </div>
  );
}

// --- onboarding (empty state) ---------------------------------------------

function Onboarding({ onSave }) {
  const [form, setForm] = useState({ targetAmount: '', startingAmount: '', tripDate: '2027-11-15', dailyBudget: '' });
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
    setForm((f) => ({ ...f, targetAmount: String(total), dailyBudget: est.dailyBudget || f.dailyBudget }));
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
      dailyBudget: Number(form.dailyBudget) || 0,
    });
  };

  return (
    <div className="thailand-view">
      <div className="th-onboard">
        <div className="th-onboard-emoji">🏝️</div>
        <h1>Empecemos tu viaje a Tailandia</h1>
        <p>Define tu meta y la fecha. A partir de ahí calculo cuánto ahorrar por mes, te muestro dónde recortar y convierto tus shekels en días de playa.</p>

        <div className="th-card th-onboard-card">
          <div className="th-onboard-row">
            <div className="th-field">
              <label>Meta total (₪)</label>
              <input className="th-input th-num" type="number" inputMode="numeric" placeholder="20000" value={form.targetAmount} onChange={set('targetAmount')} />
            </div>
            <div className="th-field">
              <label>Ya ahorrado (₪)</label>
              <input className="th-input th-num" type="number" inputMode="numeric" placeholder="0" value={form.startingAmount} onChange={set('startingAmount')} />
            </div>
          </div>
          <div className="th-onboard-row">
            <div className="th-field">
              <label>Fecha del viaje</label>
              <input className="th-input" type="date" value={form.tripDate} onChange={set('tripDate')} />
            </div>
            <div className="th-field">
              <label>Presupuesto diario allá (₪)</label>
              <input className="th-input th-num" type="number" inputMode="numeric" placeholder="200" value={form.dailyBudget} onChange={set('dailyBudget')} />
            </div>
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

// --- main view -------------------------------------------------------------

function ThailandView({ transactions }) {
  const { config, contributions, saveConfig, addContribution, deleteContribution, resetGoal } = useThailandGoal();
  const today = todayYMD();
  const goal = useMemo(
    () => computeGoal(config, contributions, transactions, today),
    [config, contributions, transactions, today]
  );

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!goal.configured) {
    return <Onboarding onSave={saveConfig} />;
  }

  const suggested = Math.round(goal.surplus > 0 ? goal.surplus : goal.requiredMonthly);

  const submitContribution = () => {
    const v = Number(amount);
    if (!v || v <= 0) { alert('Pon un monto válido.'); return; }
    addContribution({ amount: v, note });
    setAmount('');
    setNote('');
  };

  const statusBanner = {
    ahead:    { cls: 'th-banner-ahead',    emoji: '🌴', text: <>A tu ritmo reciente llegas con <strong>{money(goal.projectedFinal)}</strong> — eso es <strong>{money(goal.projectedFinal - goal.target)} de sobra</strong>. Vas volando.</> },
    'on-track': { cls: 'th-banner-on-track', emoji: '⛵', text: <>Vas justo en línea. Mantén <strong>{money(goal.requiredMonthly)}/mes</strong> y llegas a tiempo.</> },
    behind:   { cls: 'th-banner-behind',   emoji: '🧭', text: <>Para llegar necesitas sumar solo <strong>{money(goal.adjustmentPerMonth || goal.requiredMonthly)}/mes</strong> extra. Pequeño ajuste, gran playa.</> },
    complete: { cls: 'th-banner-complete', emoji: '🎉', text: <><strong>¡Meta alcanzada!</strong> Tailandia está pagada. Ahora solo falta hacer la maleta.</> },
  }[goal.status];

  return (
    <div className="thailand-view">
      <Hero goal={goal} tripDate={config.tripDate} />

      {/* OCEAN PROGRESS */}
      <div className="th-ocean-wrap">
        <div className="th-ocean">
          <div className="th-ocean-fill" style={{ height: `${Math.max(6, goal.pct * 100)}%` }}>
            <svg className="th-wave" viewBox="0 0 400 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,12 C50,2 90,22 140,12 C190,2 230,22 280,12 C330,2 370,22 400,12 L400,24 L0,24 Z" fill="#19c3c9" />
            </svg>
          </div>
          <div className="th-ocean-readout">
            <div className="th-ocean-pct th-num"><AnimatedNumber value={goal.pct * 100} format={(v) => `${Math.round(v)}%`} /></div>
            <div className="th-ocean-amounts th-num">{money(goal.saved)} de {money(goal.target)}</div>
          </div>
        </div>
      </div>

      {/* PLAN */}
      <section className="th-section th-block">
        <Reveal>
          <p className="th-eyebrow">Tu plan</p>
          <h2 className="th-h2">Cuánto, cada mes, para llegar</h2>
          <p className="th-sub">Calculado sobre lo que falta y los meses que quedan. Si tu ritmo real de ahorro cambia, esto se ajusta solo.</p>
          <div className="th-stats-grid">
            <div className="th-card th-stat">
              <p className="th-stat-label">Aporte mensual objetivo</p>
              <div className="th-stat-value th-num">{money(goal.requiredMonthly)}</div>
              <p className="th-stat-foot">≈ {money(goal.requiredWeekly)} por semana</p>
            </div>
            <div className="th-card th-stat">
              <p className="th-stat-label">Te falta</p>
              <div className="th-stat-value th-num">{money(goal.remaining)}</div>
              <p className="th-stat-foot">{Math.max(0, Math.ceil(goal.monthsLeft))} meses para el viaje</p>
            </div>
            <div className="th-card th-stat">
              <p className="th-stat-label">Tu ritmo reciente</p>
              <div className="th-stat-value th-num">{goal.surplus > 0 ? money(goal.surplus) : money(0)}</div>
              <p className="th-stat-foot">superávit promedio / mes (de tus transacciones)</p>
            </div>
          </div>
          <div className={`th-banner ${statusBanner.cls}`}>
            <span className="th-banner-emoji">{statusBanner.emoji}</span>
            <span>{statusBanner.text}</span>
          </div>
        </Reveal>
      </section>

      {/* MILESTONES */}
      <section className="th-section th-block">
        <Reveal>
          <p className="th-eyebrow">El recorrido</p>
          <h2 className="th-h2">Tus paradas hacia la playa</h2>
          <div className="th-card th-journey">
            <div className="th-journey-track">
              <div className="th-journey-line">
                <div className="th-journey-line-fill" style={{ width: `${goal.pct * 100}%` }} />
              </div>
              {goal.milestones.map((m) => (
                <div key={m.label} className={`th-stop ${m.reached ? 'reached' : ''} ${m.isNext ? 'next' : ''}`}>
                  <div className="th-stop-dot">{m.emoji}</div>
                  <div className="th-stop-label">{m.label}</div>
                  <div className="th-stop-amount th-num">{money(m.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* WHAT YOUR MONEY BUYS */}
      {goal.dailyBudget > 0 && (
        <section className="th-section th-block">
          <Reveal>
            <p className="th-eyebrow">La recompensa</p>
            <h2 className="th-h2">Qué compra lo que ya ahorraste</h2>
            <p className="th-sub">Tus {money(goal.saved)} traducidos a experiencias reales en Tailandia (precios aproximados).</p>
            <div className="th-exp-grid">
              <ExperienceCard
                exp={{ key: 'days', emoji: '🏝️', name: 'días de viaje cubiertos', cost: goal.dailyBudget, gradient: 'linear-gradient(160deg,#43cea2,#185a9d)', img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=70' }}
                count={Math.floor(goal.daysCovered)}
              />
              {EXPERIENCES.map((exp) => (
                <ExperienceCard key={exp.key} exp={exp} count={Math.floor(goal.saved / exp.cost)} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* SAVINGS OPPORTUNITIES */}
      {goal.opportunities.length > 0 && (
        <section className="th-section th-block">
          <Reveal>
            <p className="th-eyebrow">Dónde ahorrar</p>
            <h2 className="th-h2">Pequeños recortes, muchos días de playa</h2>
            <p className="th-sub">Tus categorías más flexibles. Recortar un 20% y mandarlo al fondo suma esto para noviembre 2027.</p>
            <div className="th-opp-list">
              {goal.opportunities.map((o) => (
                <div key={o.category} className="th-card th-opp">
                  <span className="th-opp-emoji">{o.emoji}</span>
                  <div className="th-opp-main">
                    <div className="th-opp-title">{o.category}</div>
                    <div className="th-opp-desc">Gastas ≈ {money(o.monthlyAvg)}/mes. Recorta {money(o.suggestedCut)}/mes y mándalo a Tailandia.</div>
                  </div>
                  <div className="th-opp-impact">
                    <div className="th-opp-amount th-num">+{money(o.impactTotal)}</div>
                    {o.days >= 1 && <div className="th-opp-days">≈ {Math.floor(o.days)} días allá</div>}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* CONTRIBUTE + LEDGER */}
      <section className="th-section th-block">
        <Reveal>
          <p className="th-eyebrow">Aporta</p>
          <h2 className="th-h2">Suma al fondo</h2>
          <div className="th-contribute">
            <div className="th-card th-contribute-card">
              <div className="th-suggest">
                {goal.surplus > 0
                  ? <>Este mes tu superávit fue <b>{money(goal.surplus)}</b>. ¿Lo mandas a Tailandia?</>
                  : <>Tu objetivo es <b>{money(goal.requiredMonthly)}/mes</b>. Cada aporte cuenta.</>}
              </div>
              <div className="th-field">
                <label>Monto (₪)</label>
                <input className="th-input th-num" type="number" inputMode="numeric" placeholder={String(suggested)} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="th-field">
                <label>Nota (opcional)</label>
                <input className="th-input" type="text" placeholder="ej. me salté comer afuera" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button className="th-btn" onClick={() => { setAmount(String(suggested)); }}>Usar sugerido: {money(suggested)}</button>
              <div style={{ height: 10 }} />
              <button className="th-btn" onClick={submitContribution}>Aportar al fondo ✈️</button>
            </div>

            <div className="th-card th-ledger">
              <h3>Tus aportes</h3>
              {contributions.length === 0 ? (
                <p className="th-ledger-empty">Aún no hay aportes. El primero es el que más motiva.</p>
              ) : (
                contributions.map((c) => (
                  <div key={c.id} className="th-ledger-row">
                    <div className="th-ledger-info">
                      <div className="th-ledger-amount th-num">{money(c.amount)}</div>
                      <div className="th-ledger-meta">{c.date}{c.note ? ` · ${c.note}` : ''}</div>
                    </div>
                    <button className="th-ledger-del" onClick={() => deleteContribution(c.id)} aria-label="Eliminar aporte">×</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="th-settings-row">
            <button
              className="th-btn th-btn-ghost"
              onClick={() => {
                if (confirm('¿Reiniciar la meta y borrar todos los aportes? Esto no se puede deshacer.')) resetGoal();
              }}
            >
              Reiniciar meta
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export default ThailandView;
