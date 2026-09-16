export default function Header({
  hasImages,
  onClearAll,
  apiStatus,
  onCheckHealth,
}) {
  const getStatusBadge = () => {
    if (!apiStatus) return null

    let dotClass = 'api-dot'
    let label = 'Checking API...'

    if (apiStatus.state === 'connected') {
      dotClass += ' connected'
      label = 'Kaggle API Connected'
    } else if (apiStatus.state === 'unconfigured') {
      dotClass += ' unconfigured'
      label = 'API Not Configured'
    } else if (apiStatus.state === 'error') {
      dotClass += ' error'
      label = 'API Offline'
    } else if (apiStatus.state === 'checking') {
      dotClass += ' checking'
      label = 'Connecting...'
    }

    const hostName = apiStatus.url
      ? apiStatus.url.replace(/^https?:\/\//, '').split('/')[0]
      : null

    return (
      <button
        type="button"
        className="api-status-pill"
        onClick={onCheckHealth}
        title={
          apiStatus.message
            ? `${apiStatus.message}. Click to test connection.`
            : 'Click to test API connection'
        }
        aria-label={`API Status: ${label}. Click to recheck.`}
      >
        <span className={dotClass} />
        <span className="api-status-label">{label}</span>
        {hostName && (
          <span className="api-status-host" title={apiStatus.url}>
            {hostName.length > 25 ? `${hostName.slice(0, 22)}...` : hostName}
          </span>
        )}
      </button>
    )
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5" />
              <path d="M8 21H3v-5" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>Face Swap</h1>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <div className="header-actions">
        {hasImages && (
          <button type="button" className="btn-small danger" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>
    </header>
  )
}

