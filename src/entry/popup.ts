import { createApp } from 'vue';
import router from '@/router';
import App from '@/view/PopupView.vue';
import vuetify from '@/plugins/vuetify';
import loadFonts from '@/plugins/webfontloader';
import '@/assets/index.css';
import VueHighlightJS from 'vue3-highlightjs'
import 'highlight.js/styles/github-dark-dimmed.css'

loadFonts();
createApp(App)
  .use(router)
  .use(vuetify)
  .use(VueHighlightJS)
  .mount('#app');
