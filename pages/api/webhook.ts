import config from 'config'
import Receive  from 'services/receive'
import GraphApi  from 'services/graph-api'
import User  from 'services/user'

import i18n from 'i18n'

import type { NextApiRequest, NextApiResponse } from 'next'

const users: any = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token) {
      if (mode === 'subscribe' && token === config.verifyToken) {
        res.status(200).send(challenge)
      } else {
        res.status(403).send('')
      }
    }
  } else if (req.method === 'POST') {
    const { body } = req

    console.log(`\u{1F7EA} Received webhook:`)
    console.dir(body, { depth: null })
    if (body.object === 'page') {
      res.status(200).send('EVENT_RECEIVED')

      body.entry.forEach(async (entry: any) => {
        if ('changes' in entry) {
          const receiveMessage = new Receive()
          if (entry.changes[0].field === 'feed') {
            const change = entry.changes[0].value
            switch (change.item) {
              case 'post':
                return receiveMessage.handlePrivateReply('post_id', change.post_id)
              case 'comment':
                return receiveMessage.handlePrivateReply('comment_id', change.comment_id)
              default:
                console.warn('Unsupported feed change type.')
                return
            }
          }
        }

        entry.messaging.forEach(async (webhookEvent: any) => {
          if ('read' in webhookEvent) {
            console.log('Got a read event')
            return
          }
          if ('delivery' in webhookEvent) {
            console.log('Got a delivery event')
            return
          }
          if (webhookEvent.message && webhookEvent.message.is_echo) {
            console.log(`Got an echo of our send, mid = ${webhookEvent.message.mid}`)
            return
          }

          const senderPsid = webhookEvent.sender.id

          if (!(senderPsid in users)) {
            const user = new User(senderPsid)
            const userProfile = await GraphApi.getUserProfile(senderPsid)
            if (userProfile) {
              user.setProfile(userProfile)
              users[senderPsid] = user
              console.log(`Created new user profile:`)
              console.log({ user })
            }
          }
          i18n.changeLanguage(users[senderPsid].locale)
          const receiveMessage = new Receive(users[senderPsid], webhookEvent)
          return await receiveMessage.handleMessage()
        })
      })
    } else {
      res.status(404)
    }
  }
}
