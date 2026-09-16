import { useState, useRef } from 'react'

export default function UploadCard({
  title,
  caption,
  type,
  image,
  onFileSelect,
  onRemove,
  emptyTitle,
  emptyHint
}) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0], type)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0], type)
    }
  }

  return (
    <div className="upload-card">
      <div className="card-top">
        <span className="card-title">{title}</span>
        <span className="card-caption">{caption}</span>
      </div>

      <div
        className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="file-input-hidden"
          style={{ display: image ? 'none' : 'block' }}
          onChange={handleInputChange}
        />

        {image ? (
          <div className="preview-container">
            <div className="preview-image-wrapper">
              <img src={image.url} alt={title} className="preview-image" />
            </div>
            <div className="preview-bar">
              <div className="preview-meta">
                <span className="preview-filename">{image.name}</span>
                <span className="preview-filesize">{image.size}</span>
              </div>
              <div className="preview-actions">
                <button
                  type="button"
                  className="btn-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="btn-small danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(type)
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dropzone-empty">
            <div className="dropzone-icon">
              {type === 'target' ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <span className="dropzone-title">{emptyTitle}</span>
            <span className="dropzone-hint">{emptyHint}</span>
          </div>
        )}
      </div>
    </div>
  )
}
