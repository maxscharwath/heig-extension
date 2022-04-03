import Gaps from '@/core/Gaps';
import GradesManager from '@/core/manager/GradesManager'

console.log('hello world background todo something~');

const gaps = new Gaps();
const manager = new GradesManager();
manager.on('newGrades', (grades) => {
  console.log('new grades', grades);
});
(async () => {
  await gaps.autoLogin({ username: '***REMOVED***', password: '***REMOVED***' });
  const years = await gaps.getYearAvailable();
  const info = await gaps.getInfo();
  const result = await gaps.getResults(years[0]);
  manager.addCourses(result);
  await chrome.storage.local.set({ info, result });
})();
