import config from 'config'
import fetch from 'node-fetch'

export const sendUpdateMessage = async ({ userId, text } : { userId: string, text: string }) => {
    const message = {
      messaging_type: 'UPDATE',
      recipient: {
        id: userId,
      },
      message: {
        text,
      },
    }

    const url = `${config.apiUrl}/me/messages?access_token=${config.pageAccesToken}`

    try {
      console.log(url)
      console.log(message)
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      })
      console.log(response)
    } catch (err) {
      console.error(err)
    }
  }
