// Insights section for the Tailandia page — rendered under ViajeTailandia.
// Pure presentational; all numbers come from monthlyInsights() (Notion-based).

const money = (n) => `₪${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

function ThailandInsights({ ins, theme }) {
  const dark = theme === 'dark';
  const c = {
    ink: dark ? '#eafaf6' : '#143a40',
    ink2: dark ? '#9bc1c0' : '#4a6e72',
    panel: dark ? '#0c2630' : '#ffffff',
    line: dark ? 'rgba(255,255,255,.10)' : 'rgba(20,58,64,.12)',
    bg: dark ? 'linear-gradient(180deg,#08202a,#05131a)' : 'linear-gradient(180deg,#fff8ef,#fbf3e7)',
    turq: '#13b1aa', turqD: dark ? '#36d6cd' : '#0a8a86',
    coral: '#ff6a5d', coralD: dark ? '#ff8275' : '#e84f3f', gold: '#ffbf45',
    shadow: dark ? 'rgba(0,0,0,.5)' : 'rgba(20,50,55,.14)',
  };

  const card = { background: c.panel, border: `1px solid ${c.line}`, borderRadius: 20, padding: 24, boxShadow: `0 14px 34px ${c.shadow}` };
  const eyebrow = { fontSize: 13, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: c.coralD };
  const statLabel = { fontSize: 12.5, fontWeight: 600, color: c.ink2, margin: 0 };
  const statValue = { fontFamily: "'Instrument Serif',serif", fontSize: 38, lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums' };

  const st = {
    complete: { bg: 'rgba(19,177,170,.16)', bd: c.turq, emoji: '🎉', text: '¡Meta alcanzada! Tailandia está cubierta. Ahora solo falta hacer la maleta.' },
    ahead: { bg: 'rgba(19,177,170,.14)', bd: c.turq, emoji: '🌴', text: `Vas por buen camino: tu ritmo real (${money(ins.pace)}/mes) supera tu cuota de ${money(ins.requiredMonthly)}/mes. A este paso llegas con ${money(ins.projectedFinal)}.` },
    'on-track': { bg: 'rgba(255,191,69,.18)', bd: c.gold, emoji: '⛵', text: `Vas justo en línea. Mantén ${money(ins.requiredMonthly)}/mes y llegas a tiempo a noviembre 2027.` },
    short: { bg: 'rgba(255,106,93,.14)', bd: c.coral, emoji: '🧭', text: `Vas corto: tu ritmo (${money(ins.pace)}/mes) no alcanza la cuota (${money(ins.requiredMonthly)}/mes). Te faltan ${money(ins.monthlyGap)}/mes — abajo te digo de dónde sacarlo.` },
  }[ins.status];

  return (
    <section style={{ background: c.bg, color: c.ink, padding: 'clamp(48px,8vh,96px) clamp(20px,5vw,56px)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 36px' }}>
          <div style={eyebrow}>Tu plan de ahorro · según Notion</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: 'clamp(28px,4.6vw,46px)', lineHeight: 1.05, margin: '12px 0 10px' }}>Cómo llegar a tu cuota mensual</h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: c.ink2, margin: 0 }}>Calculado con lo que te falta, los meses que quedan y tu superávit real (ingresos − gastos) de Notion.</p>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 18 }}>
          <div style={card}>
            <p style={statLabel}>Cuánto ahorrar por mes</p>
            <div style={{ ...statValue, color: c.coralD }}>{money(ins.requiredMonthly)}</div>
            <p style={{ fontSize: 13, color: c.ink2, marginTop: 8 }}>≈ {money(ins.requiredWeekly)} por semana · {Math.max(0, Math.ceil(ins.monthsLeft))} meses restantes</p>
          </div>
          <div style={card}>
            <p style={statLabel}>Tu ritmo real (Notion)</p>
            <div style={{ ...statValue, color: ins.pace > 0 ? c.turqD : c.coralD }}>{money(ins.surplus)}</div>
            <p style={{ fontSize: 13, color: c.ink2, marginTop: 8 }}>superávit promedio / mes (últimos 3 meses)</p>
          </div>
          <div style={card}>
            <p style={statLabel}>Proyección a tu ritmo</p>
            <div style={{ ...statValue, color: c.turqD }}>{money(ins.projectedFinal)}</div>
            <p style={{ fontSize: 13, color: c.ink2, marginTop: 8 }}>{ins.projectedGap > 0 ? `te quedarías a ${money(ins.projectedGap)} de la meta` : 'llegas (o superas) la meta'}</p>
          </div>
        </div>

        {/* status banner */}
        <div style={{ marginTop: 18, padding: '20px 24px', borderRadius: 18, background: st.bg, border: `1px solid ${st.bd}`, display: 'flex', gap: 16, alignItems: 'center', fontSize: 16, lineHeight: 1.5 }}>
          <span style={{ fontSize: 30 }}>{st.emoji}</span>
          <span>{st.text}</span>
        </div>

        {/* where to cut / automate */}
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: 26, margin: '40px 0 6px' }}>Dónde recortar para llegar a la cuota</h3>
        <p style={{ fontSize: 14.5, color: c.ink2, margin: '0 0 18px' }}>
          Tus categorías más flexibles en Notion. Recortar un 20% y mandarlo al fondo aporta esto cada mes:
        </p>

        {ins.opportunities.length === 0 ? (
          <div style={{ ...card, color: c.ink2, fontSize: 14.5 }}>Aún no hay suficientes movimientos en Notion para sugerir recortes. Registra unas semanas de gastos y vuelve.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ins.opportunities.map((o) => (
              <div key={o.category} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px' }}>
                <span style={{ fontSize: 30 }}>{o.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{o.category}</div>
                  <div style={{ fontSize: 13.5, color: c.ink2, marginTop: 3 }}>Gastas ≈ {money(o.monthlyAvg)}/mes · recorta {money(o.suggestedCut)}/mes</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c.turqD, fontVariantNumeric: 'tabular-nums' }}>+{money(o.suggestedCut)}</div>
                  <div style={{ fontSize: 12, color: c.ink2 }}>al mes</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {ins.opportunities.length > 0 && ins.monthlyGap > 0 && (
          <p style={{ fontSize: 14.5, color: c.ink2, marginTop: 14 }}>
            {ins.cutsCoverGap
              ? `✅ Estos recortes suman ${money(ins.cutsPerMonth)}/mes — cubren los ${money(ins.monthlyGap)}/mes que te faltan para tu cuota.`
              : `Estos recortes suman ${money(ins.cutsPerMonth)}/mes; cubren parte de los ${money(ins.monthlyGap)}/mes que faltan. El resto, automatízalo (abajo).`}
          </p>
        )}

        {/* automation tip */}
        <div style={{ marginTop: 22, borderRadius: 20, padding: 24, color: '#fff', background: `linear-gradient(135deg,${c.turq},${c.turqD})`, boxShadow: `0 14px 34px ${c.shadow}` }}>
          <div style={{ fontSize: 13, letterSpacing: '1.2px', textTransform: 'uppercase', opacity: 0.9 }}>Automatiza tu ahorro</div>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginTop: 8 }}>
            {ins.status === 'short'
              ? `Programa una transferencia automática de ${money(ins.requiredMonthly)}/mes el día que cobras, y aplica los recortes de arriba. Lo que no ves, no lo gastas.`
              : `Programa una transferencia automática de ${money(ins.requiredMonthly)}/mes el día que cobras. Es la forma más fiable de llegar sin pensarlo.`}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThailandInsights;
