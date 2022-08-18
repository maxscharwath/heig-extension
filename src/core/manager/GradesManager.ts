import objectHash from 'object-hash';
import { TypedEmitter } from 'tiny-typed-emitter';
import browser from 'webextension-polyfill';
import CourseInterface from '@/core/entity/CourseInterface';
import GradeInterface from '@/core/entity/GradeInterface';
import SectionInterface from '@/core/entity/SectionInterface';
import { useStorage } from '@/store/useStorage';

export type Grade = {
  course: Omit<CourseInterface, 'sections'>,
  section: Omit<SectionInterface, 'grades'>,
  grade: GradeInterface
}
export type NewGrades = {
  [key: GradeInterface['uuid']]: [
    CourseInterface['uuid'],
    SectionInterface['uuid'],
    GradeInterface['uuid']
  ]
}

export default class GradesManager extends TypedEmitter<{
  newGrade: (_grade: Grade) => void;
  newGrades: (_grades: Grade[]) => void;
  onUpdate: () => void;
}> {
  private gradesHash = useStorage({
    id: 'gradesHash',
    defaultState: () => new Set<string>(),
    preTransformers: {
      read: (value: string): Set<string> => new Set(JSON.parse(value)),
      write: (value: Set<string>): string => JSON.stringify([...value]),
    },
  });

  private gradesData = useStorage<CourseInterface[]>({
    id: 'gradesData',
    defaultState: [],
  });

  private updatedAt = useStorage<Date, string>({
    id: 'updatedAt',
    defaultState: new Date(0),
    preTransformers: {
      read: (value: string): Date => new Date(value),
      write: (value: Date): string => value.toISOString(),
    },
  });

  private newGradesNotification = useStorage<NewGrades>({
    id: 'newGrades',
    defaultState: {},
    onChange: (newValue) => {
      const nbNewGrades = Object.values(newValue ?? {}).length;
      const action = browser.action || browser.browserAction;
      action.setBadgeText({
        text: nbNewGrades > 0 ? `${nbNewGrades}` : '',
      })
        .catch(console.error);
    },
  });

  public getCourses(): CourseInterface[] {
    return this.gradesData.value ?? [];
  }

  public getUpdatedAt(): Date {
    return this.updatedAt.value ?? new Date(0);
  }

  public async addCourses(courses: CourseInterface[]) {
    const newGrades: Grade[] = [];
    const tmpGradesHash = new Set<string>();
    courses.forEach(({
      sections,
      ...course
    }) => {
      sections.forEach(({
        grades,
        ...section
      }) => {
        grades.forEach((grade) => {
          if (Number.isNaN(grade.grade)) {
            return;
          }
          const result: Grade = {
            course,
            section,
            grade,
          };
          const hash = objectHash(grade);
          tmpGradesHash.add(hash);
          if (!this.gradesHash.value?.has(hash)) {
            newGrades.push(result);
            if (this.newGradesNotification.value) {
              this.newGradesNotification.value[grade.uuid] = [
                course.uuid,
                section.uuid,
                grade.uuid,
              ];
            }
            this.emit('newGrade', result);
          }
        });
      });
    });
    this.gradesData.value = courses;
    this.updatedAt.value = new Date();
    this.gradesHash.value = tmpGradesHash;
    this.emit('onUpdate');
    if (newGrades.length > 0) {
      this.emit('newGrades', newGrades);
    }
    console.log(`GradesManager: addCourses: ${newGrades.length} new grades`);
  }

  public clear() {
    this.gradesData.clear();
    this.updatedAt.clear();
    this.gradesHash.clear();
    this.newGradesNotification.clear();
  }
}
