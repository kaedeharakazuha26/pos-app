import { getAllowedPages, navItems } from '../pos-utils'
import type { PageId, Role } from '../types'

type Props = {
  currentUser: { id: string; name: string; role: Role } | null
  activePage: PageId
  setActivePage: (page: PageId) => void
  sidebarCollapsed: boolean
  onLogout: () => void
  rolePageAccess: Record<Role, PageId[]>
}

export function Sidebar({ currentUser, activePage, setActivePage, sidebarCollapsed, onLogout, rolePageAccess }: Props) {
  if (!currentUser) return null
  const allowedPages = getAllowedPages(currentUser.role, rolePageAccess)

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand-area">
        <div className="brand-mark">J</div>
        {!sidebarCollapsed && <div><strong>Joyce POS</strong></div>}
      </div>
      <nav>
        {navItems.filter((item) => allowedPages.includes(item.id)).map((item) => (
          <button key={item.id} type="button" className={`nav-button ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)} title={item.label}>
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className="nav-button danger" onClick={onLogout}>
          <span>↩</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
