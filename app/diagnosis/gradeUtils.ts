/**
 * Suprima Grade Conversion Logic
 * 1st Priority: Grade, 2nd Priority: Percentile
 * Standard: 3rd Grade (9-grade system)
 * Target: Convert 1st/2nd Grade (5-grade system) to 9-grade equivalent
 */

export interface GradeResult {
  originalGrade: number;
  originalSystem: 5 | 9;
  convertedGrade9: number; // The equivalent in 9-grade system
  label: string; // e.g., "1등급(1.8)"
}

/**
 * Converts a grade from the 5-grade system (new) to the 9-grade system (standard)
 * based on the cumulative percentile mapping.
 * 
 * 5-grade System: 1(10%), 2(34%), 3(66%), 4(90%), 5(100%)
 * 9-grade System: 1(4%), 2(11%), 3(23%), 4(40%), 5(60%), 6(77%), 7(89%), 8(96%), 9(100%)
 */
export function convertTo9GradeSystem(grade5: number): number {
  const mapping: Record<number, number> = {
    1: 1.8, // 10% in 9-grade system is between 1(4%) and 2(11%), closer to 2.
    2: 3.6, // 34% in 9-grade system is between 3(23%) and 4(40%)
    3: 5.3, // 66% in 9-grade system is between 5(60%) and 6(77%)
    4: 7.1, // 90% in 9-grade system is between 7(89%) and 8(96%)
    5: 9.0, // Bottom
  };

  return mapping[grade5] || grade5;
}

export function formatGradeLabel(grade: number, system: 5 | 9): string {
  if (system === 9) return `${grade}등급`;
  
  const converted = convertTo9GradeSystem(grade);
  return `${grade}등급(${converted.toFixed(1)}등급)`;
}
