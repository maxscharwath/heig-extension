import { createApp } from 'vue';
import router from '@/router';
import App from '@/view/PopupView.vue';
import vuetify from '@/plugins/vuetify';
import loadFonts from '@/plugins/webfontloader';
import '@/assets/index.css';
import VueHighlightJS from 'vue3-highlightjs'
import 'highlight.js/styles/github-dark-dimmed.css'
import { createPinia } from 'pinia'

const pinia = createPinia()
loadFonts();
createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(VueHighlightJS)
  .mount('#app');
