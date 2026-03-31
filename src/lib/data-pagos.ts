export async function getAlumnosConPagoActivo(supabase: any, profesorId: string) {
  // Hacemos un JOIN (One-to-Many) con Supabase estándar
  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select(`
      id, 
      nombre, 
      email, 
      telefono, 
      monto, 
      dia_pago,
      ultimo_recordatorio_pago_at,
      pagos (
        id, 
        monto, 
        fecha_vencimiento, 
        estado, 
        fecha_pago
      )
    `)
    .eq('profesor_id', profesorId)
    .is('deleted_at', null)
    .order('nombre');

  if (error) {
    console.error("Error fetching alumnos y pagos:", error);
    throw new Error('No se pudieron cargar los datos de pagos.');
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  // Procesamos la data para extraer el "pago activo" (el más reciente) de cada alumno
  const resultados = alumnos.map((alumno: any) => {
    let pagoActivo = null;
    let historial = (alumno.pagos || []).sort((a: any, b: any) => 
      new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
    );
    
    if (historial.length > 0) {
      pagoActivo = { ...historial[0] }; // Clonamos para no mutar el historial
    }

    // Lógica de "Inyección Virtual"
    // Si no tiene pagos o el último es de un mes anterior y está pagado, necesitamos proyectar el siguiente
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let needsVirtual = false;
    if (!pagoActivo) {
      needsVirtual = true;
    } else {
      const lastVenc = new Date(pagoActivo.fecha_vencimiento);
      // Si el último pago es de un mes anterior al mes "corriente" (hoy)
      if (lastVenc.getMonth() < currentMonth || lastVenc.getFullYear() < currentYear) {
         // Y además ya está pagado, el sistema debería haber generado el siguiente, pero si no está, lo inyectamos
         if (pagoActivo.estado === 'pagado') {
            needsVirtual = true;
         }
      }
    }

    if (needsVirtual) {
       const virtualDate = new Date(currentYear, currentMonth, alumno.dia_pago || 15);
       pagoActivo = {
          id: `virtual-${alumno.id}`,
          monto: alumno.monto || 0,
          fecha_vencimiento: virtualDate.toISOString().split('T')[0],
          estado: 'pendiente',
          fecha_pago: null,
          isVirtual: true
       };
    }

    // Calcular si está vencido exactamente
    let isVencido = false;
    if (pagoActivo && pagoActivo.estado !== 'pagado') {
        const vencimiento = new Date(pagoActivo.fecha_vencimiento);
        vencimiento.setHours(0,0,0,0);
        
        if (vencimiento < today) {
            isVencido = true;
            pagoActivo.estado = 'vencido';
        }
    }

    // Filtramos la data pesada de los pagos anteriores pero dejamos el historial para el detalle
    const { pagos, ...alumnoRaw } = alumno;

    return {
      ...alumnoRaw,
      pago_activo: pagoActivo,
      is_moroso: isVencido,
      historial: historial
    };
  });

  return resultados;
}
