# VerifyNG — investor demo

**Every product. A verifiable identity.**

VerifyNG is a proposed product authentication and traceability platform for Nigeria. Each unit a manufacturer produces gets its own signed QR code. Anyone can check it with a phone camera, with no app needed.

**Live demo:** https://joshuaogbudu-cmd.github.io/verifyng-demo/

> **Demo only.** All manufacturers, products, registration numbers (`DEMO-…`) and scans are synthetic. VerifyNG is not affiliated with or endorsed by NAFDAC; any regulatory partnership is subject to NAFDAC's approval. Data resets when the page is reloaded.

## What to try

1. **Consumer check:** tap a product label to "scan" it. You can see all seven outcomes: Verified, Suspicious, Not recognised, Registration invalid, Expired, Recalled and Unable to verify. There's also a scratch-off PIN flow.
2. **Clone attack:** scan the genuine label in Lagos, switch the city to Kano, then press **Scan last code from another phone**. The engine flags impossible travel.
3. **Manufacturer console:** create a batch, print QR label sheets, recall a batch, import a CSV, create an API key and call the API from the built-in console.
4. **Regulator console:** national heatmap, investigation cases, recalls, and an audit log that detects tampering (try **Simulate tampering**, then **Verify chain**).
5. **Real phone:** point a phone camera at any QR label on screen. It opens the verification page on that phone.

## How it works

The whole demo is one static page (`index.html`). The verification engine runs in the browser:

- Unit codes are random and signed with HMAC-SHA256 using a per-manufacturer key. Any altered or invented code fails the signature check.
- Every scan is checked against the unit record, batch, expiry, registration status and recall status, then scored by explainable risk rules: number of devices, number of cities, impossible travel, burst scans and PIN reuse.
- Records are generated from a fixed seed, so the same demo QR codes resolve the same way on any device.

In production, the same logic runs server-side: an API gateway, PostgreSQL with tenant isolation, Redis, queue workers, and KMS-held signing keys.

## Source

`src/` holds the readable source:

- `engine.js`: crypto, data model, verification engine and in-page API.
- `ui.js`: all screens.
- `head.html`: styles.

`index.html` is assembled from these files.

Team: Joshua Ogbudu (Co-founder and CEO) · Ekpetere Emmanuel Ekene (Co-founder and COO)
