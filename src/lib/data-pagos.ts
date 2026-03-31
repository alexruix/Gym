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

  // Procesamos la data para extraer el "pago activo" (el más reciente) de cada alumno
  const resultados = alumnos.map((alumno: any) => {
    let pagoActivo = null;
    
    if (alumno.pagos && alumno.pagos.length > 0) {
      // Ordenar por fecha_vencimiento de más reciente a más antiguo
      const pagosOrdenados = alumno.pagos.sort((a: any, b: any) => 
        new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
      );
      
      // Tomamos el período actual (el último generado)
      pagoActivo = pagosOrdenados[0];
    }

    // Calcular si está vencido a nivel componente/fecha (por si estado no se actualizó)
    let isVencido = false;
    if (pagoActivo && pagoActivo.estado !== 'pagado') {
        const today = new Date();
        const vencimiento = new Date(pagoActivo.fecha_vencimiento);
        // Reseteamos las horas para comparar solo días
        today.setHours(0,0,0,0);
        vencimiento.setHours(0,0,0,0);
        
        if (vencimiento < today) {
            isVencido = true;
            // Podríamos forzar estado = vencido aquí para la UI
            pagoActivo.estado = 'vencido';
        }
    }

    // Filtramos la data pesada de los pagos anteriores
    const { pagos, ...alumnoRaw } = alumno;

    return {
      ...alumnoRaw,
      pago_activo: pagoActivo,
      is_moroso: isVencido
    };
  });

  return resultados;
}
