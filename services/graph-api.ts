import config from 'config'
import fetch from 'node-fetch'
import { URL, URLSearchParams } from 'url'

export default class GraphApi {
  static async callSendApi(requestBody: any) {
    const url = new URL(`${config.apiUrl}/me/messages`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) {
      console.warn(`Could not sent message.`, response.statusText)
    }
  }

  static async callMessengerProfileAPI(requestBody: any) {
    // Send the HTTP request to the Messenger Profile API

    console.log(`Setting Messenger Profile for app ${config.appId}`)
    const url = new URL(`${config.apiUrl}/me/messenger_profile`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) {
      console.log(`Request sent.`)
    } else {
      console.warn(
        `Unable to callMessengerProfileAPI: ${response.statusText}`,
        await response.json()
      )
    }
  }

  static async callSubscriptionsAPI(customFields: any) {
    // Send the HTTP request to the Subscriptions Edge to configure your webhook
    // You can use the Graph API's /{app-id}/subscriptions edge to configure and
    // manage your app's Webhooks product
    // https://developers.facebook.com/docs/graph-api/webhooks/subscriptions-edge
    console.log(`Setting app ${config.appId} callback url to ${config.webhookUrl}`)

    let fields =
      'messages, messaging_postbacks, messaging_optins, ' +
      'message_deliveries, messaging_referrals'

    if (customFields !== undefined) {
      fields = `${fields}, ${customFields}`
    }

    console.log({ fields })

    const url = new URL(`${config.apiUrl}/${config.appId}/subscriptions`)
    url.search = new URLSearchParams({
      access_token: `${config.appId}|${config.appSecret}` || '',
      object: 'page' || '',
      callback_url: config.webhookUrl || '',
      verify_token: config.verifyToken || '',
      fields: fields || '',
      include_values: 'true',
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      console.log(`Request sent.`)
    } else {
      console.error(`Unable to callSubscriptionsAPI: ${response.statusText}`, await response.json())
    }
  }

  static async callSubscribedApps(customFields: any) {
    // Send the HTTP request to subscribe an app for Webhooks for Pages
    // You can use the Graph API's /{page-id}/subscribed_apps edge to configure
    // and manage your pages subscriptions
    // https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps
    console.log(`Subscribing app ${config.appId} to page ${config.pageId}`)

    let fields =
      'messages, messaging_postbacks, messaging_optins, ' +
      'message_deliveries, messaging_referrals'

    if (customFields !== undefined) {
      fields = `${fields}, ${customFields}`
    }

    console.log({ fields })

    const url = new URL(`${config.apiUrl}/${config.pageId}/subscribed_apps`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
      subscribed_fields: fields,
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
    })
    if (response.ok) {
      console.log(`Request sent.`)
    } else {
      console.error(`Unable to callSubscribedApps: ${response.statusText}`, await response.json())
    }
  }

  static async getUserProfile(senderIgsid: any) {
    const url = new URL(`${config.apiUrl}/${senderIgsid}`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
      fields: 'first_name, last_name, gender, locale, timezone',
    }).toString()
    const response = await fetch(url.toString())
    if (response.ok) {
      const userProfile: any = await response.json()
      return {
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        gender: userProfile.gender,
        locale: userProfile.locale,
        timezone: userProfile.timezone,
      }
    }
    console.warn(
      `Could not load profile for ${senderIgsid}: ${response.statusText}`,
      await response.json()
    )
    return null
  }

  static async getPersonaAPI() {
    // Send the POST request to the Personas API
    console.log(`Fetching personas for app ${config.appId}`)

    const url = new URL(`${config.apiUrl}/me/personas`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
    }).toString()
    const response = await fetch(url.toString())
    if (response.ok) {
      const body: any = await response.json()
      return body.data
    }
    console.warn(
      `Unable to fetch personas for ${config.appId}: ${response.statusText}`,
      await response.json()
    )
    return null
  }

  static async postPersonaAPI(name: any, profile_picture_url: any) {
    const requestBody = {
      name,
      profile_picture_url,
    }
    console.log(`Creating a Persona for app ${config.appId}`)
    console.log({ requestBody })
    const url = new URL(`${config.apiUrl}/me/personas`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
    if (response.ok) {
      console.log(`Request sent.`)
      const json: any = await response.json()
      return json.id
    }
    console.error(`Unable to postPersonaAPI: ${response.statusText}`, await response.json())
  }

  static async callNLPConfigsAPI() {
    // Send the HTTP request to the Built-in NLP Configs API
    // https://developers.facebook.com/docs/graph-api/reference/page/nlp_configs/

    console.log(`Enable Built-in NLP for Page ${config.pageId}`)

    const url = new URL(`${config.apiUrl}/me/nlp_configs}/me/nlp_configs`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken || '',
      nlp_enabled: 'true',
    }).toString()

    const response = await fetch(url.toString(), {
      method: 'POST',
    })
    if (response.ok) {
      console.log(`Request sent.`)
    } else {
      console.error(`Unable to activate built-in NLP: ${response.statusText}`)
    }
  }
}
