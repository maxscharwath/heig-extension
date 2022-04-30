// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
// Vuetify
import { createVuetify } from 'vuetify'
import en from '@/locales/en'
import fr from '@/locales/fr'

export default createVuetify({
  locale: {
    defaultLocale: 'fr',
    fallbackLocale: 'en',
    messages: {
      en, fr,
    },
  },
});
