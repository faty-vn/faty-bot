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
          Response.genText(i18n.t('curation.instruction.step1')),
          Response.genImageTemplate(`${config.appUrl}/instruction-step1.png`, 'Instruction 1'),
          Response.genText(i18n.t('curation.instruction.step2')),
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
          'Click on this button to input your config',
          '',
          [
            Response.genWebUrlButton(
              'Input your config',
              `${config.appUrl}/config?userId=${this.user.psid}`
            ),
          ]
        )
        break
    }

    return response
  }
}

