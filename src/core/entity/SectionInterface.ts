import GradeInterface from '@/core/entity/GradeInterface';

export default interface SectionInterface {
  name: string;
  coefficient: number;
  average: number;
  grades: GradeInterface[];
}
