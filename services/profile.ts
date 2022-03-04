import i18n from 'i18n'
import config from 'config'
import GraphApi from './graph-api'

const locales = i18n.languages

export default class Profile {
  setWebhook() {
    GraphApi.callSubscriptionsAPI({})
    GraphApi.callSubscribedApps({})
  }

  setPageFeedWebhook() {
    GraphApi.callSubscriptionsAPI('feed')
    GraphApi.callSubscribedApps('feed')
  }

  setThread() {
    const profilePayload = {
      ...this.getGetStarted(),
      ...this.getGreeting(),
      ...this.getPersistentMenu(),
    }

    GraphApi.callMessengerProfileAPI(profilePayload)
  }

  setGetStarted() {
    const getStartedPayload = this.getGetStarted()
    GraphApi.callMessengerProfileAPI(getStartedPayload)
  }

  setGreeting() {
    const greetingPayload = this.getGreeting()
    GraphApi.callMessengerProfileAPI(greetingPayload)
  }

  setPersistentMenu() {
    const menuPayload = this.getPersistentMenu()
    GraphApi.callMessengerProfileAPI(menuPayload)
  }

  setWhitelistedDomains() {
    const domainPayload = this.getWhitelistedDomains()
    GraphApi.callMessengerProfileAPI(domainPayload)
  }

  getGetStarted() {
    return {
      get_started: {
        payload: 'GET_STARTED',
      },
    }
  }

  getGreeting() {
    const greetings = []

    for (const locale of locales) {
      if (locale !== 'dev') {
        greetings.push(this.getGreetingText(locale))
      }
    }

    return {
      greeting: greetings,
    }
  }

  getPersistentMenu() {
    const menuItems = []

    for (const locale of locales) {
      if (locale !== 'dev') {
        menuItems.push(this.getMenuItems(locale))
      }
    }

    return {
      persistent_menu: menuItems,
    }
  }

  getGreetingText(locale: string) {
    const param = locale === 'vi_VN' ? 'default' : locale

    i18n.changeLanguage(locale)

    const localizedGreeting = {
      locale: param,
      text: i18n.t('profile.greeting', {
        user_first_name: '{{user_first_name}}',
      }),
    }

    console.log({ localizedGreeting })
    return localizedGreeting
  }

  getMenuItems(locale: string) {
    const param = locale === 'vi_VN' ? 'default' : locale

    i18n.changeLanguage(locale)

    const localizedMenu = {
      locale: param,
      composer_input_disabled: false,
      call_to_actions: [
        {
          title: i18n.t('changeConfig'),
          type: 'postback',
          payload: 'CURATION_GOT_IT',
        },
        {
          title: i18n.t('showInstruction'),
          type: 'postback',
          payload: 'CURATION_EXPLORE',
        },
      ],
    }

    console.log({ localizedMenu })
    return localizedMenu
  }

  getWhitelistedDomains() {
    const whitelistedDomains = {
      whitelisted_domains: config.whitelistedDomains,
    }

    console.log({ whitelistedDomains })
    return whitelistedDomains
  }
}
