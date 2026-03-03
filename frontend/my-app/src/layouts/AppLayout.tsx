// import { Outlet } from 'react-router-dom'
import { Outlet, Link } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div>
      <header style={{ padding: '1rem', background: '#ddd' }}>
        <strong>Topbar</strong>
      </header>

      <div style={{ display: 'flex' }}>
        <aside style={{ width: '200px', padding: '1rem', background: '#eee' }}>
          <nav>
            <ul>
              <li>
                <Link to="/">Dashboard</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main style={{ padding: '1rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
