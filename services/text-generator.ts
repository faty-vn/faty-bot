import config from 'config'
import i18n from 'i18n'
import { get } from 'lodash'
import fetch from 'node-fetch'
import { sendUpdateMessage } from './update-message'

export const generateText = async ({ user, text = '' }: { user: any; text: string }) => {
  user.isGenerating = true
  await user.save()

  let generatedText: any

  if (config.aiUrl) {
    try {
      const response = await fetch(config.aiUrl, {
        method: 'POST',
        body: JSON.stringify({
          text,
          keywords: [...user.keywords, user.category, user.kind],
        }),
      })

      generatedText = get(await response.json(), 'text', '')
    } catch (err) {
      console.log(err)
      generatedText = i18n.t('ai.unavailable')
    }
  } else {
    /* eslint no-promise-executor-return: "off" */
    generatedText = await new Promise((resolve, _reject) =>
      setTimeout(() => {
        resolve(i18n.t('ai.unavailable'))
      }, 10 * 1000)
    )
  }

  sendUpdateMessage({
    userId: user.id,
    text: generatedText,
  })

  user.isGenerating = false
  await user.save()
}
