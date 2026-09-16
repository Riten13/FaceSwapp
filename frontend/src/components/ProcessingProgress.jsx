export default function ProcessingProgress({ progress, statusText }) {
  return (
    <div className="processing-box">
      <p className="processing-text">{statusText || 'Processing face alignment and blending...'}</p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}
