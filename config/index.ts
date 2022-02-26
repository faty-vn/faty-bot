const ENV_VARS = [
  'PAGE_ID',
  'APP_ID',
  'PAGE_ACCESS_TOKEN',
  'APP_SECRET',
  'VERIFY_TOKEN',
  'APP_URL',
]

export default {
  apiDomain: 'https://graph.facebook.com',
  apiVersion: 'v11.0',

  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccesToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,

  appUrl: process.env.APP_URL,

  personas: {},

  port: process.env.PORT || 3000,

  get apiUrl() {
    return `${this.apiDomain}/${this.apiVersion}`
  },

  get webhookUrl() {
    return `${this.appUrl}/webhook`
  },

  get whitelistedDomains() {
    return [this.appUrl]
  },

  checkEnvVariables() {
    ENV_VARS.forEach((key) => {
      if (!process.env[key]) {
        console.warn(`WARNING: Missing the environment variable ${key}`)
      } else if (['APP_URL'].includes(key)) {
        const url = process.env[key] || ''
        if (!url.startsWith('https://')) {
          console.warn(`WARNING: Your ${key} does not begin with "https://"`)
        }
      }
    })
  },

  databaseUri: process.env.DATABASE_URI || 'mongodb://root:example@mongo:27017/faty_dev'
}
