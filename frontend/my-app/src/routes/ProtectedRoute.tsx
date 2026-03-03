import { Navigate, Outlet } from 'react-router-dom'

function isAuthed() {
  return !!localStorage.getItem('token')
}

export default function ProtectedRoute() {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}