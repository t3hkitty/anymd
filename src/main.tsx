import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { VaultWorkspaceLayout } from './components/VaultWorkspaceLayout.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

console.log("AnyMD v3.8.1-meow");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <VaultWorkspaceLayout />
    </ErrorBoundary>
  </StrictMode>,
)
// Force new build hash - v3.8.1
