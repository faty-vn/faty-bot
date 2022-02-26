import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationVI from 'locales/vi_VN.json'
import translationEN from 'locales/en_US.json'


const resources = {
  'en_US': { translation: translationEN },
  'vi_VN': { translation: translationVI },
}

i18n
  .use(initReactI18next)
  .init({ 
    resources, 
    lng: 'vi_VN',
    interpolation: { escapeValue: false } 
  })

export default i18n