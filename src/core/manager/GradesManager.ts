import objectHash from 'object-hash'
import { TypedEmitter } from 'tiny-typed-emitter'
import CourseInterface from '@/core/entity/CourseInterface'
import GradeInterface from '@/core/entity/GradeInterface'
import SectionInterface from '@/core/entity/SectionInterface'

type Grade = {
  course: Omit<CourseInterface, 'sections'>,
  section: Omit<SectionInterface, 'grades'>,
  grade: GradeInterface
}
export default class GradesManager extends TypedEmitter<{
  newGrade: (grade: Grade) => void;
  newGrades: (grades: Grade[]) => void;
  onUpdate: () => void;
}> {
  private gradesHash = new Set<string>();

  private gradesData: CourseInterface[] = [];

  private updatedAt?: Date;

  constructor() {
    super()
    chrome.storage.local.get(['gradesHash', 'gradesData'], ({ gradesHash, gradesData }) => {
      console.log('GradesManager: constructor', gradesHash, gradesData)
      this.gradesHash = new Set(gradesHash ?? []);
      this.gradesData = gradesData ?? [];
    })
  }

  public clear() {
    this.gradesHash.clear();
    this.gradesData = [];
    this.updatedAt = undefined;
    chrome.storage.local.set({ gradesHash: [], gradesData: [] }).finally()
  }

  public getCourses(): CourseInterface[] {
    return this.gradesData;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public addCourses(courses: CourseInterface[]) {
    const newGrades:Grade[] = [];
    const tmpGradesHash = new Set<string>();
    courses.forEach(({ sections, ...course }) => {
      sections.forEach(({ grades, ...section }) => {
        grades.forEach((grade) => {
          if (Number.isNaN(grade.grade)) {
            return;
          }
          const result:Grade = {
            course,
            section,
            grade,
          }
          const hash = objectHash(result);
          tmpGradesHash.add(hash);
          if (!this.gradesHash.has(hash)) {
            newGrades.push(result);
            this.emit('newGrade', result);
          }
        })
      })
    })
    this.gradesData = courses;
    this.updatedAt = new Date();
    this.gradesHash = tmpGradesHash;
    this.emit('onUpdate');
    chrome.storage.local.set({
      updatedAt: this.updatedAt.toISOString(),
      gradesHash: [...this.gradesHash],
      gradesData: courses,
    }).finally()
    if (newGrades.length > 0) {
      this.emit('newGrades', newGrades)
    }
    console.log(`GradesManager: addCourses: ${newGrades.length} new grades`);
  }
}
