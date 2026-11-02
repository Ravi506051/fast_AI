# Nova AI — Gemini Chatbot

A responsive conversational interface that connects to Google's Gemini API through a server-side function. The project documentation describes a Vercel deployment workflow.

## Application flow
1. The user submits a message through the web interface.
2. The frontend sends the request to the serverless API endpoint.
3. The server-side function calls the configured Gemini model.
4. The response is returned to the interface for display.

## Technology
JavaScript · Gemini API · Vercel Serverless Functions

## Local preview
Install the Vercel CLI and use the project configuration:
```bash
npm install -g vercel
vercel dev
```
Set `GEMINI_API_KEY` in a local environment file for development. Never commit real API keys.

## Deployment
Import the repository into Vercel, configure `GEMINI_API_KEY` in project environment variables and deploy. Review `api/chat.js` for the model configured by the current implementation.

## Security and reliability
Keep credentials exclusively on the server side. Validate request size, handle provider errors and rate limits, and protect public endpoints against quota abuse.

## Future improvements
Add streaming responses, conversation history, configurable model settings and tests for invalid input and provider failures.

## Maintainer
**Ravi Kumar Rao** · [GitHub](https://github.com/Ravi506051)
