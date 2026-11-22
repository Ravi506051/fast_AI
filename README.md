# Nova AI — Gemini Chatbot

A browser-based chat interface backed by a server-side Gemini API endpoint, intended for Vercel deployment.

## Request flow

~~~text
Browser UI (app.js) → /api/chat → Gemini API → response in chat
~~~

The frontend is in index.html, style.css, and app.js; the serverless endpoint is api/chat.js. Keep the API key in the server environment, never in browser JavaScript or Git.

## Local development

Install the Vercel CLI and set GEMINI_API_KEY in your local environment:

~~~bash
npm install -g vercel
vercel dev
~~~

## Deploy on Vercel

Import the repository as a Vercel project, add GEMINI_API_KEY to its environment variables, and deploy. Check api/chat.js for the model and request format.

## Operations

Validate requests and handle provider errors and quota limits in the API route. Apply suitable request limits before exposing the endpoint publicly.

## Maintainer

Ravi Kumar Rao · [GitHub](https://github.com/Ravi506051)
