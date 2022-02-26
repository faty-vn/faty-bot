import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import tranlationEN from './locales/en/translationEN.json'
import tranlationVI from './locales/vi/translationVI.json'

const resources = {
  en: { tranlation: tranlationEN },
  vi: { tranlation: tranlationVI },
}

i18n
  .use(initReactI18next)
  .init({ resources, lng: 'vi', keySeparator: false, interpolation: { escapeValue: false } })

export default i18n