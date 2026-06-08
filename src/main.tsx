import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import ViewerPage from './pages/ViewerPage'
import AdminPage from './pages/AdminPage'
import DisplayPage from './pages/DisplayPage'
import Background from './components/Background'
import ErrorBoundary from './components/ErrorBoundary'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/viewer" replace /> },
  { path: '/viewer', element: <ViewerPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/display', element: <DisplayPage /> },
  { path: '*', element: <Navigate to="/viewer" replace /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Background />
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)
