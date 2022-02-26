import isEmpty from 'lodash/isEmpty'

import { generateText } from './text-generator'
import config from 'config'

// import UserModel from '../db/user'

import Response from './response'
import Curation from 'services/curation'
import GraphApi from 'services/graph-api'
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
    let event = this.webhookEvent

    let responses

    try {
      if (event.message) {
        let message = event.message

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
      for (let response of responses) {
        this.sendMessage(response, delay * 2000)
        delay++
      }
    } else {
      this.sendMessage(responses)
    }
  }

  // Handles messages events with text
  async handleTextMessage() {
    console.log(
      'Received text:',
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    )

    let event = this.webhookEvent

    // check greeting is here and is confident
    let greeting = this.firstEntity(event.message.nlp, 'greetings')
    let message = event.message.text.trim().toLowerCase()

    let response
		let userConfig: any = null
    // const userConfig = await UserModel.findOne({ id: this.user.psid })
    const isGenerating = userConfig && userConfig.isGenerating

    if (
      (greeting && greeting.confidence > 0.8) ||
      message.includes('start over')
    ) {
      response = Response.genNuxMessage(this.user)
    }
    // else if (Number(message)) {
    //   response = Order.handlePayload('ORDER_NUMBER')
    // } else if (message.includes('#')) {
    //   response = Survey.handlePayload('CSAT_SUGGESTION')
    // } else if (message.includes(i18n.__('care.help').toLowerCase())) {
    //   let care = new Care(this.user, this.webhookEvent)
    //   response = care.handlePayload('CARE_HELP')
    // }
    else if (isEmpty(userConfig)) {
      response = [
        Response.genText('You did not configure it yet.'),
        Response.genGenericTemplate(
          `${config.appUrl}/logo.png`,
          'Click on this button to input your config',
          '',
          [
            Response.genWebUrlButton(
              'Input your config',
              `${config.appUrl}/config?userId=${this.user.psid}`
            ),
          ]
        ),
      ]
    } else if (isGenerating) {
      response = [
        Response.genText(
          'We are generating another paragraph. Please wait for the result.'
        ),
      ]
    } else {
      generateText({
        user: userConfig,
        text: this.webhookEvent.message.text,
      })
      response = [
        Response.genText('I got your idea. Please wait for the result.'),
      ]
    }

    return response
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    let response

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0]
    console.log('Received attachment:', `${attachment} for ${this.user.psid}`)

    response = Response.genQuickReply(i18n.t('fallback.attachment'), [
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
    let payload = this.webhookEvent.message.quick_reply.payload

    return this.handlePayload(payload)
  }

  // Handles postbacks events
  handlePostback() {
    let postback = this.webhookEvent.postback
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
    let payload = this.webhookEvent.referral.ref.toUpperCase()

    return this.handlePayload(payload)
  }

  handlePayload(payload: any) {
    console.log('Received Payload:', `${payload} for ${this.user.psid}`)

    let response

    // Set the response based on the payload
    if (
      payload === 'GET_STARTED' ||
      payload === 'DEVDOCS' ||
      payload === 'GITHUB'
    ) {
      response = Response.genNuxMessage(this.user)
    } else if (payload.includes('CURATION') || payload.includes('COUPON')) {
      let curation = new Curation(this.user, this.webhookEvent)
      response = curation.handlePayload(payload)
    } else if (payload.includes('CHAT-PLUGIN')) {
      response = [
        Response.genText(i18n.t('chat_plugin.prompt')),
      ]
    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`,
      }
    }

    return response
  }

  handlePrivateReply(type: any, object_id: any) {
    let response = Response.genGenericTemplate(
      `https://v2l.edu.vn/wp-content/uploads/2021/02/direction-1400x665.png`,
      i18n.t('get_started.title'),
      i18n.t('get_started.subtitle'),
      [
        Response.genWebUrlButton(i18n.t('get_started.aboutUs'), 'faty.vn'),
        Response.genPostbackButton(
          i18n.t('get_started.exploreFeature'),
          'CURATION_EXPLORE'
        ),
      ]
    )

    let requestBody = {
      recipient: {
        [type]: object_id,
      },
      message: response,
    }

    GraphApi.callSendApi(requestBody)
  }

  sendMessage(response: any, delay = 0) {
    // Check if there is delay in the response
    if ('delay' in response) {
      delay = response['delay']
      delete response['delay']
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
      let persona_id = response['persona_id']
      delete response['persona_id']

      requestBody = {
        recipient: {
          id: this.user.psid,
        },
        message: response,
        persona_id: persona_id,
      }
    }

    setTimeout(() => GraphApi.callSendApi(requestBody), delay)
  }

  firstEntity(nlp: any, name: any) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
  }
}
