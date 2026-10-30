# Nova AI — Gemini Chatbot

A responsive, ChatGPT-inspired chatbot UI powered by Google's Gemini API and deployable to Vercel.

## Deploy with GitHub + Vercel

1. Extract this ZIP.
2. Create a **new public or private GitHub repository**: https://github.com/new
3. Upload the **contents of this extracted folder** (not the ZIP itself) and commit the files.
4. Open https://vercel.com/new and import that GitHub repository.
5. In Vercel, open **Project → Settings → Environment Variables**.
6. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your newly generated Gemini API key
   - **Environment:** Production, Preview, and Development (or at least the ones you need)
7. Save, then open **Deployments** and redeploy if the first deployment happened before you added the variable.

No build command is required for this static frontend + Vercel serverless function project. The API endpoint is `api/chat.js`.

## Local preview (optional)

Requires Node.js and Vercel CLI:
```bash
npm install -g vercel
vercel dev
```
Create a local `.env` file with `GEMINI_API_KEY=your_key_here` for local testing. Never commit `.env`.

## Notes

- The Gemini key is used only by the serverless API function, not shipped to the browser.
- The selected model is `gemini-2.5-flash` in `api/chat.js`. If that model is unavailable to your project, change `MODEL` to a model currently available in your Google AI Studio project.
- API usage may be subject to Google quotas and billing settings.

## Configuration and Security Checklist

- Store the Gemini API key only in a local environment file or the deployment platform's secret manager.
- Confirm that the API request is handled by the server-side function and that the key is never returned to the browser.
- Test missing-key, invalid-key, rate-limit, and provider-error cases.
- Review provider quotas and usage limits before making the application publicly accessible.

Never commit a real API key, access token, or private deployment secret.

## Project Development Notes

Record the source and timestamp of retrieved baseball data, and validate agent outputs against the source dataset before drawing conclusions.

For reproducibility, record source versions, environment and dependency versions, configuration, and actual test outputs. Clearly label sample data and illustrative results; never commit secrets or private data.

### Technical Deep Dive

The documented deployment uses a static frontend with a Vercel serverless endpoint at `api/chat.js`. The browser should call that endpoint rather than calling Gemini directly, so `GEMINI_API_KEY` remains server-side. Validate incoming message shape and length, constrain provider response handling, and return consistent error codes for missing keys, quota limits, and upstream failures.

Suggested engineering checks: test the function locally with `vercel dev`, confirm the key is absent from built browser assets and network responses, and add rate limiting or abuse controls before exposing the endpoint publicly.
