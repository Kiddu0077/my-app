import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import { useNavigate } from "react-router-dom";

const videoTabs = [
  { title: "Reception & Lobby", url: "/Zone-01/Zone01-Reception & Lobby.webm" },
  { title: "Digital Twin Lab 1", url: "/Zone-01/Zone01-Digital Twin Lab.webm" },
  { title: "Waiting Area", url: "/Zone-01/Zone01-WaitingArea.webm" },
  { title: "Conference Hall", url: "/Zone-01/Zone01-Conference Hall.webm" },
  { title: "Display Area", url: "/Zone-01/Zone01- Display Area.webm" },
  { title: "Digital Twin Lab 2", url: "/Zone-01/Zone01- Lab02.webm" },
  { title: "Lounge", url: "/Zone-01/Zone01- Lounge.webm" },
  { title: "Cafétéria", url: "/Zone-01/Zone01-Cafeteria.webm" },
];

// Add a simple spinner component for loading fallback
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-blue-600 font-semibold">Loading 3D Model...</div>
    </div>
  );
}

// Update ModelErrorBoundary to use Spinner as fallback
function ModelErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  return (
    <React.Suspense fallback={<Spinner />}>
      <ErrorCatcher onError={err => { setHasError(true); setErrorMsg(err?.toString() || "Unknown error"); }}>
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <div className="text-red-600 text-center font-semibold">Failed to load 3D model.</div>
            <div className="text-gray-500 text-center text-sm mt-2">{errorMsg || "Please check your Zone01.glb file or browser console for details."}</div>
          </div>
        ) : (
          children
        )}
      </ErrorCatcher>
    </React.Suspense>
  );
}

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error);
    console.error('Zone 1 Model Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.children;
    }
    return this.props.children;
  }
}

// Update ZoneModel to catch async errors from useGLTF
function ZoneModel({ url, onLoaded }) {
  const { scene } = useGLTF(url, true);
  const [loading, setLoading] = useState(true);
  const groupRef = useRef();
  const animationStart = useRef(null);

  useEffect(() => {
    if (scene && loading) {
      setLoading(false);
      if (onLoaded) onLoaded();
    }
    return () => {
      scene?.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          if (child.material.lightMap) child.material.lightMap.dispose();
          if (child.material.aoMap) child.material.aoMap.dispose();
          if (child.material.emissiveMap) child.material.emissiveMap.dispose();
          if (child.material.normalMap) child.material.normalMap.dispose();
          if (child.material.roughnessMap) child.material.roughnessMap.dispose();
          if (child.material.metalnessMap) child.material.metalnessMap.dispose();
          child.material.dispose();
        }
      });
    };
  }, [scene, loading, onLoaded]);

  useFrame((state) => {
    if (loading && groupRef.current) {
      if (!animationStart.current) animationStart.current = state.clock.getElapsedTime();
      const elapsed = state.clock.getElapsedTime() - animationStart.current;
      const duration = 3; // seconds
      const startX = -20;
      const endX = 0;
      const t = Math.min(elapsed / duration, 1);
      groupRef.current.position.x = startX + (endX - startX) * t;
    }
  });

  return <group ref={groupRef}><primitive object={scene} scale={4} /></group>;
}

