# Slack App – Local Development Guide

This guide explains how to run the Slack App locally using Node.js, ngrok, and a local .env file.
Future updates may change this flow once we deploy to a permanent server.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the project root:

```bash
SLACK_BOT_TOKEN=your-token-here
SLACK_SIGNING_SECRET=your-secret-here
PORT=8000
```

You can find `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` in your Slack App configuration page.

Slack App config page: [Slack App Dashboard](https://api.slack.com/apps)

If you prefer, you can also DM Nora and she can provide these values.

## Start the Slack App Server

```bash
npm start
```

The server runs on:

```bash
http://localhost:8000
```

### Expose the Server with ngrok

Slack requires a public URL during development.

```bash
ngrok http 8000
```

ngrok will generate a temporary URL such as:

```bash
https://random-string.ngrok.io
```

## Update Slack App Configuration

Take the generated ngrok URL and update the following sections in your Slack App config:

```bash
https://<ngrok-url>/slack/events
```

Required updates:

- Interactivity & Shortcuts
- Slash Commands

ngrok URLs change every time you restart it—remember to update both places each time.

## Future Note

Once the app is deployed, the endpoint will become a fixed URL, and ngrok will no longer be necessary.
