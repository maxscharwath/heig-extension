import getStorageRef from '@/store/Storage';

export default getStorageRef('settings', {
  defaultValue: {
    credentials: {
      username: '',
      password: '',
    },
    checkResultsInterval: 10,
    language: 'en',
  },
});
