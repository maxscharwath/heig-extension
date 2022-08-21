import { ref } from 'vue'
import { useStorage } from '@/store/useStorage'
import { Log, UserInfo } from '@/core/Gaps'
import CourseInterface from '@/core/entity/CourseInterface'
import { type NewGrades } from '@/core/manager/GradesManager'
import { MenuResponse } from '@/store/Menu'

export const settings = useStorage({
  id: 'settings',
  defaultState: {
    credentials: {
      username: '',
      password: '',
    },
    checkCredentials: {
      lastCheckAt: new Date(0),
      status: {
        credentials: false,
        connected: false,
      },
    },
    enableFunctionality: {
      enableChat: false,
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

export const logs = useStorage<Log[]>({
  id: 'logs',
  defaultState: [],
});

export const menus = ref<{
  loadedAt: number,
  today?: MenuResponse,
  week: MenuResponse[],
}>({
  loadedAt: 0,
  week: [],
});
