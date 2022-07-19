import { useStorage } from '@/store/useStorage'
import { UserInfo } from '@/core/Gaps'
import CourseInterface from '@/core/entity/CourseInterface'
import { NewGrades } from '@/core/manager/GradesManager'
import { ref } from 'vue'

export const settings = useStorage({
  id: 'settings',
  defaultState: {
    credentials: {
      username: '',
      password: '',
    },
    checkResultsInterval: 10,
    language: 'en',
  },
});

export const info = useStorage<UserInfo>({ id: 'info' });

export const years = useStorage<number[]>({ id: 'years' });

export const result = useStorage<CourseInterface[]>({
  id: 'gradesData',
  defaultState: [],
});

export const newGrades = useStorage<NewGrades>({
  id: 'newGrades',
  defaultState: {},
});

export const updateAt = useStorage<Date, string>({
  id: 'updatedAt',
  defaultState: new Date(0),
  preTransformers: {
    read: (value) => new Date(value ?? 0),
    write: (value) => value.toISOString(),
  },
});
