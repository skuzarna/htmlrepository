# MTC ServiceTrack Prototype

This repository contains the **MTC ServiceTrack** front-end prototype for a glassmorphic customer support and ticket management system.

## Quick Start

Serve the static site from the `mtc-servicetrack` directory:

```bash
cd mtc-servicetrack
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/index.html` in your browser.

## Run Verification (must run)

In a second terminal, verify all required pages/assets return HTTP 200:

```bash
cd mtc-servicetrack
for p in index.html submit.html track.html agent.html supervisor.html css/style.css js/app.js; do \
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8000/$p"); \
  echo "$p $code"; \
done
```

Optional JavaScript syntax check:

```bash
cd mtc-servicetrack
node --check js/app.js
```
