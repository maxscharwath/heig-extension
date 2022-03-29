import Gaps from '@/core/Gaps';

console.log('hello world background todo something~');

const gaps = new Gaps();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received', msg, sender);
  (async () => {
    await gaps.loginCredentials({
      username: '***REMOVED***', password: '***REMOVED***',
    });
    const user = await gaps.getInfo();
    console.log('user info', user);
    const years = await gaps.getYearAvailable();
    console.log('Years', years);
    const result = await gaps.getResults(years[0]);
    console.log('Results', result);
    sendResponse({
      user,
      years,
      result,
    });
  })();
  return true;
});
