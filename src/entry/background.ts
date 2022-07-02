import Gaps, { UserInfo } from '@/core/Gaps';
import GradesManager from '@/core/manager/GradesManager';
import settings from '@/store/Settings';
import { useStorage } from '@/store/useStorage';
import browser from 'webextension-polyfill';

console.log(`Background script loaded at ${new Date().toLocaleString()}`);

const gaps = new Gaps();
const manager = new GradesManager();

const info = useStorage<UserInfo>({ id: 'info' });
const years = useStorage<number[]>({
  id: 'years',
});

async function checkResults() {
  console.log('checkResults');
  try {
    if (!await gaps.autoLogin(settings.value?.credentials)) {
      console.log('autoLogin failed');
      return;
    }
    if (!info.value) {
      info.value = await gaps.getInfo();
    }
    if (!years.value) {
      years.value = await gaps.getYearAvailable();
    }
    const result = await gaps.getResults(years.value[0]);
    await manager.addCourses(result);
  } catch (e) {
    console.error(e);
  }
}

async function logout() {
  console.log('logout');
  await gaps.logout();
  manager.clear();
  info.clear();
  years.clear();
}

async function login(credentials: { username: string, password: string }) {
  try {
    await gaps.loginCredentials(credentials);
    years.value = await gaps.getYearAvailable();
    info.value = await gaps.getInfo();
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}

browser.alarms.create('checkResults', {
  periodInMinutes: 20,
});

browser.alarms.onAlarm.addListener(async (alarm) => {
  console.log('onAlarm', alarm);
  if (alarm.name === 'checkResults') {
    await checkResults();
  }
});

settings.onChange((data) => {
  if (!data?.checkResultsInterval) return;
  browser.alarms.create('checkResults', {
    periodInMinutes: data.checkResultsInterval,
  });
});

browser.runtime.onMessage.addListener(async (request) => {
  console.log('onMessage', request);
  const payload = request.payload ?? {};
  switch (request.type) {
    case 'fetchResults':
      await checkResults();
      return { success: true };
    case 'clear':
      await logout();
      await browser.action.setBadgeText({ text: '' });
      return { success: true };
    case 'login':
      return { success: await login(payload) };
    default:
      return { success: false };
  }
});
