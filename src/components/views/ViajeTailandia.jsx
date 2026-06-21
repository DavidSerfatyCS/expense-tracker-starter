/*
  ViajeTailandia.jsx — Componente React autónomo (sin dependencias externas).
  Copia este archivo a tu proyecto (p.ej. src/components/ViajeTailandia.jsx).

  USO BÁSICO
  ----------
    import ViajeTailandia from './components/ViajeTailandia';
    <ViajeTailandia saved={7200} goal={18000} tripDate="2027-11-15" />

  PROPS
  -----
    saved     number  — cuánto llevas ahorrado (en ₪). Por defecto 7200.
    goal      number  — meta total del viaje (en ₪). Por defecto 18000.
    tripDate  string  — fecha objetivo en formato YYYY-MM-DD. Por defecto '2027-11-15'.
    theme     'light' | 'dark' | undefined — fuerza el tema. Si lo omites, usa el del
              sistema + un botón para alternar (y recuerda la elección en localStorage).

  DATOS DESDE NOTION (resumen, ver notas al final del chat)
  ---------------------------------------------------------
    La API de Notion NO se puede llamar desde el navegador (token secreto + CORS),
    así que el número de "ahorrado" lo traes en tu backend / route de servidor y se
    lo pasas como prop. Ejemplo en el chat.
*/
import React from 'react';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap';

const CSS = `
.vt-root{--bg:#fbf3e7;--bg2:#fff8ef;--panel:#ffffff;--panel2:#fffaf2;--ink:#143a40;--ink2:#4a6e72;--line:rgba(20,58,64,.12);--lineS:rgba(20,58,64,.06);--turq:#13b1aa;--turqD:#0a8a86;--coral:#ff6a5d;--coralD:#e84f3f;--gold:#ffbf45;--sand:#e6cda0;--sky1:#9d5bb0;--sky2:#ff7d8f;--sky3:#ff9a55;--sky4:#ffd06a;--sky5:#ffe9ad;--sea1:#1fb6ad;--sea2:#0c7f86;--seaDeep:#064a55;--shadow:rgba(20,50,55,.16);--glow:rgba(255,178,90,.55)}
.vt-root[data-theme="dark"]{--bg:#05131a;--bg2:#08202a;--panel:#0c2630;--panel2:#0f2d38;--ink:#eafaf6;--ink2:#9bc1c0;--line:rgba(255,255,255,.10);--lineS:rgba(255,255,255,.05);--turq:#36d6cd;--turqD:#15ada4;--coral:#ff8275;--coralD:#ff6a5d;--gold:#ffce7a;--sand:#caa86f;--sky1:#311f4d;--sky2:#7d3a6b;--sky3:#c75d5a;--sky4:#e89a55;--sky5:#f4c97a;--sea1:#0f9aa0;--sea2:#06525d;--seaDeep:#032a33;--shadow:rgba(0,0,0,.55);--glow:rgba(255,170,90,.5)}
.vt-root *{box-sizing:border-box}
@keyframes vt-sunGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.14)}}
@keyframes vt-cloudFloat{0%{transform:translateX(-30px)}100%{transform:translateX(30px)}}
@keyframes vt-palmSway{0%,100%{transform:rotate(-2.2deg)}50%{transform:rotate(2.2deg)}}
@keyframes vt-palmSwayR{0%,100%{transform:rotate(2.2deg)}50%{transform:rotate(-2.2deg)}}
@keyframes vt-planeIdle{0%,100%{transform:translateY(0) rotate(8deg)}50%{transform:translateY(-14px) rotate(8deg)}}
@keyframes vt-waveSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes vt-floatUp{0%{transform:translate(0,0);opacity:0}12%{opacity:.85}80%{opacity:.55}100%{transform:translate(var(--dx,16px),-86vh);opacity:0}}
@keyframes vt-bob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(3deg)}}
@keyframes vt-confettiFall{0%{transform:translateY(-12vh) rotate(0);opacity:1}100%{transform:translateY(108vh) rotate(760deg);opacity:.9}}
@keyframes vt-dashFlow{to{stroke-dashoffset:-60}}
@keyframes vt-scrollCue{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(8px);opacity:1}}
@keyframes vt-ringPulse{0%{box-shadow:0 0 0 0 var(--glow)}70%{box-shadow:0 0 0 14px rgba(0,0,0,0)}100%{box-shadow:0 0 0 0 rgba(0,0,0,0)}}
`;

// CSS string -> React style object (camelCases keys, keeps --custom-props)
function s2o(str) {
  const o = {};
  if (!str) return o;
  String(str).split(';').forEach((decl) => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    let k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (!k) return;
    if (!k.startsWith('--')) k = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[k] = v;
  });
  return o;
}

const PLANE_PATH =
  'M24 2 L27 21 L46 31 L46 35 L27 28 L26 40 L32 44 L32 46 L24 43.5 L16 46 L16 44 L22 40 L21 28 L2 35 L2 31 L21 21 Z';

