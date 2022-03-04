import config from 'config'
import type { NextApiRequest, NextApiResponse } from 'next'
import GraphApi from 'services/graph-api'
import ProfileService from 'services/profile'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.query.verify_token
  const { mode } = req.query

  if (!config.webhookUrl.startsWith('https://')) {
    res.status(200).send('ERROR - Need a proper API_URL in the .env file')
  }

  const Profile = new ProfileService()

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    if (token === config.verifyToken) {
      if (mode === 'webhook' || mode === 'all') {
        Profile.setWebhook()
        res.write(`<p>&#9989; Set app ${config.appId} call to ${config.webhookUrl}</p>`)
      }
      if (mode === 'profile' || mode === 'all') {
        Profile.setThread()
        res.write(`<p>&#9989; Set Messenger Profile of Page ${config.pageId}</p>`)
      }
      if (mode === 'nlp' || mode === 'all') {
        GraphApi.callNLPConfigsAPI()
        res.write(`<p>&#9989; Enabled Built-in NLP for Page ${config.pageId}</p>`)
      }
      if (mode === 'domains' || mode === 'all') {
        Profile.setWhitelistedDomains()
        res.write(`<p>&#9989; Whitelisted domains: ${config.whitelistedDomains}</p>`)
      }
      if (mode === 'private-reply') {
        Profile.setPageFeedWebhook()
        res.write(`<p>&#9989; Set Page Feed Webhook for Private Replies.</p>`)
      }
      res.status(200).end()
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.status(403)
    }
  } else {
    // Returns a '404 Not Found' if mode or token are missing
    res.status(404)
  }
}

