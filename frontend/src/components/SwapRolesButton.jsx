export default function SwapRolesButton({ onSwap }) {
  return (
    <div className="swap-center">
      <button
        type="button"
        className="btn-swap-roles"
        onClick={onSwap}
        title="Swap source and target images"
      >
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
          <path d="m16 3 4 4-4 4" />
          <path d="M20 7H4" />
          <path d="m8 21-4-4 4-4" />
          <path d="M4 17h16" />
        </svg>
        Swap Roles
      </button>
    </div>
  )
}
