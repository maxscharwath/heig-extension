import GradeInterface from '@/core/entity/GradeInterface';

export default interface SectionInterface {
  uuid: string;
  name: string;
  coefficient: number;
  average: number;
  grades: GradeInterface[];
}
