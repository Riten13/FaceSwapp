# Face Swap Pipeline — Higgsfield-style AI Content Studio

This repo contains the **face-swapping feature** for a personal project I'm building: a free, open alternative to paid AI content generation tools like Higgsfield. This piece specifically handles detecting a face, swapping it onto a target image, and restoring realistic detail — served through a simple API.

## Why this project exists

I've spent the last while going deep into how modern AI actually works — transformers, attention, where classic ML ends and DL begins, how MCP and RAG fit into agentic systems, guardrails, and so on.

I picked Higgsfield as a target because it's a paid product, and I wanted to see how far I could get building similar functionality for free. Pretty quickly I learned the actual challenge in a project like this was never the UI or the backend — it's the **models**. Image and video generation are extremely compute-heavy, and building this on a personal (non-datacenter-grade) machine made it very obvious why companies pour money into expensive Nvidia GPUs. This isn't a "weak laptop" problem — it's that image/video generation workloads are just heavy, period.

This repo covers the first working feature: **face swap**.

## How the face swap pipeline works

1. **Face detection** — [InsightFace](https://github.com/deepinsightface/insightface)'s `buffalo_l` model detects and analyzes faces in both the source and target images.
2. **Face swap** — the `inswapper_128` ONNX model (via InsightFace's model zoo) swaps the detected source face onto every face found in the target image.
3. **Face restoration** — [GFPGAN](https://github.com/TencentARC/GFPGAN) (`GFPGANv1.4`) cleans up and restores realistic detail in the swapped face, since raw swap output tends to look soft/artifacted.
4. **API layer** — a FastAPI app wraps the pipeline with three endpoints:
   - `GET /health` — health check
   - `GET /` — service status
   - `POST /swap-face` — accepts a `source` and `target` image upload, runs the pipeline, and returns the resulting image
5. **Public exposure** — since this currently runs inside a Kaggle notebook (no persistent public IP), I use a **Cloudflare Tunnel** (`cloudflared`) to expose the local FastAPI server (`127.0.0.1:8000`) at a temporary public `trycloudflare.com` URL, so the API can be called from outside the notebook while it's running.

## Why Kaggle instead of Docker

My original plan was the "proper" deployment path: containerize the pipeline with **Docker** and host it on **Hugging Face Spaces**, then have my app's backend call it as an API.

In practice, that plan ran straight into the GPU problem above. Image-generation-grade models need real GPU compute to run at usable speed, and getting free, reliable GPU access on Hugging Face (or anywhere else, without paying) is limited. Kaggle notebooks, on the other hand, give free GPU quota (T4/P100) that's actually enough to load InsightFace + GFPGAN and run inference at a reasonable speed.

So for this stage of the project, I flipped the order: prototype and validate the model pipeline on Kaggle first (where I actually have GPU access), expose it temporarily with a Cloudflare Tunnel for testing, and only move to a containerized Docker + Hugging Face (or similar) deployment once the pipeline itself is stable. Docker is still the plan for a proper persistent deployment — Kaggle is where the model work gets done for free in the meantime.

## Tech stack

- **InsightFace** (`buffalo_l`, `inswapper_128`) — face detection & swapping
- **GFPGAN** — face restoration/enhancement
- **ONNX Runtime (GPU)** — model inference
- **FastAPI + Uvicorn** — API server
- **Cloudflare Tunnel** — temporary public exposure from Kaggle
- **Kaggle Notebooks** — free GPU compute environment

## Notes / limitations

- This is a prototype stage: the API only lives as long as the Kaggle notebook session is running, and the public URL changes every time the tunnel restarts.
- Face swap technology can be misused (deepfakes). This project is for learning purposes — please use it responsibly and only on images you have the rights/consent to use.