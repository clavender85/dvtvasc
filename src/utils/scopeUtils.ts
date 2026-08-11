// Helper utilities for managing Examination Scope (Study Type + Regions Examined)
import { PatientHeader, ExaminationScope, StudyType, RegionsExamined, ExamType } from '../types/dvt';

export function getNormalizedScope(header: PatientHeader): ExaminationScope {
  if (header.scope && header.scope.regionsExamined) {
    return header.scope;
  }

  // Fallback / legacy derivation from header.examType
  const examTypeStr = header.examType || 'Bilateral lower limbs';
  let studyType: StudyType = 'Routine DVT study';
  if (examTypeStr === 'Follow-up known DVT') studyType = 'Follow-up known DVT';
  else if (examTypeStr === 'Limited DVT study') studyType = 'Limited DVT study';
  else if (examTypeStr === 'Other') studyType = 'Other';

  const regions: RegionsExamined = {
    rightLowerLimb: examTypeStr.includes('Right') || examTypeStr.includes('Bilateral') || examTypeStr === 'Follow-up known DVT',
    leftLowerLimb: examTypeStr.includes('Left') || examTypeStr.includes('Bilateral') || examTypeStr === 'Follow-up known DVT',
    iliocaval: examTypeStr.includes('Pelvic') || examTypeStr.includes('iliocaval')
  };

  return {
    studyType,
    regionsExamined: regions
  };
}

export function computeExamTypeTitle(scope: ExaminationScope): ExamType {
  const { studyType, regionsExamined: r } = scope;

  let regionTitle = '';
  if (r.rightLowerLimb && r.leftLowerLimb && r.iliocaval) {
    regionTitle = 'Bilateral lower limbs + Iliocaval';
  } else if (r.rightLowerLimb && r.leftLowerLimb) {
    regionTitle = 'Bilateral lower limbs';
  } else if (r.rightLowerLimb && r.iliocaval) {
    regionTitle = 'Right lower limb + Iliocaval';
  } else if (r.leftLowerLimb && r.iliocaval) {
    regionTitle = 'Left lower limb + Iliocaval';
  } else if (r.rightLowerLimb) {
    regionTitle = 'Right lower limb';
  } else if (r.leftLowerLimb) {
    regionTitle = 'Left lower limb';
  } else if (r.iliocaval) {
    regionTitle = 'Pelvic/iliocaval assessment';
  } else {
    regionTitle = 'Limited DVT study';
  }

  if (studyType === 'Follow-up known DVT') {
    return 'Follow-up known DVT' as ExamType;
  }
  if (studyType === 'Limited DVT study') {
    return 'Limited DVT study' as ExamType;
  }
  if (studyType === 'Other') {
    return 'Other' as ExamType;
  }

  return regionTitle as ExamType;
}

export function updateHeaderScope(
  header: PatientHeader,
  newScope: ExaminationScope
): PatientHeader {
  const computedTitle = computeExamTypeTitle(newScope);
  return {
    ...header,
    examType: computedTitle,
    scope: newScope
  };
}
