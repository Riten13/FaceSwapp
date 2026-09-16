import { useState, useRef, useEffect } from 'react'

export default function ResultShowcase({
  targetImageUrl,
  resultImageUrl,
  onClear
}) {
  const [viewMode, setViewMode] = useState('slider')
  const [sliderPos, setSliderPos] = useState(50)
  const isDraggingSliderRef = useRef(false)
  const sliderContainerRef = useRef(null)

  const updateSliderPosition = (clientX) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const offsetX = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100))
    setSliderPos(percent)
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingSliderRef.current) return
      updateSliderPosition(e.clientX)
    }

    const onMouseUp = () => {
      isDraggingSliderRef.current = false
    }

    const onTouchMove = (e) => {
      if (!isDraggingSliderRef.current || !e.touches[0]) return
      updateSliderPosition(e.touches[0].clientX)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [])

  const handleDownload = () => {
    if (!resultImageUrl) return
    const a = document.createElement('a')
    a.href = resultImageUrl
    a.download = 'face_swap_output.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="result-container">
      <div className="result-top">
        <h3 className="result-title">Output Preview</h3>

        <div className="view-tabs">
          <button
            type="button"
            className={`tab-button ${viewMode === 'slider' ? 'active' : ''}`}
            onClick={() => setViewMode('slider')}
          >
            Split Comparison
          </button>
          <button
            type="button"
            className={`tab-button ${viewMode === 'side' ? 'active' : ''}`}
            onClick={() => setViewMode('side')}
          >
            Side by Side
          </button>
          <button
            type="button"
            className={`tab-button ${viewMode === 'result' ? 'active' : ''}`}
            onClick={() => setViewMode('result')}
          >
            Result View
          </button>
        </div>
      </div>

      <div className="result-viewport">
        {viewMode === 'slider' && (
          <div
            ref={sliderContainerRef}
            className="split-slider"
            onMouseDown={(e) => {
              isDraggingSliderRef.current = true
              updateSliderPosition(e.clientX)
            }}
            onTouchStart={(e) => {
              isDraggingSliderRef.current = true
              if (e.touches[0]) updateSliderPosition(e.touches[0].clientX)
            }}
          >
            <span className="image-tag tag-left">Target Image</span>
            <span className="image-tag tag-right">Swapped Output</span>

            <div className="split-before" style={{ width: `${sliderPos}%` }}>
              <img src={targetImageUrl} alt="Target Image" />
            </div>

            <div className="split-after">
              <img src={resultImageUrl} alt="Swapped Output" />
            </div>

            <div className="split-divider" style={{ left: `${sliderPos}%` }}>
              <div className="split-handle">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'side' && (
          <div className="side-grid">
            <div className="side-cell">
              <span className="image-tag tag-left">Target</span>
              <img src={targetImageUrl} alt="Target" />
            </div>
            <div className="side-cell">
              <span className="image-tag tag-right">Output</span>
              <img src={resultImageUrl} alt="Output" />
            </div>
          </div>
        )}

        {viewMode === 'result' && (
          <div className="single-view">
            <img src={resultImageUrl} alt="Output" />
          </div>
        )}
      </div>

      <div className="result-actions">
        <button type="button" className="btn-primary" onClick={handleDownload}>
          Download Image
        </button>
        <button type="button" className="btn-secondary" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  )
}
