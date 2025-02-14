import config from 'config'
import i18n from '../i18n'

export default class Response {
  static genQuickReply(text: string, quickReplies: { title: string; payload: string }[]) {
    const response: { text: string; quick_replies: any } = {
      text,
      quick_replies: [],
    }

    for (const quickReply of quickReplies) {
      response.quick_replies.push({
        content_type: 'text',
        title: quickReply.title,
        payload: quickReply.payload,
      })
    }

    return response
  }

  static genGenericTemplate(imageUrl: string, title: string, subtitle = '', buttons: any[] = []) {
    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title,
              subtitle,
              image_url: imageUrl,
              buttons,
            },
          ],
        },
      },
    }

    return response
  }

  static genImageTemplate(imageUrl: string, title: string, subtitle = '') {
    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title,
              subtitle,
              image_url: imageUrl,
            },
          ],
        },
      },
    }

    return response
  }

  static genButtonTemplate(title: string, buttons: any[]) {
    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: title,
          buttons,
        },
      },
    }

    return response
  }

  static genText(text: string) {
    const response = {
      text,
    }

    return response
  }

  static genTextWithPersona(text: string, personaId: string) {
    const response = {
      text,
      persona_id: personaId,
    }

    return response
  }

  static genPostbackButton(title: string, payload: any) {
    const response = {
      type: 'postback',
      title,
      payload,
    }

    return response
  }

  static genWebUrlButton(title: string, url: string) {
    const response = {
      type: 'web_url',
      title,
      url,
      messenger_extensions: true,
    }

    return response
  }

  static genNuxMessage(user: any) {
    const welcome = this.genText(
      i18n.t('get_started.welcome', {
        user,
      })
    )

    const guide = this.genText(i18n.t('get_started.guidance'))

    const curation = this.genGenericTemplate(
      `${config.appUrl}/logo.png`,
      i18n.t('get_started.title'),
      i18n.t('get_started.subtitle'),
      [
        this.genWebUrlButton(i18n.t('get_started.aboutUs'), `${config.appUrl}/about`),
        this.genPostbackButton(i18n.t('get_started.exploreFeature'), 'CURATION_EXPLORE'),
      ]
    )
    return [welcome, guide, curation]
  }
}
