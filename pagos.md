# 💰 Gestión de Pagos: Lógica y Funcionamiento

Este documento detalla la lógica de negocio y la interfaz de usuario para el módulo de pagos de **MiGym**. Su objetivo es centralizar el control de cuotas y morosidad de forma técnica y eficiente.

---

## 1. Contexto del Producto (El Problema Real) 🇦🇷

El profesor de un gimnasio de barrio suele perder horas valiosas cruzando datos entre el Excel, WhatsApp y su cuaderno físico para saber quién pagó y a quién debe recordarle.

- **Antes**: Confusión, olvidos en los recordatorios y pérdida de ingresos por morosidad no detectada.
- **Con MiGym**: Claridad en 5 segundos. Reporte automático de ingresos y estados de cuota (Pagado / Vencido / Pendiente) sin esfuerzo manual.

---

## 2. Los 4 Estados de Pago

El sistema clasifica automáticamente a cada alumno en uno de estos estados:

1.  **✅ PAGADO** (Verde): El alumno tiene un registro de pago para el mes actual marcado como completado.
2.  **⏰ PENDIENTE** (Ámbar): El pago del mes actual está creado pero aún no ha sido cobrado.
3.  **⏰ POR VENCER** (Ámbar): El pago vence en los próximos 7 días (Alerta preventiva).
4.  **❌ VENCIDO** (Rojo): La fecha de vencimiento ya pasó y el pago no fue registrado.
5.  **⚪ SIN ASIGNAR** (Gris): El alumno no tiene un plan configurado ni un día de pago definido.

---

## 3. Lógica Técnica: Inyección Virtual de Pagos 🛰️

Para evitar que el profesor tenga que "crear" pagos manualmente cada mes, el sistema implementa una **Inyección Virtual** en el servidor (`src/lib/data-pagos.ts`):

- **Automatización**: Al cargar el dashboard, el sistema busca el último pago del alumno.
- **Proyección**: Si el último pago fue el mes pasado (y ya está pagado), el sistema "inyecta" virtualmente el pago de este mes basándose en el `dia_pago` y `monto` configurado en la ficha del alumno.
- **Persistencia**: El pago virtual se convierte en un registro real en la base de datos solo cuando el profesor hace clic en **[Registrar Pago]**.

---

## 4. Interfaz del Profesor (Dashboard Hub)

La pantalla de `/profesor/pagos` está construida con **Atomic Design** y componentes técnicos de alto rendimiento:

### 4.1 Métricas KPI (`PagoMetricCard`)
Situadas en la parte superior, muestran en tiempo real:
- **Ingresos Cobrados**: Suma de pagos con estado `pagado` en el mes actual.
- **Ingresos Pendientes**: Suma de lo que falta cobrar de cuotas ya generadas.
- **Morosos**: Cantidad de alumnos con estados `vencido`.

### 4.2 Consola de Gestión (`DashboardConsole`)
Permite gestionar el directorio de alumnos con:
- **Vista Dual**: Alternancia rápida entre **Grid** (visual) y **Tabla** (operacional).
- **Filtros por Estado**: Solo ver "Morosos", "Pagados", etc.
- **Búsqueda Rápida**: Por nombre o email.

### 4.3 Ficha de Detalle (`Sheet` de Radix UI)
Al seleccionar un alumno, se abre un panel lateral que muestra:
- Historial de los últimos 4 meses.
- Datos de contacto y configuración de cuota.
- Botones de acción rápida: **Registrar cobro** y **Notificar por WhatsApp**.

---

## 5. Recordatorios vía WhatsApp

El sistema facilita el cobro mediante links directos de WhatsApp que pre-cargan el mensaje de cobranza:

1.  El profesor hace clic en el ícono de **Teléfono/Recordar**.
2.  El sistema abre WhatsApp Web/App con un mensaje personalizado:
    > "Hola [Nombre], tu cuota de $[Monto] venció. Por favor regularizala..."
3.  **Logs**: El sistema guarda la fecha del último recordatorio enviado para evitar "spam" y llevar control.

---

## 6. Próximamente (Roadmap / Future Features) 🚀

Las siguientes funcionalidades están en el radar para futuras iteraciones:

- **📤 Exportación Excel**: Generación de reportes detallados para contadores con un solo clic.
- **📥 Importación Masiva**: Carga inicial de alumnos y estados de pagos desde planillas Excel de terceros.
- **📊 Gráficos de Cobranza**: Evolución histórica de ingresos por mes.
- **🔔 Notificaciones Automáticas**: Alertas push o recordatorios programados sin intervención manual.

---

## 7. Componentes Involucrados (Referencia de Código)

- **Página**: `src/pages/profesor/pagos/index.astro`
- **Componente Principal**: `src/components/organisms/TablaPagos.tsx`
- **Lógica de Datos**: `src/lib/data-pagos.ts`
- **Acciones Astro**: `actions.pagos.registrarCobro`, `actions.pagos.registrarNotificacion`