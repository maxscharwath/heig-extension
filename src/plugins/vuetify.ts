// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/dist/vuetify.min.css';
// Vuetify
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import en from '@/locales/en';
import fr from '@/locales/fr';

export default createVuetify({
  components,
  directives,
  locale: {
    defaultLocale: 'fr',
    fallbackLocale: 'en',
    messages: {
      en,
      fr,
    },
  },
});
