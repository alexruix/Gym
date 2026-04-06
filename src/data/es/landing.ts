/**
 * SSOT — Copys de la Landing Page
 * Idioma: Español rioplatense (voseo)
 * Política: Sentence case, máx. 1 emoji, sin ALL CAPS en textos visibles
 */
export const landingCopy = {
  // ─── Meta ────────────────────────────────────────────────────────────────
  meta: {
    title: "MiGym | Gestión deportiva de alto rendimiento",
    description:
      "La plataforma que usan los mejores entrenadores para gestionar alumnos, rutinas y cobros. Simple, veloz, hecha para Argentina.",
  },

  // ─── Navbar ──────────────────────────────────────────────────────────────
  navbar: {
    logoPrefix: "MI",
    logoSuffix: "GYM",
    linkLogin: "Iniciar sesión",
    ctaPrimary: "Probar gratis",
  },

  // ─── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    badge: "Hecho para gimnasios y entrenadores",
    titleLine1: "Gestioná tu gym",
    titleHighlight: "sin el caos de antes",
    description:
      "La plataforma que usan los mejores entrenadores para manejar alumnos, rutinas y cobros. Todo en un solo lugar, desde el celular.",
    ctaPrimary: "Probar gratis 14 días",
    ctaSecondary: "Ver demo en vivo",
    socialHint: "Más de 10 profesores ya lo usan. Sin tarjeta de crédito.",
  },

  // ─── Stats ────────────────────────────────────────────────────────────────
  stats: [
    { value: "10+", label: "Profesores activos" },
    { value: "80+", label: "Alumnos registrados" },
    { value: "85%", label: "Menos tiempo en admin" },
    { value: "#1", label: "En gimnasios PyME" },
  ],

  // ─── Social proof ─────────────────────────────────────────────────────────
  socialProof: {
    badge: "Ellos ya lo usan",
    text: "Más de 10 profesores de gimansio o personal trainer dejaron las hojas de cálculo atrás.",
    logos: [
      { name: "CrossFit Sur", abbr: "CS" },
      { name: "Elite Gym", abbr: "EG" },
      { name: "Zona+ Deportes", abbr: "Z+" },
      { name: "Titanes", abbr: "TT" },
      { name: "BarrioFit", abbr: "BF" },
    ],
  },

  // ─── Features ─────────────────────────────────────────────────────────────
  features: {
    badge: "Todo lo que necesitás",
    title: "Para que nada",
    titleHighlight: "se te escape",
    items: [
      {
        title: "Planes en segundos",
        desc: "Convertí tus excels en rutinas interactivas al instante. Tus alumnos las ven en su teléfono en segundos.",
        emoji: "⚡",
      },
      {
        title: "Seguimiento en tiempo real",
        desc: "Mirá el progreso de tus alumnos mientras entrenan. Sabés quién está avanzando y quién necesita un empujón.",
        emoji: "📊",
      },
      {
        title: "Cobros bajo control",
        desc: "Alertas automáticas de vencimiento. Sabés exactamente quién debe, cuánto, y cuándo vence sin perseguir a nadie.",
        emoji: "💰",
      },
      {
        title: "Tu marca, tus colores",
        desc: "Tus alumnos ven tu logo y tu identidad, no la nuestra. El profesional sos vos.",
        emoji: "🎨",
      },
    ],
  },

  // ─── Testimonials ─────────────────────────────────────────────────────────
  testimonials: {
    badge: "Lo que dicen los que ya lo usan",
    title: "Resultados reales de",
    titleHighlight: "profesionales reales",
    items: [
      {
        quote:
          "Desde que uso MiGym dejé de perder horas armando excels y persiguiendo a los que no pagan. Recuperé 3 horas por semana.",
        author: "Marcos T.",
        role: "Dueño · CrossFit Zona Sur",
        stars: 5,
      },
      {
        quote:
          "Mis alumnos aman la app. Entienden los ejercicios al toque con los videos y yo veo su progreso desde mi casa.",
        author: "Laura G.",
        role: "Personal trainer · Buenos Aires",
        stars: 5,
      },
      {
        quote:
          "Antes tenía todo en papelitos y WhatsApp. Ahora el gym se maneja solo. El sistema es una joya.",
        author: "Diego F.",
        role: "Dueño · FitBox Palermo",
        stars: 5,
      },
    ],
  },

  // ─── Pricing ──────────────────────────────────────────────────────────────
  pricing: {
    badge: "Precio de lanzamiento",
    title: "Un solo plan.",
    titleHighlight: "Todo incluido.",
    price: 29000,
    period: "/ mes",
    trial: "14 días gratis, sin tarjeta",
    guarantee: "Cancelás cuando querés. Sin contratos ni letras chicas.",
    features: [
      "Alumnos ilimitados",
      "Planes y plantillas ilimitadas",
      "Control de cobros + alertas automáticas",
      "WebApp para tus alumnos (Android e iOS)",
      "Soporte directo por WhatsApp",
      "Actualizaciones incluidas, siempre",
    ],
    cta: "Empezá gratis. 14 días sin límites",
    ctaSub: "No se requiere tarjeta de crédito",
  },

  // ─── CTA Final ────────────────────────────────────────────────────────────
  ctaFinal: {
    badge: "Empezá hoy",
    title: "Sumáte a 10+ profesores",
    titleHighlight: "que ya ganan más tiempo",
    description:
      "Creá tu cuenta en menos de 1 minuto. 14 días gratis, sin compromisos, sin tarjeta.",
    cta: "Crear mi cuenta gratis",
    ctaSub: "Sin tarjeta · Sin contratos · Cancelás cuando querés",
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    logoPrefix: "MI",
    logoSuffix: "GYM",
    copy: "MiGym © 2026. Hecho para profes de verdad.",
  },
} as const;
