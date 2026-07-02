<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7e93f697-ce40-415c-a500-083baea1f761

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Optional: set the `GEMINI_API_KEY` in [.env.local](.env.local) if you want the Ecosystem AI feature to work
3. Run the app:
   `npm run dev`

The server will automatically use an available local port starting at `3000`. If `3000` is busy, it will move to the next free port.

If your friend wants to run it locally, they only need to clone the project, run `npm install`, add their `.env.local` if they want Gemini features, and then run `npm run dev`.
