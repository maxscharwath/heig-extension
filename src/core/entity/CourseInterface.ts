import SectionInterface from '@/core/entity/SectionInterface';

export default interface CourseInterface {
  uuid: string;
  name: string;
  year: number;
  average: number;
  sections: SectionInterface[];
}
