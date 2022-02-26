import Response from 'services/response'
import config from 'config'
import i18n from '../i18n'

export default class Curation {
  user: any

  webhookEvent: any

  constructor(user: any, webhookEvent: any) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  handlePayload(payload: any) {
    let response

    switch (payload) {
      case 'CURATION_EXPLORE':
        const text = [
          Response.genText(i18n.t('curation.instruction.title')),
          Response.genText(i18n.t('curation.instruction.step1') + '\n' + i18n.t('curation.instruction.step1Details')),
          Response.genImageTemplate(`${config.appUrl}/instruction-step1.png`, i18n.t('curation.instruction.step1')),
          Response.genText(i18n.t('curation.instruction.step2') + '\n' + i18n.t('curation.instruction.step2Details')),
        ]

        const quickReply = Response.genQuickReply(i18n.t('curation.instruction.whatNext'), [
          {
            title: i18n.t('curation.instruction.gotIt'),
            payload: 'CURATION_GOT_IT',
          },
          {
            title: i18n.t('curation.instruction.example'),
            payload: 'CURATION_EXAMPLE',
          },
        ])
        response = [...text, quickReply]
        break

      case 'CURATION_GOT_IT':
        console.log({ user: this.user })
        response = Response.genGenericTemplate(
          `${config.appUrl}/logo.png`,
          i18n.t('curation.clickToConfig'),
          '',
          [
            Response.genWebUrlButton(
              i18n.t('curation.inputYourConfig'),
              `${config.appUrl}/configuration?userId=${this.user.psid}`
            ),
          ]
        )
        break
    }

    return response
  }
}

