-- 🔥 MiGym | Seed Master Plans (V2.0)
-- Este script inserta los dos planes maestros directamente en la base de datos.
-- Puede ser ejecutado en el SQL Editor de Supabase.

DO $$
DECLARE
    v_profesor_id uuid := NULL; -- Setea un UUID de profesor específico si querés que le pertenezcan a alguien.
    v_plan_id uuid;
    v_rutina_id uuid;
    
    -- IDs de ejercicios (Se resuelven por nombre para consistencia)
    v_ej_pmuerto_rumano uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Peso muerto rumano con mancuerna' LIMIT 1);
    v_ej_camilla_isquios uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Camilla de isquiotibiales' LIMIT 1);
    v_ej_hip_thrust uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Elevación de cadera libre' LIMIT 1);
    v_ej_estocadas_atras uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Estocadas hacia atrás' LIMIT 1);
    v_ej_patada_polea uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Patada de glúteo en polea' LIMIT 1);
    v_ej_abs_bisagra uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Abdominales bisagras' LIMIT 1);
    
    v_ej_jalon_abierto uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Jalón al pecho agarre abierto' LIMIT 1);
    v_ej_press_inclinado uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Press inclinado con mancuernas' LIMIT 1);
    v_ej_press_militar uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Press militar con mancuerna' LIMIT 1);
    v_ej_vuelos_lat uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Vuelos laterales con mancuernas parado' LIMIT 1);
    v_ej_triceps_polea uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Tríceps en polea con agarre recto' LIMIT 1);
    v_ej_biceps_alt uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Biceps alternado con mancuernas' LIMIT 1);
    v_ej_crunch_corto uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Crunch corto en colchoneta' LIMIT 1);

    v_ej_banco_plano uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Banco plano con barra' LIMIT 1);
    v_ej_aperturas uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Aperturas en banco plano' LIMIT 1);
    v_ej_press_frances uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Press francés con mancuernas' LIMIT 1);
    v_ej_plancha uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Planchas estaticas' LIMIT 1);
    v_ej_sentadilla uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Sentadilla libre con barra' LIMIT 1);
    v_ej_prensa uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Prensa' LIMIT 1);
    v_ej_sillon_cuad uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Sillón de cuádriceps' LIMIT 1);
    v_ej_pmuerto_barra uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Peso muerto rumano con barra' LIMIT 1);
    v_ej_gemelos uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Gemelos en prensa' LIMIT 1);
    v_ej_remo_bajo uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Remo en polea baja' LIMIT 1);
    v_ej_pullover_polea uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Pull over en polea' LIMIT 1);
    v_ej_vuelo_post uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Vuelo posterior en polea' LIMIT 1);
    v_ej_biceps_barra uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Biceps parado con barra' LIMIT 1);
    v_ej_biceps_scott uuid := (SELECT id FROM biblioteca_ejercicios WHERE nombre = 'Biceps en banco scott' LIMIT 1);

