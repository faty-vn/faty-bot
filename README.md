## Getting Started

First, create `.env.local`:
```
cp .env.example .env.local
```

Go to Facebook Developer Console to create credentials.
```
PAGE_ID=
APP_ID=
PAGE_ACCESS_TOKEN=
APP_SECRET=
VERIFY_TOKEN=YOUR_SECRET_TOKEN
```

Run ngrok and point to port 3000.

Fill environment variables.
```
...

APP_URL=NGROK_HOST
NEXT_PUBLIC_APP_URL=NGROK_HOST
PORT=3000
DATABASE_URI=MONGO_URI
```

Run developement mode:

```bash
yarn dev
```

Create and verify Facebook App Webhook.

Open `NGROK_HOST/api/profile?mode=all&verify_token=VERIFY_TOKEN` to update page profile.

