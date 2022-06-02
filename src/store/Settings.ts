import { useStorage } from '@/store/useStorage'

export default useStorage({
  id: 'settings',
  defaultState: {
    autologin: false,
    credentials: {
      username: '',
      password: '',
    },
    checkResultsInterval: 10,
    language: 'en',
  },
})
