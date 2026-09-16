export default function ActionBar({ isReady, isProcessing, onGenerate }) {
  return (
    <div className="action-bar">
      <button
        type="button"
        className="btn-primary"
        disabled={!isReady || isProcessing}
        onClick={onGenerate}
      >
        {isProcessing ? (
          <>
            <div className="spinner-inline"></div>
            Processing...
          </>
        ) : (
          'Generate Face Swap'
        )}
      </button>

      {!isReady && (
        <span className="action-note">
          Upload both a target image and a source face to begin.
        </span>
      )}
    </div>
  )
}
