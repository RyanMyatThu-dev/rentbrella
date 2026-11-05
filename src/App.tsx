import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DispensePage } from './pages/DispensePage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { ScanPage } from './pages/ScanPage'
import { StationsPage } from './pages/StationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/dispense" element={<DispensePage />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
