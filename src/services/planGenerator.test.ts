import { describe, it, expect } from 'vitest';
import { PlanGenerator } from './planGenerator';

describe('PlanGenerator', () => {

  const basePlan = [
    {
      dia_numero: 1,
      nombre_dia: "Lunes",
      ejercicios: [
        { ejercicio_id: 'base-1', position: 1, exercise_type: 'base', series: 3, reps_target: '12', descanso_seg: 60 }
      ]
    }
  ];

  const rotations = [
    {
      position: 1,
      applies_to_days: ['lunes'],
      cycles: [
        { duration_weeks: 2, exercises: ['rot-A'] },
        { duration_weeks: 2, exercises: ['rot-B'] }
      ]
    }
  ];

  it('debe devolver el ejercicio base si no hay rotaciones', () => {
    const resolved = PlanGenerator.resolveWeeklyPlan(basePlan, [], 1);
    expect(resolved[0].ejercicios[0].ejercicio_id).toBe('base-1');
  });

  it('debe rotar al ejercicio A en la semana 1 y 2', () => {
    const week1 = PlanGenerator.resolveWeeklyPlan(basePlan, rotations, 1);
    const week2 = PlanGenerator.resolveWeeklyPlan(basePlan, rotations, 2);
    expect(week1[0].ejercicios[0].ejercicio_id).toBe('rot-A');
    expect(week2[0].ejercicios[0].ejercicio_id).toBe('rot-A');
  });

  it('debe rotar al ejercicio B en la semana 3 y 4', () => {
    const week3 = PlanGenerator.resolveWeeklyPlan(basePlan, rotations, 3);
    const week4 = PlanGenerator.resolveWeeklyPlan(basePlan, rotations, 4);
    expect(week3[0].ejercicios[0].ejercicio_id).toBe('rot-B');
    expect(week4[0].ejercicios[0].ejercicio_id).toBe('rot-B');
  });

  it('debe reiniciar el ciclo después de que termina la rotación', () => {
    // Total 4 semanas, semana 5 debería ser rot-A nuevamente
    const week5 = PlanGenerator.resolveWeeklyPlan(basePlan, rotations, 5);
    expect(week5[0].ejercicios[0].ejercicio_id).toBe('rot-A');
  });

  it('debe aplicar una variación de día de descanso (vaciando ejercicios)', () => {
    const variations = [
      { numero_semana: 1, tipo: 'rest_day', ajustes: { dia_numero: 1 } }
    ];
    const resolved = PlanGenerator.resolveWeeklyPlan(basePlan, [], 1, variations);
    expect(resolved[0].ejercicios.length).toBe(0);
  });

  it('debe aplicar una variación de mover día', () => {
    // Lunes (dia 1) tiene ejercicios, Martes (dia 2) está vacío en basePlan
    const baseWithEmptyTuesday = [
      ...basePlan,
      { dia_numero: 2, nombre_dia: "Martes", ejercicios: [] }
    ];
    const variations = [
      { numero_semana: 1, tipo: 'move_day', ajustes: { from_dia: 1, to_dia: 2 } }
    ];
    const resolved = PlanGenerator.resolveWeeklyPlan(baseWithEmptyTuesday, [], 1, variations);
    
    expect(resolved[0].ejercicios.length).toBe(0); // Lunes vacío
    expect(resolved[1].ejercicios.length).toBe(1); // Martes tiene el ejercicio de lunes
    expect(resolved[1].ejercicios[0].ejercicio_id).toBe('base-1');
  });

});
