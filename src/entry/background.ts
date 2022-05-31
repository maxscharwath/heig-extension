import Gaps, { UserInfo } from '@/core/Gaps';
import GradesManager from '@/core/manager/GradesManager';
import settings from '@/store/Settings';
import { useStorage } from '@/store/useStorage';

console.log(`Background script loaded at ${new Date().toLocaleString()}`);

const gaps = new Gaps();
const manager = new GradesManager();

const info = useStorage<UserInfo>({ id: 'info' });
const years = useStorage<number[]>({
  id: 'years',
  defaultState: [],
});

async function checkResults() {
  console.log('checkResults');
  try {
    if (!await gaps.autoLogin(settings.value?.credentials)) {
      console.log('autoLogin failed');
      return;
    }
    if (!years.value) {
      years.value = await gaps.getYearAvailable();
    }
    const result = await gaps.getResults(years.value[0]);
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
    years.value = await gaps.getYearAvailable();
    info.value = await gaps.getInfo();
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
  console.log('onChange', checkResultsInterval);
  chrome.alarms.create('checkResults', {
    periodInMinutes: checkResultsInterval,
  });
});

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
      case 'login': {
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