BEGIN
    -- ==========================================
    -- 1. PLAN MUJER (TONIFICACIÓN)
    -- ==========================================
    IF NOT EXISTS (SELECT 1 FROM planes WHERE nombre = 'Plan de entrenamiento 3 días Mujer' AND profesor_id IS NOT DISTINCT FROM v_profesor_id) THEN
        INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
        VALUES (v_profesor_id, 'Plan de entrenamiento 3 días Mujer', 4, 3, true)
        RETURNING id INTO v_plan_id;

        -- Día 1: Glúteos y Piernas
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 1, 'Glúteos y Piernas', 1) RETURNING id INTO v_rutina_id;
        
        IF v_ej_pmuerto_rumano IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_pmuerto_rumano, 4, '10', 90, 1); END IF;
        IF v_ej_camilla_isquios IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_camilla_isquios, 3, '12', 90, 2); END IF;
        IF v_ej_hip_thrust IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_hip_thrust, 4, '10', 120, 3); END IF;
        IF v_ej_estocadas_atras IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_estocadas_atras, 4, '20', 60, 4); END IF;
        IF v_ej_patada_polea IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_patada_polea, 4, '15', 60, 5); END IF;
        IF v_ej_abs_bisagra IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_abs_bisagra, 4, '20', 30, 6); END IF;

        -- Día 2: Tren Superior
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 2, 'Tren Superior', 2) RETURNING id INTO v_rutina_id;
        
        IF v_ej_jalon_abierto IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_jalon_abierto, 4, '8', 120, 1); END IF;
        IF v_ej_press_inclinado IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_press_inclinado, 4, '10', 90, 2); END IF;
        IF v_ej_press_militar IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_press_militar, 3, '12', 90, 3); END IF;
        IF v_ej_vuelos_lat IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_vuelos_lat, 4, '12', 60, 4); END IF;
        IF v_ej_triceps_polea IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_triceps_polea, 4, '15', 60, 5); END IF;
        IF v_ej_biceps_alt IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_biceps_alt, 4, '20', 60, 6); END IF;
        IF v_ej_crunch_corto IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_crunch_corto, 4, '20', 30, 7); END IF;

        -- Día 3: Piernas Completas
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 3, 'Piernas Completas', 3) RETURNING id INTO v_rutina_id;
        
        IF v_ej_plancha IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_plancha, 4, '00:30 min', 60, 1); END IF;
        IF v_ej_sillon_cuad IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_sillon_cuad, 3, '12', 60, 2); END IF;
        IF v_ej_sentadilla IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_sentadilla, 4, '8', 120, 3); END IF;
        IF v_ej_prensa IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_prensa, 4, '15', 60, 4); END IF;
    END IF;

    -- ==========================================
    -- 2. PLAN GENERAL (FUERZA)
    -- ==========================================
    IF NOT EXISTS (SELECT 1 FROM planes WHERE nombre = 'Plan de entrenamiento 3 días General' AND profesor_id IS NOT DISTINCT FROM v_profesor_id) THEN
        INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
        VALUES (v_profesor_id, 'Plan de entrenamiento 3 días General', 4, 3, true)
        RETURNING id INTO v_plan_id;

        -- Día 1: Pecho, Hombros y Tríceps
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 1, 'Pecho, Hombros y Tríceps', 1) RETURNING id INTO v_rutina_id;
        
        IF v_ej_banco_plano IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_banco_plano, 4, '8', 180, 1); END IF;
        IF v_ej_press_inclinado IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_press_inclinado, 4, '12', 90, 2); END IF;
        IF v_ej_aperturas IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_aperturas, 4, '12', 90, 3); END IF;
        IF v_ej_press_militar IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_press_militar, 4, '10', 120, 4); END IF;
        IF v_ej_vuelos_lat IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_vuelos_lat, 4, '12', 60, 5); END IF;
        IF v_ej_press_frances IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_press_frances, 4, '10', 90, 6); END IF;
        IF v_ej_triceps_polea IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_triceps_polea, 4, '15', 60, 7); END IF;
        IF v_ej_plancha IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_plancha, 4, '00:30 min', 60, 8); END IF;

        -- Día 2: Piernas
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 2, 'Piernas', 2) RETURNING id INTO v_rutina_id;
        
        IF v_ej_sentadilla IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_sentadilla, 4, '8', 120, 1); END IF;
        IF v_ej_prensa IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_prensa, 4, '12', 90, 2); END IF;
        IF v_ej_sillon_cuad IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_sillon_cuad, 4, '15', 60, 3); END IF;
        IF v_ej_pmuerto_barra IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_pmuerto_barra, 4, '10', 120, 4); END IF;
        IF v_ej_camilla_isquios IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_camilla_isquios, 4, '12', 60, 5); END IF;
        IF v_ej_gemelos IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_gemelos, 4, '20', 30, 6); END IF;

        -- Día 3: Espalda y Bíceps
        INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
        VALUES (v_plan_id, 3, 'Espalda y Bíceps', 3) RETURNING id INTO v_rutina_id;
        
        IF v_ej_jalon_abierto IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_jalon_abierto, 4, '8', 120, 1); END IF;
        IF v_ej_remo_bajo IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_remo_bajo, 4, '10', 90, 2); END IF;
        IF v_ej_pullover_polea IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_pullover_polea, 4, '12', 60, 3); END IF;
        IF v_ej_vuelo_post IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_vuelo_post, 4, '15', 60, 4); END IF;
        IF v_ej_biceps_barra IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_biceps_barra, 4, '10', 90, 5); END IF;
        IF v_ej_biceps_scott IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_biceps_scott, 4, '12', 60, 6); END IF;
        IF v_ej_abs_bisagra IS NOT NULL THEN INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden) VALUES (v_rutina_id, v_ej_abs_bisagra, 4, '20', 30, 7); END IF;
    END IF;

END $$;
