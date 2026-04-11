/**
 * Plantillas de mensajes para WhatsApp (SSOT).
 * Voz y Tono: Argentina (Voseo Rioplatense).
 */

export const whatsappMessages = {
    payments: {
        reminder: (nombre: string, monto?: number) => {
            const montoStr = monto ? ` de $${monto.toLocaleString('es-AR')}` : "";
            return `¡Hola ${nombre}! 👋 Te escribía para recordarte el vencimiento de la cuota${montoStr}. Avisame cuando puedas así lo registramos. ¡Un saludo!`;
        },
        overdue: (nombre: string) => {
            return `Buenas ${nombre}, ¿cómo va? Te mando este mensajito para que podamos regularizar el pago pendiente del plan. Avisame y lo vemos. ¡Gracias!`;
        }
    },
    students: {
        welcome: (nombre: string) => {
            return `¡Hola ${nombre}! 💪 Ya tenés tu acceso listo a MiGym. Avisame cuando entres así te cargo los primeros ejercicios. ¡Vamos con todo!`;
        }
    }
};
