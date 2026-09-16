import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import UploadCard from './components/UploadCard'
import SwapRolesButton from './components/SwapRolesButton'
import ActionBar from './components/ActionBar'
import ProcessingProgress from './components/ProcessingProgress'
import ResultShowcase from './components/ResultShowcase'
import {
  executeFaceSwap,
  checkApiHealth,
  isApiConfigured,
  getApiBaseUrl,
} from './api'
import './App.css'

export default function App() {
  const [targetImage, setTargetImage] = useState(null)
  const [sourceImage, setSourceImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [resultImage, setResultImage] = useState(null)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState({
    state: isApiConfigured() ? 'checking' : 'unconfigured',
    message: isApiConfigured()
      ? 'Checking Kaggle API connection...'
      : 'VITE_API_URL is not configured in .env',
    url: getApiBaseUrl(),
  })

  // Cleanup object URLs to avoid memory leaks
  const cleanupResultUrl = useCallback(() => {
    if (resultImage) {
      URL.revokeObjectURL(resultImage)
    }
  }, [resultImage])

  // Connection health check
  const handleCheckHealth = useCallback(async () => {
    const configured = isApiConfigured()
    const baseUrl = getApiBaseUrl()

    if (!configured) {
      setApiStatus({
        state: 'unconfigured',
        message: 'Kaggle Cloudflare URL is not set in frontend/.env',
        url: '',
      })
      return
    }

    setApiStatus((prev) => ({
      ...prev,
      state: 'checking',
      message: 'Checking connection to Kaggle pipeline...',
      url: baseUrl,
    }))

    const health = await checkApiHealth()
    setApiStatus({
      state: health.ok ? 'connected' : 'error',
      message: health.ok
        ? `Connected to Face Swap API (${health.status})`
        : health.message,
      url: baseUrl,
    })
  }, [])

  useEffect(() => {
    if (isApiConfigured()) {
      let isMounted = true
      checkApiHealth().then((health) => {
        if (!isMounted) return
        setApiStatus({
          state: health.ok ? 'connected' : 'error',
          message: health.ok
            ? `Connected to Face Swap API (${health.status})`
            : health.message,
          url: getApiBaseUrl(),
        })
      })
      return () => {
        isMounted = false
      }
    }
  }, [])

  const handleFileSelect = (file, type) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WEBP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = {
        file: file,
        url: e.target.result,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      }
      if (type === 'target') {
        setTargetImage(data)
      } else {
        setSourceImage(data)
      }
      cleanupResultUrl()
      setResultImage(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = (type) => {
    if (type === 'target') {
      setTargetImage(null)
    } else {
      setSourceImage(null)
    }
    cleanupResultUrl()
    setResultImage(null)
    setError(null)
  }

  const handleSwapRoles = () => {
    if (!targetImage && !sourceImage) return
    const temp = targetImage
    setTargetImage(sourceImage)
    setSourceImage(temp)
    cleanupResultUrl()
    setResultImage(null)
    setError(null)
  }

  const handleClearAll = () => {
    cleanupResultUrl()
    setTargetImage(null)
    setSourceImage(null)
    setResultImage(null)
    setProgress(0)
    setStatusText('')
    setError(null)
  }

  const handleExecuteSwap = async () => {
    if (!targetImage?.file || !sourceImage?.file) return

    if (!isApiConfigured()) {
      setError(
        'Kaggle API URL is not configured. Open frontend/.env, paste your Cloudflare URL from Kaggle Cell 15 into VITE_API_URL, and restart Vite.'
      )
      return
    }

    setIsProcessing(true)
    setProgress(15)
    setError(null)
    setStatusText('Uploading images and initializing InsightFace models...')

    let currentProgress = 15
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 6, 92)
      setProgress(currentProgress)
      if (currentProgress > 30 && currentProgress <= 65) {
        setStatusText('Detecting faces and executing face swap...')
      } else if (currentProgress > 65) {
        setStatusText('Restoring quality and enhancing details with GFPGAN...')
      }
    }, 700)

    try {
      const blob = await executeFaceSwap(sourceImage.file, targetImage.file)

      clearInterval(progressInterval)
      setProgress(98)
      setStatusText('Finalizing high-resolution result...')

      cleanupResultUrl()
      const objectUrl = URL.createObjectURL(blob)
      setProgress(100)
      setResultImage(objectUrl)
      setApiStatus((prev) => ({
        ...prev,
        state: 'connected',
        message: 'Kaggle Face Swap API Connected',
      }))
    } catch (err) {
      console.error('Face swap execution error:', err)
      setError(err.message || 'Face swap failed. Please check your Kaggle API URL.')
      if (err.message && err.message.includes('Failed to connect')) {
        setApiStatus((prev) => ({
          ...prev,
          state: 'error',
          message: 'Unable to reach Kaggle pipeline',
        }))
      }
    } finally {
      clearInterval(progressInterval)
      setIsProcessing(false)
    }
  }

  const isReady = Boolean(targetImage && sourceImage)
  const hasImages = Boolean(targetImage || sourceImage)

  return (
    <>
      <Header
        hasImages={hasImages}
        onClearAll={handleClearAll}
        apiStatus={apiStatus}
        onCheckHealth={handleCheckHealth}
      />

      <main>
        <Hero />

        {apiStatus.state === 'unconfigured' && (
          <div className="env-guide-banner">
            <div className="env-guide-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="env-guide-text">
              <strong>Kaggle Cloudflare API URL needed:</strong>
              <span>
                {' '}
                Run Cell 15 in <code>faceswapp-pipeline.ipynb</code> on Kaggle, copy the generated <code>trycloudflare.com</code> URL, and paste it into <code>frontend/.env</code> as <code>VITE_API_URL=https://...trycloudflare.com</code>.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <div className="error-banner-content">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="error-banner-btn"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="tool-grid">
          <UploadCard
            type="target"
            title="Target Image"
            caption="Base photo"
            emptyTitle="Select target image"
            emptyHint="Drag file here or click to browse"
            image={targetImage}
            onFileSelect={handleFileSelect}
            onRemove={handleRemove}
          />

          <SwapRolesButton onSwap={handleSwapRoles} />

          <UploadCard
            type="source"
            title="Source Face"
            caption="Face to extract"
            emptyTitle="Select source face"
            emptyHint="Drag file here or click to browse"
            image={sourceImage}
            onFileSelect={handleFileSelect}
            onRemove={handleRemove}
          />
        </div>

        <ActionBar
          isReady={isReady}
          isProcessing={isProcessing}
          onGenerate={handleExecuteSwap}
        />

        {isProcessing && (
          <ProcessingProgress progress={progress} statusText={statusText} />
        )}

        {resultImage && !isProcessing && (
          <ResultShowcase
            targetImageUrl={targetImage?.url}
            resultImageUrl={resultImage}
            onClear={handleClearAll}
          />
        )}
      </main>
    </>
  )
}

