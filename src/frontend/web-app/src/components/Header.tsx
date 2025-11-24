import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const { theme, toggle } = useTheme()

  return (
    <header className="site-header" role="banner">
      <div className="brand" aria-label="GenZlator brand">
        <span className="logo" aria-hidden>🔄</span>
        <span>GenZlator-v2</span>
      </div>
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </header>
  )
}