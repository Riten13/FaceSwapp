/**
 * Face Swap API Client
 * Interfaces with the Kaggle InsightFace + GFPGAN Face Swap pipeline
 * running behind Cloudflare Tunnel (or local dev proxy).
 */

/**
 * Returns the sanitized base URL configured in environment variables (.env).
 * Strips any trailing slash or redundant /swap-face endpoint suffix.
 */
export function getApiBaseUrl() {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_FACESWAP_API_URL ||
    ''
  ).trim()

  if (!envUrl) return ''
  return envUrl.replace(/\/+$/, '').replace(/\/swap-face$/, '')
}

/**
 * Check whether an API URL has been configured.
 */
export function isApiConfigured() {
  const base = getApiBaseUrl()
  return Boolean(base && base.startsWith('http'))
}

/**
 * Resolves full endpoint URL for a given path.
 * In development, routes through Vite's '/api' proxy to automatically prevent CORS errors.
 * In production or direct mode, uses the full Cloudflare URL.
 */
export function getEndpointUrl(path, forceDirect = false) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = getApiBaseUrl()

  // Use Vite proxy during development to bypass browser CORS if not forced direct
  if (import.meta.env.DEV && !forceDirect) {
    return `/api${normalizedPath}`
  }

  if (baseUrl) {
    return `${baseUrl}${normalizedPath}`
  }

  return normalizedPath
}

/**
 * Tests the connection to the Face Swap API (/health endpoint).
 */
export async function checkApiHealth() {
  const configured = isApiConfigured()
  if (!configured && !import.meta.env.DEV) {
    return { ok: false, message: 'API URL is not configured in .env' }
  }

  const endpoint = getEndpointUrl('/health')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        ok: true,
        status: data.status || 'healthy',
        message: 'Connected to Face Swap API',
      }
    }

    return {
      ok: false,
      status: response.status,
      message: `API returned status ${response.status}`,
    }
  } catch (err) {
    const isAbort = err.name === 'AbortError'
    return {
      ok: false,
      message: isAbort
        ? 'Connection timed out. Kaggle instance may be cold or sleeping.'
        : 'Cannot reach API. Verify Kaggle notebook and Cloudflare tunnel are active.',
    }
  }
}

/**
 * Executes the face swap by uploading the source face and target image.
 *
 * @param {File} sourceFile - Image containing the face to extract
 * @param {File} targetFile - Base image to swap the face onto
 * @returns {Promise<Blob>} The resulting swapped JPEG image blob
 */
export async function executeFaceSwap(sourceFile, targetFile) {
  if (!sourceFile || !targetFile) {
    throw new Error('Both target image and source face are required.')
  }

  const endpoint = getEndpointUrl('/swap-face')
  const formData = new FormData()

  // The Kaggle notebook FastAPI endpoint expects:
  // source: UploadFile = File(...)
  // target: UploadFile = File(...)
  formData.append('source', sourceFile)
  formData.append('target', targetFile)

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })
  } catch (netErr) {
    console.error('Face swap network error:', netErr)
    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
      throw new Error(
        'VITE_API_URL is not set in frontend/.env. Please paste your Kaggle Cloudflare URL and restart Vite.'
      )
    }
    throw new Error(
      `Failed to connect to Face Swap API at ${baseUrl}. Ensure your Kaggle notebook Cell 15 is running and the tunnel is live.`
    )
  }

  if (!response.ok) {
    let errorDetail = `Model server returned error (${response.status})`
    try {
      const errJson = await response.json()
      // Kaggle endpoint returns: {"error": str(e)} or standard FastAPI {"detail": ...}
      if (errJson.error) {
        errorDetail = errJson.error
      } else if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string'
          ? errJson.detail
          : JSON.stringify(errJson.detail)
      } else if (errJson.message) {
        errorDetail = errJson.message
      }
    } catch {
      const text = await response.text().catch(() => '')
      if (text) errorDetail = text
    }

    // Friendly phrasing for known InsightFace / GFPGAN errors
    if (errorDetail.includes('No face detected in source image')) {
      throw new Error('No face was detected in the Source Face image. Please choose a clearer, front-facing portrait.')
    }
    if (errorDetail.includes('No face detected in target image')) {
      throw new Error('No face was detected in the Target image. Please choose a photo with a clearly visible face.')
    }

    throw new Error(errorDetail)
  }

  const blob = await response.blob()
  if (!blob || blob.size === 0) {
    throw new Error('Received empty response from the Face Swap server.')
  }

  return blob
}
