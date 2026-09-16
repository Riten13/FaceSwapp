# Face Swap Web Studio (Frontend)

A sleek, responsive, single-page web interface for AI-powered Face Swapping. Built with **React 19** and **Vite**, this application connects to your **InsightFace + GFPGAN** pipeline running in Kaggle via **Cloudflare Tunnel**.

---

## Features

- **Split-View Comparison Slider**: Interactively slide between the original target photo and the swapped output.
- **Side-by-Side & Result Views**: Inspect results with multiple view modes.
- **Instant Role Swap**: Swap source and target roles with a single click.
- **Real-Time API Health Monitor**: Dynamic badge in the header indicating Kaggle API status (🟢 Connected, 🟡 Not Configured, 🔴 Offline, 🔵 Connecting).
- **Zero-CORS Vite Proxy**: Automatically proxies requests in development mode to bypass browser CORS restrictions.
- **InsightFace Error Parsing**: Clear, descriptive error messages for model conditions (e.g., *"No face detected in source image"*).
- **Memory Optimized**: Automatic object URL revocation prevents memory leaks during high-resolution processing.

---

## Quick Start

### 1. Install Dependencies

From the `frontend` folder:

```bash
cd frontend
npm install
```

### 2. Configure the Backend URL (`.env`)

Create or edit your `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=https://your-tunnel-subdomain.trycloudflare.com
```

> **Note:** The application automatically cleans and normalizes your URL. You can paste:
> - Root URL: `https://your-subdomain.trycloudflare.com`
> - With trailing slash: `https://your-subdomain.trycloudflare.com/`
> - Full endpoint: `https://your-subdomain.trycloudflare.com/swap-face`

A template is also available in [`.env.example`](.env.example).

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## Kaggle Notebook Integration Guide

This frontend connects to the pipeline defined in [`faceswapp-pipeline.ipynb`](../faceswapp-pipeline.ipynb).

### 1. Start Kaggle Notebook with GPU
- Make sure GPU acceleration is turned on in your Kaggle notebook settings (e.g., **GPU T4 x2** or **P100**).

### 2. Ensure CORS is Enabled in Cell 9
In **Cell 9** of `faceswapp-pipeline.ipynb`, ensure `CORSMiddleware` is added:

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Face Swap API",
    description="InsightFace + GFPGAN Face Swap API",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Run Cell 15 to Generate Cloudflare Tunnel URL
When Cell 15 runs, it outputs:

```text
============================================
🚀 PUBLIC FACE SWAP API
============================================

API:
https://diana-subscribers-mapping-ballet.trycloudflare.com

Health:
https://diana-subscribers-mapping-ballet.trycloudflare.com/health

Swagger:
https://diana-subscribers-mapping-ballet.trycloudflare.com/docs
```

### 4. Copy & Paste into Frontend `.env`
Copy the `API` URL and set it in `frontend/.env`:

```bash
VITE_API_URL=https://diana-subscribers-mapping-ballet.trycloudflare.com
```

Save the file. Vite automatically detects changes to `.env` and updates the proxy target.

---

## Project Structure

```text
frontend/
├── .env                  # Active environment variables (git-ignored)
├── .env.example          # Template environment file
├── index.html            # HTML entry point
├── package.json          # Project scripts and dependencies
├── vite.config.js        # Vite configuration with dynamic dev proxy
└── src/
    ├── main.jsx          # React DOM root render
    ├── App.jsx           # Main orchestrator component & state management
    ├── App.css           # Styling system & dark mode theme tokens
    ├── api.js            # API client: URL normalizer, health check, multipart upload
    └── components/
        ├── Header.jsx             # Top bar with branding & API status badge
        ├── Hero.jsx               # Headline and description
        ├── UploadCard.jsx         # Drag-and-drop file upload zones
        ├── SwapRolesButton.jsx    # Quick swap button
        ├── ActionBar.jsx          # Execute button & validation tips
        ├── ProcessingProgress.jsx # Animated progress bar with step messages
        └── ResultShowcase.jsx     # Split-slider comparison and download
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run lint` | Runs `oxlint` to check for syntax and React best practices |
| `npm run preview` | Locally previews the production build |

---

## Troubleshooting

### 1. Header shows 🔴 "API Offline"
- Check that your Kaggle notebook session is active and has not timed out or disconnected.
- If Kaggle restarted, run Cell 15 again to get a new Cloudflare URL, paste it into `.env`, and click the status pill in the header to re-check.

### 2. "No face detected in source / target image"
- InsightFace requires a clearly visible, unobstructed face.
- Ensure the photo has good lighting, reasonable resolution, and faces towards the camera.

### 3. Changes to `.env` not reflecting
- Stop the dev server (`Ctrl + C`) and restart it (`npm run dev`).
