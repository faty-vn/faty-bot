/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/api/webhook/messenger/close_window',
        destination: `https://www.messenger.com/closeWindow/?image_url=${process.env.APP_URL}/logo.png&display_text=goodbye`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