function VideoModal({ currentIndex, onClose, onSwitch }) {
  const [playId, setPlayId] = useState(Date.now());
  const video = videoTabs[currentIndex];
  // Always show the next 4 videos after the current one, wrapping around
  const tabIndices = [];
  for (let i = 1; tabIndices.length < 4 && i < videoTabs.length; i++) {
    tabIndices.push((currentIndex + i) % videoTabs.length);
  }
  // When currentIndex changes, update playId to force remount
  React.useEffect(() => {
    setPlayId(Date.now());
  }, [currentIndex]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="mb-4 text-xl font-semibold text-gray-800">{video.title}</h3>
        <div className="w-full h-[32rem] max-w-4xl mb-4 mx-auto">
          <video
            key={playId}
            src={video.url}
            controls
            autoPlay
            width="100%"
            height="100%"
            onEnded={onClose}
          />
        </div>
        <div className="flex gap-4 mb-2">
          {tabIndices.map(idx => (
            <button
              key={idx}
              className={`px-4 py-2 rounded font-medium border transition-all duration-150 ${currentIndex === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300'}`}
              onClick={() => { onSwitch(idx); setPlayId(Date.now()); }}
            >
              {videoTabs[idx].title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Zone1Tabs() {
  const leftTabs = videoTabs.slice(0, 4);
  const rightTabs = videoTabs.slice(4, 8);
  const [videoIndex, setVideoIndex] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>
      {/* Top bar with Home and Back buttons */}
      <div className="relative z-10 w-full flex flex-row justify-between items-center px-4 mb-4 py-4 bg-white/80 rounded-2xl shadow-lg border border-blue-100 animate-fadein">
        <button
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-100 to-blue-300 text-blue-700 rounded-xl shadow hover:from-blue-200 hover:to-blue-400 hover:scale-105 border-2 border-blue-200 font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ boxShadow: '0 4px 24px 0 rgba(59, 130, 246, 0.10)' }}
          onClick={() => navigate('/')} aria-label="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 11.5V21a1 1 0 001 1h5.5a.5.5 0 00.5-.5V16a1 1 0 011-1h2a1 1 0 011 1v5.5a.5.5 0 00.5.5H20a1 1 0 001-1V11.5a1 1 0 00-.293-.707l-8-8a1 1 0 00-1.414 0l-8 8A1 1 0 003 11.5z"/></svg>
          Home
        </button>
        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">Zone 1</span>
        <button
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-100 to-blue-300 text-blue-700 rounded-xl shadow hover:from-blue-200 hover:to-blue-400 hover:scale-105 border-2 border-blue-200 font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ boxShadow: '0 4px 24px 0 rgba(59, 130, 246, 0.10)' }}
          onClick={() => navigate('/zones')} aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M15.75 19.08a.75.75 0 01-1.06 0l-6.5-6.5a.75.75 0 010-1.06l6.5-6.5a.75.75 0 111.06 1.06L9.31 12l6.44 6.44a.75.75 0 010 1.06z"/></svg>
          Back
        </button>
      </div>
      {/* Divider */}
      {/* <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-4 z-10 animate-fadein" /> */}
      <div className="relative z-10 mb-10 w-full max-w-7xl h-[600px] rounded-2xl shadow-xl border border-blue-100 flex flex-row items-center justify-center animate-fadein bg-gradient-to-br from-blue-100 via-white to-blue-200" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
        {/* Left 3 video tab buttons - modern style */}
        <div className="flex flex-col gap-3 p-2 w-40 mx-4">
          {leftTabs.map((tab, index) => (
            <button
              key={index}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg shadow hover:from-blue-200 hover:to-blue-300 hover:text-blue-900 hover:scale-105 border-2 border-blue-200 font-semibold text-center flex items-center justify-center text-base transition-all duration-150"
              onClick={() => setVideoIndex(index)}
            >
              {tab.title}
            </button>
          ))}
        </div>
        {/* 3D Model Viewer - wider */}
        <div className="flex-1 h-full flex items-center justify-center min-w-[700px] relative">
          {videoIndex === null && (
            <ModelErrorBoundary>
              <Canvas camera={{ position: [-200, 20, 80], fov: 50, far: 10000, near: 0.1 }} style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={0.5} />
                <Center position={[0,0,0]}>
                  <ZoneModel url="/Zone01.glb" onLoaded={() => {}} scale={4} />
                </Center>
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true} 
                  enableRotate={true} 
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI / 2}
                  minAzimuthAngle={-Math.PI}
                  maxAzimuthAngle={Math.PI}
                  minDistance={120}
                />
              </Canvas>
            </ModelErrorBoundary>
          )}
          {/* Zone navigation buttons - absolute bottom left/right */}
          <button className="absolute left-4 bottom-4 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95 border-2 border-blue-200 transition-all duration-200" onClick={() => navigate('/zones/2')}>
            Go to Zone 2
          </button>
          <button className="absolute right-4 bottom-4 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95 border-2 border-blue-200 transition-all duration-200" onClick={() => navigate('/zones/3')}>
            Go to Zone 3
          </button>
        </div>
        {/* Right 3 video tab buttons - modern style */}
        <div className="flex flex-col gap-3 p-2 w-40 mx-4">
          {rightTabs.map((tab, index) => (
            <button
              key={index + 4}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg shadow hover:from-blue-200 hover:to-blue-300 hover:text-blue-900 hover:scale-105 border-2 border-blue-200 font-semibold text-center flex items-center justify-center text-base transition-all duration-150"
              onClick={() => setVideoIndex(index + 4)}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      {/* Video Modal */}
      {videoIndex !== null && (
        <VideoModal
          currentIndex={videoIndex}
          onClose={() => setVideoIndex(null)}
          onSwitch={setVideoIndex}
        />
      )}
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>
    </div>
  );
} 