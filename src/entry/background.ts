import Gaps from '@/core/Gaps';
import GradesManager, { NewGrades } from '@/core/manager/GradesManager';
import settings from '@/store/Settings';

console.log(`Background script loaded at ${new Date().toLocaleString()}`);

const gaps = new Gaps();
const manager = new GradesManager();
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.newGrades) {
    const newGrades:NewGrades = changes.newGrades.newValue;
    if (newGrades) {
      const nbGrades = Object.values(newGrades).length;
      await chrome.action.setBadgeText({ text: nbGrades > 0 ? `${nbGrades}` : '' });
    }
  }
});

async function checkResults() {
  console.log('checkResults');
  try {
    const storageData = await chrome.storage.local.get(['years', 'credentials']);
    if (!await gaps.autoLogin(storageData.credentials)) {
      console.log('autoLogin failed');
      return;
    }
    if (!storageData.years) {
      storageData.years = await gaps.getYearAvailable();
    }
    const result = await gaps.getResults(storageData.years[0]);
    manager.addCourses(result);
  } catch (e) {
    console.error(e);
  }
}

async function logout() {
  console.log('logout');
  await gaps.logout();
  await chrome.storage.local.clear();
}

async function login(credentials: { username: string, password: string }) {
  try {
    console.log('login');
    await logout();
    await gaps.loginCredentials(credentials);
    await chrome.storage.local.set({
      credentials,
      info: await gaps.getInfo(),
      years: await gaps.getYearAvailable(),
    });
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}

chrome.alarms.create('checkResults', {
  periodInMinutes: 20,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('onAlarm', alarm);
  if (alarm.name === 'checkResults') {
    await checkResults();
  }
});

settings.onChange(({ checkResultsInterval }) => {
  chrome.alarms.create('checkResults', {
    periodInMinutes: checkResultsInterval,
  });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    console.log('onMessage', request);
    const payload = request.payload ?? {};
    switch (request.type) {
      case 'fetchResults':
        await checkResults();
        sendResponse({ success: true });
        break;
      case 'clear':
        await logout();
        await chrome.action.setBadgeText({ text: '' });
        break;
      case 'login':
        {
          const result = await login(payload);
          sendResponse({ success: result });
        }
        break;
      default:
        sendResponse({});
    }
  })();
  return true;
});