export default class ViajeTailandia extends React.Component {
  constructor(props) {
    super(props);
    let theme = props.theme || 'light';
    if (!props.theme) {
      try {
        const saved = typeof localStorage !== 'undefined' && localStorage.getItem('tailandia-theme');
        if (saved) theme = saved;
        else if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
      } catch { /* noop */ }
    }
    this.state = { theme, now: Date.now(), hover: null, clicked: {} };
    this.rootRef = React.createRef();
    this.cur = { x: 0, y: 0 };
    this.tgt = { x: 0, y: 0 };
    this.VBW = 1000;
    this.VBH = 340;

    // partículas (creadas una vez; la animación sobrevive a re-renders)
    this.particlesEls = [];
    for (let i = 0; i < 20; i++) {
      const left = Math.round(Math.random() * 100);
      const size = 3 + Math.round(Math.random() * 6);
      const dur = 9 + Math.random() * 10;
      const delay = -Math.random() * 16;
      const dx = (Math.random() * 60 - 30).toFixed(0) + 'px';
      this.particlesEls.push(
        <div key={i} style={{ position: 'absolute', left: left + '%', bottom: '-12px', width: size + 'px', height: size + 'px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', filter: 'blur(0.6px)', '--dx': dx, animation: `vt-floatUp ${dur}s ease-in ${delay}s infinite` }} />
      );
    }
    const colors = ['#13b1aa', '#ff6a5d', '#ffbf45', '#ff9a55', '#36d6cd', '#ffffff'];
    this.confettiEls = [];
    for (let i = 0; i < 70; i++) {
      const left = Math.random() * 100;
      const w = 6 + Math.random() * 8, h = 8 + Math.random() * 10;
      const dur = 3.4 + Math.random() * 3.2;
      const delay = -Math.random() * 4;
      this.confettiEls.push(
        <div key={i} style={{ position: 'absolute', left: left + '%', top: '-5%', width: w + 'px', height: h + 'px', background: colors[i % colors.length], borderRadius: '2px', animation: `vt-confettiFall ${dur}s linear ${delay}s infinite` }} />
      );
    }
  }

  componentDidMount() {
    // fuente
    try {
      if (!document.querySelector('link[data-vt-font]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = FONT_HREF;
        l.setAttribute('data-vt-font', '1');
        document.head.appendChild(l);
      }
    } catch { /* noop */ }

    this._tick = setInterval(() => this.setState({ now: Date.now() }), 1000);
    this._onMove = (e) => {
      this.tgt.x = (e.clientX / window.innerWidth - 0.5) * 60;
      this.tgt.y = (e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener('mousemove', this._onMove, { passive: true });
    this._loop = () => {
      this.cur.x += (this.tgt.x - this.cur.x) * 0.08;
      this.cur.y += (this.tgt.y - this.cur.y) * 0.08;
      this.applyParallax();
      this._raf = requestAnimationFrame(this._loop);
    };
    this._raf = requestAnimationFrame(this._loop);

    const root = this.rootRef.current;
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(34px)';
      el.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)';
    });
    this._onScroll = () => this.checkVisible();
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this.checkVisible();
    setTimeout(() => this.checkVisible(), 120);

    this._onResize = () => this.layout();
    window.addEventListener('resize', this._onResize);
    requestAnimationFrame(() => this.layout());
    setTimeout(() => this.layout(), 400);
  }

  componentDidUpdate(prev) {
    if (prev.theme !== this.state.theme) {
      try { localStorage.setItem('tailandia-theme', this.state.theme); } catch { /* noop */ }
    }
    if (this.props.theme && this.props.theme !== this.state.theme) {
      this.setState({ theme: this.props.theme });
    }
    this.layout();
    const root = this.rootRef.current;
    if (root) root.querySelectorAll('[data-countup]').forEach((el) => { if (el.dataset.done) this.setCountText(el, +el.dataset.target || 0); });
  }

