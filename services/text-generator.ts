const { sendUpdateMessage } = require('./update-message')

export const generateText = async ({ user, text = '' } : {user: any, text: string}) => {
    user.isGenerating = true
    await user.save()
    await new Promise((resolve, reject) =>
      setTimeout(() => {
        const sendText =
          'id: ' +
          user.id +
          '\n' +
          'category: ' +
          user.category +
          '\n' +
          'kind: ' +
          user.kind +
          '\n' +
          'keywords: ' +
          user.keywords +
          '\n' +
          'text: ' +
          text
        sendUpdateMessage({
          userId: user.id,
          text: sendText,
        })
        resolve('')
      }, 10 * 1000)
    )
    user.isGenerating = false
    await user.save()
  }
