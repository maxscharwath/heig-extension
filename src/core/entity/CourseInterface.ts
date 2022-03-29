import SectionInterface from '@/core/entity/SectionInterface';

export default interface CourseInterface {
  name: string;
  year: number;
  average: number;
  sections: SectionInterface[];
}
