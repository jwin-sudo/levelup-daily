interface ErrorBannerProps {
  error: string | null
  onDismiss: () => void
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 mx-4 my-2 rounded-xl">
      <span>{error}</span>
      <button onClick={onDismiss} className="ml-3 text-red-400 hover:text-red-600 font-bold text-lg leading-none">
        ×
      </button>
    </div>
  )
}
