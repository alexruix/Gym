export const landingCopy = {
  hero: {
    badge: "🇦🇷 HECHO PARA GIMNASIOS ARGENTINOS",
    titleLine1: "Gestioná tu gym",
    titleHighlight: "sin estrés",
    description:
      "La plataforma que usan los mejores entrenadores para manejar alumnos, rutinas y cobros — todo en un solo lugar.",
    ctaPrimary: "Probar Gratis 14 días",
    ctaSecondary: "Ver cómo funciona",
    socialHint: "Más de 500 profesores ya lo usan. Sin tarjeta de crédito.",
  },
  stats: [
    { value: "500+", label: "Profesores activos" },
    { value: "12.000+", label: "Alumnos registrados" },
    { value: "85%", label: "Menos tiempo en admin" },
    { value: "#1", label: "En gimnasios PyME" },
  ],
  socialProof: {
    badge: "YA LO USAN",
    text: "Más de 500 profesores y dueños de gimnasios ya optimizaron su tiempo con MiGym.",
    logos: [
      { name: "CrossFit Sur", abbr: "CS" },
      { name: "Elite Gym", abbr: "EG" },
      { name: "Zona+ Deportes", abbr: "Z+" },
      { name: "Titanes", abbr: "TT" },
      { name: "BarrioFit", abbr: "BF" },
    ],
  },
  features: {
    badge: "BENEFICIOS",
    title: "Todo lo que necesitás,",
    titleHighlight: "sin complicaciones",
    items: [
      {
        title: "Planes Inteligentes",
        desc: "Convertí tus excels en rutinas interactivas en 30 segundos. Tus alumnos las ven en su teléfono.",
        emoji: "⚡",
      },
      {
        title: "Seguimiento Realtime",
        desc: "Mirá el progreso de tus alumnos mientras entrenan. Sabés quién está avanzando y quién necesita atención.",
        emoji: "📊",
      },
      {
        title: "Control de Cobros",
        desc: "Alertas automáticas de vencimiento. Chau morosos. Sabés exactamente quién debe y cuánto.",
        emoji: "💰",
      },
      {
        title: "Tu Marca, Tus Colores",
        desc: "Tus alumnos ven tu logo y tu identidad, no la nuestra. Vos sos el profesional.",
        emoji: "🎨",
      },
    ],
  },
  testimonials: {
    badge: "LO QUE DICEN",
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
        role: "Personal Trainer · Buenos Aires",
        stars: 5,
      },
      {
        quote:
          "Antes tenía todo en papelitos y WhatsApp. Ahora el gym se maneja solo. El sistema de cobros automático es una joya.",
        author: "Diego F.",
        role: "Dueño · FitBox Palermo",
        stars: 5,
      },
    ],
  },
  pricing: {
    badge: "PRECIOS CLAROS",
    title: "Un solo plan.",
    titleHighlight: "Todo incluido.",
    price: 15000,
    period: "/ mes",
    trial: "14 días gratis, sin tarjeta",
    guarantee: "Cancelás cuando querés. Sin contratos ni letras chicas.",
    features: [
      "Alumnos ilimitados",
      "Planes y plantillas ilimitadas",
      "Control de cobros + alertas automáticas",
      "App para tus alumnos (Android e iOS)",
      "Soporte por WhatsApp 24/7",
      "Actualizaciones incluidas",
    ],
    cta: "Empezar Gratis 14 días",
    ctaSub: "No se requiere tarjeta de crédito",
  },
  ctaFinal: {
    badge: "EMPEZÁ HOY",
    title: "Unite a 500+ profesores",
    titleHighlight: "que ya ganan más tiempo",
    description:
      "Creá tu cuenta en menos de 1 minuto. 14 días gratis, sin compromisos.",
    cta: "Crear mi cuenta gratis",
    ctaSub: "Sin tarjeta · Sin contratos · Cancelás cuando querés",
  },
} as const;
