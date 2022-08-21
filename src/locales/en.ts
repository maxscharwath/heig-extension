export default {
  routes: {
    grade: 'Grades',
    menu: 'Menu',
    settings: 'Settings',
    debug: 'Debug',
    chat: 'Chat',
  },
  weeks: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  grades: {
    lastCheckAt: 'Last check at',
    hasExam: 'Has exam',
    checkAll: 'Check all',
  },
  menu: {
    menuOfDay: 'Menu of the day',
    noMenu: 'No available menu today...',
  },
  settings: {
    title: 'Settings',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    phone: 'Phone',
    address: 'Address',
    birthday: 'Birthday',
    gapsCredentials: {
      title: 'Gaps Connexion',
      alert: {
        success: 'Connexion successful',
        error: 'Connexion failed',
      },
      status: {
        pending: 'Pending...',
        connectedToken: 'Connected with token',
        connectedCredentials: 'Connected with credentials',
        notConnected: 'Not connected',
        unknown: 'Unknown',
      },
    },
    enableFunctionality: {
      title: 'Functionalities',
      functionalities: {
        enableChat: 'Enable chat',
      },
    },
    logout: 'Logout',
    login: 'Login',
    save: 'Save',
    reload: 'Reload the extension',
    clearCache: {
      title: 'Clear cache',
    },
    language: {
      title: 'Language',
    },
    alarm: {
      title: 'Check for new grades',
      data: 'Every {0} minutes',
    },
  },
  chat: {
    alert: {
      needToBeConnected: 'You need to be connected to chat',
    },
    sendMessage: 'Send a message',
  },
};
