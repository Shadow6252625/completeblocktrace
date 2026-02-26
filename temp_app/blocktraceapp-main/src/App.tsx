
import { HashRouter, Routes, Route } from 'react-router-dom';
import LaunchGateway from './pages/LaunchGateway';
import TraceConfiguration from './pages/TraceConfiguration';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <video
        id="bg-video"
        autoPlay
        loop
        muted
        playsInline
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          e.currentTarget.play();
        }}
      >
        <source src="bg-video.mp4" type="video/mp4" />
      </video>
      <div className="bg-overlay"></div>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LaunchGateway />} />
          <Route path="/configure" element={<TraceConfiguration />} />
          <Route path="/dashboard/:sessionId" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
