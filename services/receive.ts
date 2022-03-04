import isEmpty from 'lodash/isEmpty'

import config from 'config'

import UserModel from 'database/user'

import Curation from 'services/curation'
import GraphApi from 'services/graph-api'
import Response from './response'
import { generateText } from './text-generator'
import i18n from '../i18n'

export default class Receive {
  user: any

  webhookEvent: any

  constructor(user = {}, webhookEvent = {}) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  async handleMessage() {
    const event = this.webhookEvent

    let responses

    try {
      if (event.message) {
        const { message } = event

        if (message.quick_reply) {
          responses = this.handleQuickReply()
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage()
        } else if (message.text) {
          responses = await this.handleTextMessage()
        }
      } else if (event.postback) {
        responses = this.handlePostback()
      } else if (event.referral) {
        responses = this.handleReferral()
      }
    } catch (error) {
      console.error(error)
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`,
      }
    }

    if (Array.isArray(responses)) {
      let delay = 0
      for (const response of responses) {
        this.sendMessage(response, delay * 2000)
        delay++
      }
    } else {
      this.sendMessage(responses)
    }
  }

  // Handles messages events with text
  async handleTextMessage() {
    console.log('Received text:', `${this.webhookEvent.message.text} for ${this.user.psid}`)

    const event = this.webhookEvent

    // check greeting is here and is confident
    const greeting = this.firstEntity(event.message.nlp, 'greetings')
    const message = event.message.text.trim().toLowerCase()

    let response

    const userConfig = await UserModel.findOne({ id: this.user.psid })
    const isGenerating = userConfig && userConfig.isGenerating

    if ((greeting && greeting.confidence > 0.8) || message.includes('start over')) {
      response = Response.genNuxMessage(this.user)
    } else if (isEmpty(userConfig)) {
      response = [
        Response.genText(i18n.t('notConfigured')),
        Response.genGenericTemplate(
          `${config.appUrl}/logo.png`,
          i18n.t('curation.clickToConfig'),
          '',
          [
            Response.genWebUrlButton(
              i18n.t('curation.inputYourConfig'),
              `${config.appUrl}/configuration?userId=${this.user.psid}`
            ),
          ]
        ),
      ]
    } else if (isGenerating) {
      response = [Response.genText(i18n.t('generating'))]
    } else {
      generateText({
        user: userConfig,
        text: this.webhookEvent.message.text,
      })
      response = [Response.genText(i18n.t('gotYourIdea'))]
    }

    return response
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    // Get the attachment
    const attachment = this.webhookEvent.message.attachments[0]
    console.log('Received attachment:', `${attachment} for ${this.user.psid}`)

    const response = Response.genQuickReply(i18n.t('fallback.attachment'), [
      {
        title: i18n.t('menu.help'),
        payload: 'CARE_HELP',
      },
      {
        title: i18n.t('menu.start_over'),
        payload: 'GET_STARTED',
      },
    ])

    return response
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    const { payload } = this.webhookEvent.message.quick_reply

    return this.handlePayload(payload)
  }

  // Handles postbacks events
  handlePostback() {
    const { postback } = this.webhookEvent
    // Check for the special Get Starded with referral
    let payload
    if (postback.payload) {
      // Get the payload of the postback
      payload = postback.payload
    } else if (postback.referral && postback.referral.type == 'OPEN_THREAD') {
      payload = postback.referral.ref
    }

    return this.handlePayload(payload.toUpperCase())
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    const payload = this.webhookEvent.referral.ref.toUpperCase()

    return this.handlePayload(payload)
  }

  handlePayload(payload: any) {
    console.log('Received Payload:', `${payload} for ${this.user.psid}`)

    let response

    // Set the response based on the payload
    if (payload === 'GET_STARTED' || payload === 'DEVDOCS' || payload === 'GITHUB') {
      response = Response.genNuxMessage(this.user)
    } else if (payload.includes('CURATION') || payload.includes('COUPON')) {
      const curation = new Curation(this.user, this.webhookEvent)
      response = curation.handlePayload(payload)
    } else if (payload.includes('CHAT-PLUGIN')) {
      response = [Response.genText(i18n.t('chat_plugin.prompt'))]
    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`,
      }
    }

    return response
  }

  handlePrivateReply(type: any, objectId: any) {
    const response = Response.genGenericTemplate(
      `https://v2l.edu.vn/wp-content/uploads/2021/02/direction-1400x665.png`,
      i18n.t('get_started.title'),
      i18n.t('get_started.subtitle'),
      [
        Response.genWebUrlButton(i18n.t('get_started.aboutUs'), 'faty.vn'),
        Response.genPostbackButton(i18n.t('get_started.exploreFeature'), 'CURATION_EXPLORE'),
      ]
    )

    const requestBody = {
      recipient: {
        [type]: objectId,
      },
      message: response,
    }

    GraphApi.callSendApi(requestBody)
  }

  sendMessage(response: any, delay = 0) {
    // Check if there is delay in the response
    if ('delay' in response) {
      delay = response.delay
      delete response.delay
    }

    // Construct the message body
    let requestBody: any = {
      recipient: {
        id: this.user.psid,
      },
      message: response,
    }

    // Check if there is persona id in the response
    if ('persona_id' in response) {
      const { personaId } = response
      delete response.persona_id

      requestBody = {
        recipient: {
          id: this.user.psid,
        },
        message: response,
        persona_id: personaId,
      }
    }

    setTimeout(() => GraphApi.callSendApi(requestBody), delay)
  }

  firstEntity(nlp: any, name: any) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
  }
}