  componentWillUnmount() {
    clearInterval(this._tick);
    cancelAnimationFrame(this._raf);
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll);
  }

  checkVisible() {
    const root = this.rootRef.current; if (!root) return;
    const vh = window.innerHeight || 800;
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.dataset.shown) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) { el.dataset.shown = '1'; el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    root.querySelectorAll('[data-countup]').forEach((el) => {
      if (el.dataset.done) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) this.animateCount(el);
    });
  }

  applyParallax() {
    const root = this.rootRef.current; if (!root) return;
    root.querySelectorAll('[data-depth]').forEach((el) => {
      const d = parseFloat(el.getAttribute('data-depth')) || 0;
      el.style.transform = `translate3d(${(this.cur.x * d).toFixed(2)}px, ${(this.cur.y * d).toFixed(2)}px, 0)`;
    });
  }

  goal() { return Math.max(0, this.props.goal ?? 18000); }
  saved() { return Math.max(0, this.props.saved ?? 7200); }
  pct() { const g = this.goal(); return g > 0 ? Math.max(0, Math.min(100, (this.saved() / g) * 100)) : 0; }

  layout() {
    const root = this.rootRef.current; if (!root) return;
    const f = this.pct() / 100;
    const water = root.querySelector('[data-water]'); if (water) water.style.height = this.pct() + '%';
    const path = root.querySelector('[data-route]');
    const prog = root.querySelector('[data-route-prog]');
    if (path && prog) {
      const L = path.getTotalLength();
      prog.style.strokeDasharray = L + ' ' + L;
      prog.style.strokeDashoffset = L * (1 - f);
      prog.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)';
      const plane = root.querySelector('[data-routeplane]');
      if (plane) {
        const pt = path.getPointAtLength(L * f);
        const pt2 = path.getPointAtLength(Math.min(L, L * f + 1));
        const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI + 90;
        plane.style.left = (pt.x / this.VBW) * 100 + '%';
        plane.style.top = (pt.y / this.VBH) * 100 + '%';
        const inner = plane.querySelector('svg');
        if (inner) inner.style.transform = `translate(-50%,-50%) rotate(${ang.toFixed(1)}deg)`;
      }
      root.querySelectorAll('[data-ms]').forEach((dot) => {
        const at = parseFloat(dot.getAttribute('data-ms')) || 0;
        const pt = path.getPointAtLength(L * (at / 100));
        dot.style.left = (pt.x / this.VBW) * 100 + '%';
        dot.style.top = (pt.y / this.VBH) * 100 + '%';
      });
    }
  }

  fmtMoney(n) { return '₪' + Math.round(n).toLocaleString('en-US'); }
  setCountText(el, target) {
    const pre = el.dataset.prefix || ''; const suf = el.dataset.suffix || '';
    el.textContent = pre + Math.round(target).toLocaleString('en-US') + suf;
  }
  animateCount(el) {
    const target = +el.dataset.target || 0; const dur = 1500; const start = performance.now();
    el.dataset.done = '1';
    if (el._raf) cancelAnimationFrame(el._raf);
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      this.setCountText(el, target * e);
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  toggleTheme = () => this.setState((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }));

  stateKey() { const p = this.pct(); if (p <= 0) return 'empty'; if (p >= 100) return 'reached'; if (p >= 75) return 'almost'; return 'progress'; }

  milestoneData() {
    const p = this.pct();
    const defs = [
      { at: 0, label: 'Tel Aviv', sub: 'El sueño despega' },
      { at: 25, label: 'Vuelos', sub: 'Billetes reservados' },
      { at: 50, label: 'Cama con vistas', sub: 'Alojamiento cubierto' },
      { at: 75, label: 'Aventuras', sub: 'Islas, templos y masajes' },
      { at: 100, label: 'Tailandia', sub: '¡Maletas listas!' },
    ];
    return defs.map((d) => {
      const reached = p >= d.at - 0.001;
      const dotBase = 'width:18px;height:18px;border-radius:50%;border:3px solid #fff;transition:all .4s;';
      const dotStyle = reached
        ? dotBase + 'background:var(--coral);box-shadow:0 0 0 4px color-mix(in srgb,var(--coral) 40%,transparent),0 4px 10px var(--shadow);animation:vt-ringPulse 2.4s ease-out infinite;'
        : dotBase + 'background:var(--panel);box-shadow:0 0 0 2px var(--line);opacity:.85;';
      const labelStyle = 'font-size:11px;font-weight:700;letter-spacing:.3px;white-space:nowrap;padding:3px 8px;border-radius:999px;backdrop-filter:blur(4px);' + (reached ? 'background:color-mix(in srgb,var(--coral) 16%,var(--panel));color:var(--coralD);' : 'background:var(--panel);color:var(--ink2);border:1px solid var(--line);');
      const cardStyle = 'border-radius:18px;padding:18px;border:1px solid ' + (reached ? 'color-mix(in srgb,var(--turq) 40%,var(--line))' : 'var(--line)') + ';background:' + (reached ? 'linear-gradient(160deg,color-mix(in srgb,var(--turq) 10%,var(--panel)),var(--panel))' : 'var(--panel)') + ';box-shadow:0 10px 26px var(--shadow);transition:all .4s;';
      const chipStyle = 'font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:4px 8px;border-radius:999px;' + (reached ? 'background:var(--turq);color:#04282a;' : 'background:var(--lineS);color:var(--ink2);');
      return { at: d.at, atLabel: d.at + '%', label: d.label, sub: d.sub, reached, dotStyle, labelStyle, cardStyle, chipStyle, status: reached ? 'Hecho' : 'Pendiente' };
    });
  }

  cardData() {
    const saved = this.saved();
    const defs = [
      { tag: 'Hotel', label: 'Una noche frente al mar', place: 'Koh Lanta', price: 185, unit: 'noches', img: ['#1fb6ad', '#0c7f86'], quip: 'Despiertas con el sonido de las olas.' },
      { tag: 'Spa', label: 'Un masaje tailandés', place: '1 hora de gloria', price: 40, unit: 'masajes', img: ['#ff9a55', '#ff6a5d'], quip: 'Adiós tensión de oficina.' },
      { tag: 'Tour', label: 'Un día de islas', place: 'Phi Phi & Maya Bay', price: 160, unit: 'excursiones', img: ['#9d5bb0', '#ff7d8f'], quip: 'Aguas turquesa de postal.' },
      { tag: 'Comida', label: 'Festín de street food', place: 'Pad thai + mango sticky', price: 35, unit: 'festines', img: ['#ffbf45', '#ff9a55'], quip: 'El sabor que vas a echar de menos.' },
      { tag: 'Cultura', label: 'Templos en tuk-tuk', place: 'Bangkok', price: 70, unit: 'rutas', img: ['#13b1aa', '#9d5bb0'], quip: 'Oro, incienso y caos precioso.' },
      { tag: 'Buceo', label: 'Buceo en Koh Tao', place: '2 inmersiones', price: 320, unit: 'días de buceo', img: ['#0c7f86', '#064a55'], quip: 'Otro mundo bajo el agua.' },
    ];
    const hover = this.state.hover, clicked = this.state.clicked;
    return defs.map((d, i) => {
      const flipped = !!clicked[i] || hover === i;
      const count = Math.floor(saved / d.price);
      return {
        tag: d.tag, label: d.label, place: d.place, quip: d.quip,
        priceText: this.fmtMoney(d.price), count,
        countLabel: count === 1 ? d.unit.replace(/s$/, '') : d.unit,
        deg: flipped ? 180 : 0,
        imgBg: `linear-gradient(150deg,${d.img[0]},${d.img[1]})`,
        backTop: d.img[0], backBot: d.img[1],
        onClick: () => this.setState((s) => { const c = { ...s.clicked }; c[i] = !c[i]; return { clicked: c }; }),
        onEnter: () => this.setState({ hover: i }),
        onLeave: () => this.setState((s) => (s.hover === i ? { hover: null } : null)),
      };
    });
  }

  palmSVG() {
    const fronds = [-64, -32, 0, 34, 66, -50, 52];
    return (
      <div style={{ position: 'relative', width: '150px', height: '230px' }}>
        <div style={{ position: 'absolute', left: '66px', bottom: '0', width: '16px', height: '170px', borderRadius: '8px', background: 'linear-gradient(90deg,#2a4a3a,#3c6b4f)', transformOrigin: 'bottom', transform: 'rotate(-4deg)' }} />
        {fronds.map((rot, i) => (
          <div key={i} style={{ position: 'absolute', left: '74px', top: '10px', width: '90px', height: '26px', borderRadius: '0 50% 50% 0 / 0 100% 100% 0', background: 'linear-gradient(90deg,#2e5a3f,#46815a)', transformOrigin: 'left center', transform: `rotate(${rot}deg)` }} />
        ))}
        <div style={{ position: 'absolute', left: '70px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: '#244a36' }} />
      </div>
    );
  }

  countdownData() {
    const target = new Date((this.props.tripDate || '2027-11-15') + 'T00:00:00').getTime();
    let diff = Math.max(0, target - this.state.now);
    const day = Math.floor(diff / 86400000); diff -= day * 86400000;
    const hr = Math.floor(diff / 3600000); diff -= hr * 3600000;
    const mi = Math.floor(diff / 60000); diff -= mi * 60000;
    const se = Math.floor(diff / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return { day, list: [ { value: String(day), label: 'Días' }, { value: pad(hr), label: 'Horas' }, { value: pad(mi), label: 'Minutos' }, { value: pad(se), label: 'Segundos' } ] };
  }

  render() {
    const key = this.stateKey();
    const pctDisplay = Math.round(this.pct());
    const saved = this.saved(), goal = this.goal();
    const remaining = Math.max(0, goal - saved);
    const cd = this.countdownData();
    const ms = this.milestoneData();
    const cards = this.cardData();
    const next = ms.find((m) => !m.reached);
    const isDark = this.state.theme === 'dark';

    const heroBadge = { empty: 'Salida · Tel Aviv', progress: 'En ruta · ' + pctDisplay + '%', almost: 'Aterrizaje cercano', reached: '¡Has llegado!' }[key];
    const heroSub = {
      empty: 'Tu aventura empieza con el primer shekel. El avión espera en la pista de Tel Aviv: da el primer paso.',
      progress: 'El avión ya sobrevuela el mar. Llevas ' + pctDisplay + '% del camino hacia las playas de Tailandia.',
      almost: 'Casi en pista de aterrizaje. Ya casi hueles el curry verde y el protector solar.',
      reached: '¡Maletas listas! Nos vamos a Tailandia. 🌴 Lo has conseguido, shekel a shekel.',
    }[key];
    const oceanCopy = {
      empty: 'Tu océano está en calma… por ahora. Cada ahorro levanta un poco la marea.',
      progress: 'La marea sube. Has llenado el ' + pctDisplay + '% de tu océano de ahorro.',
      almost: 'Marea alta. Tu océano casi rebosa: queda muy poco para desbordar de alegría.',
      reached: '¡Océano lleno! El mar de Andamán te espera con los brazos (y las olas) abiertos.',
    }[key];
    const oceanNudge = {
      empty: 'Truco: automatiza un traspaso semanal. Lo que no ves, no lo gastas.',
      progress: 'Sigue así: cada ahorro te acerca otro poquito a la playa.',
      almost: 'Un último empujón y cierras la maleta. Tú puedes.',
      reached: 'Meta cumplida. Ahora la única decisión difícil es qué isla primero.',
    }[key];
    const routeCopy = {
      empty: 'Cinco paradas separan tu casa de la playa. Cada hito que ahorras enciende una luz en el mapa.',
      progress: 'Tu avión avanza por la ruta a medida que ahorras. Próxima parada por desbloquear: ' + (next ? next.label : '—') + '.',
      almost: 'Casi todas las paradas encendidas. El avión inicia su descenso hacia Tailandia.',
      reached: 'Ruta completa. Todas las paradas brillan: de Tel Aviv a Tailandia, sin escalas en tus ganas.',
    }[key];
    const ctaTitle = {
      empty: 'El mejor momento para empezar fue ayer. El segundo mejor es hoy.',
      progress: 'Vas por muy buen camino. Tailandia está cada día más cerca.',
      almost: 'Ya casi puedes oler la sal del mar de Andamán.',
      reached: 'Nos vamos a Tailandia 🌴',
    }[key];
    const ctaSub = {
      empty: 'Define un traspaso automático y deja que el tiempo (y noviembre 2027) hagan el resto.',
      progress: 'Tailandia no se mueve de sitio, pero tú cada día estás más cerca de ella.',
      almost: 'Un último tramo de ahorro y empiezas a hacer la maleta.',
      reached: 'Has convertido cada shekel en recuerdos por venir. Buen viaje.',
    }[key];

    return (
      <div ref={this.rootRef} className="vt-root" data-theme={this.state.theme} style={s2o("min-height:100vh;background:radial-gradient(120% 80% at 80% -10%,var(--bg2),var(--bg) 60%);color:var(--ink);font-family:'DM Sans',system-ui,-apple-system,sans-serif;overflow-x:hidden;position:relative")}>
        <style>{CSS}</style>

        {/* HEADER */}
        <header style={s2o("position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(16px,4vw,40px);backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 72%,transparent);border-bottom:1px solid var(--lineS)")}>
          <div style={s2o("display:flex;align-items:center;gap:12px;min-width:0")}>
            <div style={s2o("width:34px;height:34px;border-radius:11px;flex:none;display:grid;place-items:center;background:linear-gradient(140deg,var(--coral),var(--gold));box-shadow:0 4px 14px var(--shadow)")}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ transform: 'rotate(45deg)' }}><path fill="#fff" d={PLANE_PATH} /></svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={s2o("font-family:'Instrument Serif',serif;font-size:19px;line-height:1;letter-spacing:.2px")}>El viaje a Tailandia</div>
              <div style={s2o("font-size:11px;color:var(--ink2);letter-spacing:.6px;text-transform:uppercase;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>Tel Aviv → Tailandia · nov 2027</div>
            </div>
          </div>
          <div style={s2o("display:flex;align-items:center;gap:10px;flex:none")}>
            <div style={s2o("display:flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;background:var(--panel);border:1px solid var(--line);box-shadow:0 3px 10px var(--shadow)")}>
              <span style={s2o("width:8px;height:8px;border-radius:50%;background:var(--turq);box-shadow:0 0 8px var(--turq)")} />
              <span style={s2o("font-weight:700;font-size:13px;font-variant-numeric:tabular-nums")}>{pctDisplay}%</span>
              <span style={s2o("font-size:12px;color:var(--ink2)")}>ahorrado</span>
            </div>
            {!this.props.theme && (
              <button onClick={this.toggleTheme} aria-label="Cambiar tema" style={s2o("width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--panel);cursor:pointer;display:grid;place-items:center;box-shadow:0 3px 10px var(--shadow)")}>
                {isDark
                  ? <span style={s2o("display:block;width:17px;height:17px;border-radius:50%;background:var(--gold);box-shadow:0 0 12px var(--gold)")} />
                  : <span style={s2o("display:block;width:17px;height:17px;border-radius:50%;box-shadow:inset -5px -3px 0 0 var(--ink)")} />}
              </button>
            )}
          </div>
        </header>

        {/* HERO */}
        <section style={s2o("position:relative;min-height:92vh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;background:linear-gradient(178deg,var(--sky1) 0%,var(--sky2) 30%,var(--sky3) 54%,var(--sky4) 76%,var(--sky5) 100%)")}>
          <div data-depth="0.018" style={s2o("position:absolute;left:50%;top:16%;will-change:transform")}>
            <div style={s2o("width:clamp(140px,20vw,260px);aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle at 50% 46%,#fff7da 0%,var(--sky4) 42%,rgba(255,150,80,0) 70%);animation:vt-sunGlow 6s ease-in-out infinite")} />
          </div>
          <div data-depth="0.05" style={s2o("position:absolute;left:8%;top:22%;width:220px;height:48px;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(14px);animation:vt-cloudFloat 12s ease-in-out infinite alternate")} />
          <div data-depth="0.07" style={s2o("position:absolute;right:10%;top:30%;width:300px;height:60px;border-radius:50%;background:rgba(255,255,255,.4);filter:blur(18px);animation:vt-cloudFloat 16s ease-in-out infinite alternate-reverse")} />
          <div data-depth="0.16" style={s2o("position:absolute;right:16%;top:26%;color:#fff;filter:drop-shadow(0 6px 10px rgba(0,0,0,.25));will-change:transform")}>
            <div style={{ animation: 'vt-planeIdle 5s ease-in-out infinite' }}>
              <svg width="64" height="64" viewBox="0 0 48 48"><path fill="currentColor" d={PLANE_PATH} /></svg>
            </div>
          </div>
          <div data-depth="0.06" style={s2o("position:absolute;left:50%;bottom:33%;transform:translateX(-50%);width:min(280px,46vw);will-change:transform")}>
            <div style={s2o("margin:0 auto;width:14px;height:60px;background:var(--seaDeep);clip-path:polygon(50% 0,62% 16%,58% 100%,42% 100%,38% 16%)")} />
            <div style={s2o("margin:-6px auto 0;width:120px;height:120px;background:var(--seaDeep);clip-path:polygon(50% 0,68% 38%,80% 70%,92% 100%,8% 100%,20% 70%,32% 38%);opacity:.92")} />
          </div>
          <div data-depth="0.02" style={s2o("position:absolute;left:0;right:0;bottom:0;height:30%;background:linear-gradient(178deg,var(--sea1),var(--sea2));overflow:hidden")}>
            <div style={s2o("position:absolute;top:-1px;left:0;width:200%;height:40px;animation:vt-waveSlide 9s linear infinite;opacity:.7")}>
              <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none"><path d="M0,22 C125,42 250,2 500,22 C750,42 875,2 1000,22 L1000,40 L0,40 Z" fill="var(--bg2)" opacity="0.18" /></svg>
            </div>
            <div style={s2o("position:absolute;top:6px;left:0;width:200%;height:34px;animation:vt-waveSlide 6s linear infinite;opacity:.5")}>
              <svg width="100%" height="34" viewBox="0 0 1000 34" preserveAspectRatio="none"><path d="M0,18 C125,2 250,34 500,18 C750,2 875,34 1000,18 L1000,34 L0,34 Z" fill="#ffffff" opacity="0.14" /></svg>
            </div>
          </div>
          <div data-depth="0.13" style={s2o("position:absolute;left:-10px;bottom:24%;transform-origin:bottom center;will-change:transform")}>
            <div style={s2o("animation:vt-palmSway 6.5s ease-in-out infinite;transform-origin:bottom center")}>{this.palmSVG()}</div>
          </div>
          <div data-depth="0.15" style={s2o("position:absolute;right:-6px;bottom:22%;transform-origin:bottom center;will-change:transform")}>
            <div style={s2o("animation:vt-palmSwayR 7.5s ease-in-out infinite;transform-origin:bottom center;transform:scaleX(-1)")}>{this.palmSVG()}</div>
          </div>
          <div style={s2o("position:absolute;inset:0;overflow:hidden;pointer-events:none")}>{this.particlesEls}</div>

          <div style={s2o("position:relative;z-index:5;max-width:1100px;margin:0 auto;width:100%;padding:0 clamp(20px,5vw,56px) clamp(48px,9vh,110px);text-align:center;color:#fff;text-shadow:0 2px 24px rgba(20,30,40,.28)")}>
            <div style={s2o("display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(6px);font-size:13px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase")}>{heroBadge}</div>
            <h1 style={s2o("font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(48px,9vw,118px);line-height:.94;margin:18px 0 0;letter-spacing:-.5px")}>El viaje a<br /><em style={{ fontStyle: 'italic' }}>Tailandia</em></h1>
            <p style={s2o("max-width:620px;margin:20px auto 0;font-size:clamp(16px,2.1vw,21px);line-height:1.5;font-weight:500;color:rgba(255,255,255,.94)")}>{heroSub}</p>
            <div style={s2o("display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:6px 12px;margin-top:30px;padding:16px 26px;border-radius:20px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.32);backdrop-filter:blur(8px)")}>
              <span style={s2o("font-size:13px;letter-spacing:.6px;text-transform:uppercase;opacity:.85")}>Has ahorrado</span>
              <span data-countup data-prefix="₪" data-target={saved} style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(30px,5vw,46px);line-height:1;font-variant-numeric:tabular-nums")}>₪0</span>
              <span style={s2o("font-size:16px;opacity:.85")}>de {this.fmtMoney(goal)}</span>
            </div>
            <div style={s2o("margin-top:40px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:.85")}>
              <span>Empieza el viaje</span>
              <span style={{ animation: 'vt-scrollCue 1.8s ease-in-out infinite' }}>↓</span>
            </div>
          </div>
        </section>

        {/* OCÉANO */}
        <section style={s2o("padding:clamp(56px,10vh,120px) clamp(20px,5vw,56px);max-width:1180px;margin:0 auto")}>
          <div data-reveal style={s2o("text-align:center;max-width:680px;margin:0 auto 44px")}>
            <div style={s2o("font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--turqD)")}>Tu océano de ahorro</div>
            <h2 style={s2o("font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(30px,5vw,52px);line-height:1.04;margin:12px 0 14px")}>La marea sube con cada shekel</h2>
            <p style={s2o("font-size:clamp(15px,1.8vw,18px);line-height:1.55;color:var(--ink2);margin:0")}>{oceanCopy}</p>
          </div>
          <div data-reveal style={s2o("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px;align-items:stretch")}>
            <div style={s2o("position:relative;border-radius:26px;overflow:hidden;min-height:clamp(320px,46vh,440px);background:linear-gradient(180deg,color-mix(in srgb,var(--sea1) 14%,var(--panel)),var(--panel));border:1px solid var(--line);box-shadow:0 24px 60px var(--shadow)")}>
              <div data-water style={s2o("position:absolute;left:0;right:0;bottom:0;height:0;transition:height 1.4s cubic-bezier(.22,1,.36,1);background:linear-gradient(180deg,var(--sea1),var(--sea2) 60%,var(--seaDeep));will-change:height")}>
                <div style={s2o("position:absolute;top:-22px;left:0;width:200%;height:30px;animation:vt-waveSlide 7s linear infinite;opacity:.8")}>
                  <svg width="100%" height="30" viewBox="0 0 1000 30" preserveAspectRatio="none"><path d="M0,16 C125,32 250,0 500,16 C750,32 875,0 1000,16 L1000,30 L0,30 Z" fill="var(--sea1)" /></svg>
                </div>
                <div style={s2o("position:absolute;top:-14px;left:0;width:200%;height:24px;animation:vt-waveSlide 4.5s linear infinite reverse;opacity:.55")}>
                  <svg width="100%" height="24" viewBox="0 0 1000 24" preserveAspectRatio="none"><path d="M0,12 C125,0 250,24 500,12 C750,0 875,24 1000,12 L1000,24 L0,24 Z" fill="#ffffff" opacity="0.5" /></svg>
                </div>
                <div style={s2o("position:absolute;top:-30px;right:14%;animation:vt-bob 4s ease-in-out infinite")}>
                  <div style={s2o("width:18px;height:18px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 4px rgba(255,255,255,.5),0 6px 12px rgba(0,0,0,.25)")} />
                </div>
              </div>
              <div style={s2o("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px")}>
                <div data-countup data-suffix="%" data-target={pctDisplay} style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(64px,13vw,128px);line-height:.9;color:#fff;text-shadow:0 4px 30px rgba(0,40,50,.4);font-variant-numeric:tabular-nums")}>0%</div>
                <div style={s2o("font-size:13px;letter-spacing:1.4px;text-transform:uppercase;color:#fff;opacity:.9;margin-top:6px")}>de tu meta a flote</div>
              </div>
            </div>
            <div style={s2o("display:flex;flex-direction:column;gap:16px")}>
              <div style={s2o("flex:1;border-radius:22px;padding:26px;background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 30px var(--shadow);display:flex;flex-direction:column;justify-content:center")}>
                <div style={s2o("font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink2)")}>Ya en la hucha</div>
                <div data-countup data-prefix="₪" data-target={saved} style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(34px,5vw,52px);line-height:1;margin-top:6px;color:var(--turqD);font-variant-numeric:tabular-nums")}>₪0</div>
              </div>
              <div style={s2o("flex:1;border-radius:22px;padding:26px;background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 30px var(--shadow);display:flex;flex-direction:column;justify-content:center")}>
                <div style={s2o("font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink2)")}>Te falta para despegar</div>
                <div data-countup data-prefix="₪" data-target={remaining} style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(34px,5vw,52px);line-height:1;margin-top:6px;color:var(--coralD);font-variant-numeric:tabular-nums")}>₪0</div>
              </div>
              <div style={s2o("border-radius:22px;padding:22px 26px;background:linear-gradient(135deg,var(--turq),var(--turqD));color:#fff;box-shadow:0 12px 30px var(--shadow)")}>
                <div style={s2o("font-size:13px;line-height:1.45;font-weight:600")}>{oceanNudge}</div>
              </div>
            </div>
          </div>
        </section>

        {this.props.afterOcean}

        {/* RUTA */}
        <section style={s2o("padding:clamp(40px,7vh,90px) clamp(20px,5vw,56px) clamp(56px,10vh,120px);background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--turq) 7%,transparent));overflow:hidden")}>
          <div data-reveal style={s2o("text-align:center;max-width:680px;margin:0 auto 8px")}>
            <div style={s2o("font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--coralD)")}>La ruta</div>
            <h2 style={s2o("font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(30px,5vw,52px);line-height:1.04;margin:12px 0 14px")}>De Tel Aviv a una playa de Tailandia</h2>
            <p style={s2o("font-size:clamp(15px,1.8vw,18px);line-height:1.55;color:var(--ink2);margin:0")}>{routeCopy}</p>
          </div>
          <div data-reveal style={s2o("position:relative;max-width:1040px;margin:18px auto 0")}>
            <div style={{ position: 'relative', width: '100%' }}>
              <svg viewBox="0 0 1000 340" width="100%" style={{ display: 'block', overflow: 'visible' }}>
                <path data-route d="M60,268 C 250,96 430,96 540,182 C 650,268 822,300 945,92" fill="none" stroke="var(--line)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 14" style={{ animation: 'vt-dashFlow 3s linear infinite' }} />
                <path data-route-prog d="M60,268 C 250,96 430,96 540,182 C 650,268 822,300 945,92" fill="none" stroke="url(#vtRouteGrad)" strokeWidth="5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="vtRouteGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="var(--turq)" />
                    <stop offset="0.5" stopColor="var(--gold)" />
                    <stop offset="1" stopColor="var(--coral)" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {ms.map((m, i) => (
                  <div key={i} data-ms={m.at} style={s2o("position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:7px")}>
                    <div style={s2o(m.dotStyle)} />
                    <div style={s2o(m.labelStyle)}>{m.label}</div>
                  </div>
                ))}
                <div data-routeplane style={s2o("position:absolute;color:var(--coralD);filter:drop-shadow(0 4px 8px var(--shadow));transition:left 1.2s cubic-bezier(.22,1,.36,1),top 1.2s cubic-bezier(.22,1,.36,1);will-change:left,top")}>
                  <svg width="40" height="40" viewBox="0 0 48 48" style={{ display: 'block', transform: 'translate(-50%,-50%)' }}><path fill="currentColor" d={PLANE_PATH} /></svg>
                </div>
              </div>
            </div>
          </div>
          <div data-reveal style={s2o("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:14px;max-width:1040px;margin:34px auto 0")}>
            {ms.map((m, i) => (
              <div key={i} style={s2o(m.cardStyle)}>
                <div style={s2o("display:flex;align-items:center;justify-content:space-between;gap:8px")}>
                  <span style={s2o("font-size:12px;font-weight:700;letter-spacing:.4px;font-variant-numeric:tabular-nums;color:var(--ink2)")}>{m.atLabel}</span>
                  <span style={s2o(m.chipStyle)}>{m.status}</span>
                </div>
                <div style={s2o("font-family:'Instrument Serif',serif;font-size:21px;line-height:1.05;margin-top:10px")}>{m.label}</div>
                <div style={s2o("font-size:13px;color:var(--ink2);margin-top:5px;line-height:1.4")}>{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CUENTA ATRÁS */}
        <section style={s2o("padding:clamp(48px,8vh,96px) clamp(20px,5vw,56px);max-width:1040px;margin:0 auto;text-align:center")}>
          <div data-reveal>
            <div style={s2o("font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--turqD)")}>Cuenta atrás para despegar</div>
            <h2 style={s2o("font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(28px,4.6vw,48px);line-height:1.05;margin:12px 0 6px")}>{cd.day > 0 ? 'Faltan ' + cd.day + ' días para Tailandia' : '¡Es hora de volar!'}</h2>
            <p style={s2o("font-size:15px;color:var(--ink2);margin:0 0 30px")}>Objetivo: noviembre de 2027. El reloj corre, y tú también.</p>
          </div>
          <div data-reveal style={s2o("display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(8px,2vw,18px);max-width:760px;margin:0 auto")}>
            {cd.list.map((c, i) => (
              <div key={i} style={s2o("border-radius:20px;padding:clamp(16px,3vw,30px) 8px;background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 28px var(--shadow)")}>
                <div style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(36px,8vw,68px);line-height:.95;color:var(--ink);font-variant-numeric:tabular-nums")}>{c.value}</div>
                <div style={s2o("font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--ink2);margin-top:8px")}>{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TARJETAS FLIP */}
        <section style={s2o("padding:clamp(48px,8vh,96px) clamp(20px,5vw,56px) clamp(56px,10vh,120px);max-width:1180px;margin:0 auto")}>
          <div data-reveal style={s2o("text-align:center;max-width:680px;margin:0 auto 40px")}>
            <div style={s2o("font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--coralD)")}>¿Qué compra tu dinero?</div>
            <h2 style={s2o("font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(30px,5vw,52px);line-height:1.04;margin:12px 0 14px")}>Tus ahorros, en momentos reales</h2>
            <p style={s2o("font-size:clamp(15px,1.8vw,18px);line-height:1.55;color:var(--ink2);margin:0")}>Pasa el cursor (o toca) cada tarjeta para descubrir lo que ya tienes a tu alcance en Tailandia.</p>
          </div>
          <div data-reveal style={s2o("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:22px")}>
            {cards.map((card, i) => (
              <div key={i} onClick={card.onClick} onMouseEnter={card.onEnter} onMouseLeave={card.onLeave} style={s2o("perspective:1200px;cursor:pointer;height:300px")}>
                <div style={s2o(`position:relative;width:100%;height:100%;transition:transform .7s cubic-bezier(.4,.2,.2,1);transform-style:preserve-3d;transform:rotateY(${card.deg}deg)`)}>
                  <div style={s2o("position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:0 14px 34px var(--shadow);background:var(--panel)")}>
                    <div style={s2o(`height:64%;position:relative;background:${card.imgBg};display:flex;align-items:flex-end;justify-content:flex-start;overflow:hidden`)}>
                      <div style={s2o("position:absolute;inset:0;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.16) 0 10px,rgba(255,255,255,0) 10px 20px)")} />
                      <span style={s2o("position:relative;margin:12px;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,.9);font-weight:600;background:rgba(0,0,0,.22);padding:5px 9px;border-radius:6px")}>{card.tag}</span>
                    </div>
                    <div style={s2o("padding:16px 18px")}>
                      <div style={s2o("font-family:'Instrument Serif',serif;font-size:22px;line-height:1.05")}>{card.label}</div>
                      <div style={s2o("display:flex;align-items:baseline;gap:8px;margin-top:8px")}>
                        <span style={s2o("font-size:13px;color:var(--ink2)")}>desde</span>
                        <span style={s2o("font-weight:700;font-size:18px;color:var(--turqD);font-variant-numeric:tabular-nums")}>{card.priceText}</span>
                      </div>
                    </div>
                  </div>
                  <div style={s2o(`position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:0 14px 34px var(--shadow);background:linear-gradient(150deg,${card.backTop},${card.backBot});color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:26px`)}>
                    <div style={s2o("font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:.85")}>{card.place}</div>
                    <div style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(48px,9vw,72px);line-height:.92;margin:8px 0;font-variant-numeric:tabular-nums")}>{card.count}</div>
                    <div style={s2o("font-size:15px;font-weight:600;line-height:1.35")}>{card.countLabel}</div>
                    <div style={s2o("font-size:13px;opacity:.9;margin-top:10px;line-height:1.4")}>{card.quip}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CIERRE */}
        <section style={s2o("padding:clamp(48px,8vh,110px) clamp(20px,5vw,56px) clamp(70px,12vh,140px);text-align:center")}>
          <div data-reveal style={s2o("max-width:760px;margin:0 auto;border-radius:30px;padding:clamp(34px,6vw,64px);background:linear-gradient(160deg,var(--sky3),var(--sky2) 55%,var(--sky1));color:#fff;box-shadow:0 30px 70px var(--shadow);position:relative;overflow:hidden")}>
            <div style={s2o("position:absolute;inset:0;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 14px,rgba(255,255,255,0) 14px 28px);pointer-events:none")} />
            <div style={{ position: 'relative' }}>
              <div style={s2o("font-family:'Instrument Serif',serif;font-size:clamp(30px,5.4vw,56px);line-height:1.04")}>{ctaTitle}</div>
              <p style={s2o("font-size:clamp(16px,2vw,20px);line-height:1.5;margin:18px auto 0;max-width:540px;opacity:.95")}>{ctaSub}</p>
              <div style={s2o("display:inline-flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:28px")}>
                <div style={s2o("padding:12px 22px;border-radius:999px;background:#fff;color:var(--coralD);font-weight:700;box-shadow:0 8px 20px rgba(0,0,0,.18)")}>Próxima parada: {next ? next.label : 'Tailandia'}</div>
                <div style={s2o("padding:12px 22px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.4);font-weight:600")}>{cd.day > 0 ? cd.day + ' días por delante' : 'Ya es noviembre 2027'}</div>
              </div>
            </div>
          </div>
          <div style={s2o("margin-top:34px;font-size:12px;letter-spacing:.4px;color:var(--ink2)")}>Tel Aviv → Tailandia · noviembre 2027 · hecho con ganas de mar</div>
        </section>

        {key === 'reached' && (
          <div style={s2o("position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden")}>{this.confettiEls}</div>
        )}
      </div>
    );
  }
}
