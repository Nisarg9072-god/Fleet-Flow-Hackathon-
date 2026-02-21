import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import LiveMapPage from './pages/map/LiveMapPage.jsx'
import TrackerPage from './pages/tracker/TrackerPage.jsx'

function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 12, padding: 16 }}>
        <Link to="/map">Live Map</Link>
        <Link to="/driver/tracker">Driver Tracker</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div style={{ padding: 16 }}>Open Live Map or Driver Tracker</div>} />
        <Route path="/map" element={<LiveMapPage />} />
        <Route path="/driver/tracker" element={<TrackerPage />} />
      </Routes>
    </>
  )
}

export default App
