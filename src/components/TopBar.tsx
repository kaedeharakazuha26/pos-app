import { getPageTitle } from '../pos-utils'
import type { PageId, Role } from '../types'

type Props = {
  currentUser: { id: string; name: string; role: Role } | null
  activePage: PageId
  currentTime: Date
  theme: string
  onToggleSidebar: () => void
  onToggleTheme: () => void
}

export function TopBar({ currentUser, activePage, currentTime, theme, onToggleSidebar, onToggleTheme }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button" onClick={onToggleSidebar}>☰</button>
        <div>
          <p className="eyebrow">{getPageTitle(activePage)}</p>
          <h2>{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(currentTime)}</h2>
        </div>
      </div>
      <div className="topbar-right">
        <span className="clock-pill">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <button type="button" className="icon-button" onClick={onToggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
        <div className="user-chip"><strong>{currentUser?.name}</strong><span>{currentUser?.role}</span></div>
      </div>
    </header>
  )
}
