import React, { Suspense, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import './App.css';
import Zone1Tabs from './Zone1Tabs';
import Zone2Tabs from './Zone2Tabs';
import Zone3Tabs from './Zone3Tabs';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, useAnimations, Line } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { CircleGeometry } from 'three';

// Register CircleGeometry with R3F
extend({ CircleGeometry });

function IntroScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-300 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>
      <div
        className="relative z-10 backdrop-blur-md bg-white/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center w-full max-w-4xl border border-blue-100 animate-fadein"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      >
        {/* HTWO Logo */}
        <img src="/HTWO.jpeg" alt="HTWO Logo" className="h-48 mb-0 drop-shadow-lg object-contain" />
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-2 mt-0 tracking-tight leading-tight">
          Hyundai HTWO Innovation Centre<br />
          <span className="text-2xl md:text-3xl font-semibold text-blue-700 block mt-1">at Indian Institute of Technology Madras</span>
        </h1>
        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6" />
        {/* Partner Logos */}
        <div className="flex flex-row items-center justify-center gap-8 my-4">
          <img src="/Hyundai.jpeg" alt="Hyundai Logo" className="h-12 w-auto object-contain transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg" style={{maxHeight: '2.5rem', maxWidth: '5.5rem'}} />
          <img src="/IITM.jpeg" alt="IITM Logo" className="h-12 w-auto object-contain transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg" />
          <img src="/Tamilnadu.jpeg" alt="Tamilnadu Logo" className="h-12 w-auto object-contain transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg" />
        </div>
        {/* Start the tour Button */}
        <button
          className="mt-6 mb-2 px-10 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 hover:scale-105 active:scale-95 text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-pulse-slow"
          onClick={() => navigate("/zones")}
        >
          Start The Tour
        </button>
      </div>
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes pulse-slow { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 0 12px rgba(59,130,246,0.08); } }
        .animate-pulse-slow { animation: pulse-slow 2.5s infinite; }
      `}</style>
    </div>
  );
}

function ModelErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  return (
    <Suspense fallback={<div className="text-gray-400">Loading 3D Model...</div>}>
      <ErrorCatcher onError={err => { setHasError(true); setErrorMsg(err?.toString() || "Unknown error"); }}>
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <div className="text-red-600 text-center font-semibold">Failed to load 3D model.</div>
            <div className="text-gray-500 text-center text-sm mt-2">{errorMsg || "Please check your model.glb file or browser console for details."}</div>
          </div>
        ) : (
          children
        )}
      </ErrorCatcher>
    </Suspense>
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
    // Log error to console for diagnostics
    console.error('3D Model Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.children;
    }
    return this.props.children;
  }
}

function ModelViewer({ onZoneClick }) {
  const gltf = useGLTF('/model.glb');
  useAnimations(gltf.animations, gltf.scene); // Do not play any animations

  // Find mesh with id 489 and 698 and change their colors
  React.useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (child.id === 489) {
            if (child.material) {
              child.material.color.set('red');
              child.material.needsUpdate = true;
            }
          }
          if (child.id === 698) {
            if (child.material) {
              child.material.color.set('blue'); // Change to desired color
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [gltf.scene]);

  // Camera animation: right to left for first 5 seconds, then set to screenshot view ONCE
  const cameraRef = useRef();
  const animationStart = useRef(null);
  const hasSetFinalView = useRef(false);
  useFrame((state) => {
    if (!cameraRef.current) cameraRef.current = state.camera;
    if (!animationStart.current) animationStart.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - animationStart.current;
    if (elapsed < 5) {
      // Animate camera x from 600 to -300 over 5 seconds
      const startX = 600;
      const endX = -300;
      const t = elapsed / 5;
      cameraRef.current.position.x = startX + (endX - startX) * t;
      cameraRef.current.lookAt(0, 20, 0);
      hasSetFinalView.current = false;
    } else if (!hasSetFinalView.current) {
      // Set camera to a high, far, angled view (matching screenshot) ONCE
      cameraRef.current.position.set(-400, 180, 400);
      cameraRef.current.lookAt(0, 20, 0);
      hasSetFinalView.current = true;
    }
  });

  // Icon positions (flexible, labeled buildings)
  const icon1 = [-10, 20, 0]; // left building roof
  const icon2 = [15, 20, 0];  // right building roof
  const icon3 = [2, 10, 10];  // open area between buildings

  try {
    return (
      <Center position={[0, 0, 0]}>
        <primitive object={gltf.scene} scale={4} />
        {/* Removed axis lines for icons */}
      </Center>
    );
  } catch (error) {
    console.error('Error rendering 3D model:', error);
    return <div className="text-red-600 text-center">Error rendering 3D model: {error.message}</div>;
  }
}

function ZoneSelectionScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>
      {/* Home Button */}
      <button
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blue-300 hover:border-blue-500 hover:bg-white/90 hover:scale-105 hover:shadow-blue-200 text-blue-700 font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ boxShadow: '0 4px 24px 0 rgba(59, 130, 246, 0.10)' }}
        onClick={() => navigate('/')}
        aria-label="Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 11.5V21a1 1 0 001 1h5.5a.5.5 0 00.5-.5V16a1 1 0 011-1h2a1 1 0 011 1v5.5a.5.5 0 00.5.5H20a1 1 0 001-1V11.5a1 1 0 00-.293-.707l-8-8a1 1 0 00-1.414 0l-8 8A1 1 0 003 11.5z"/></svg>
        Home
      </button>
      {/* Title and subtitle */}
      <div className="z-10 flex flex-col items-center mt-8 mb-4 animate-fadein">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center drop-shadow-lg tracking-tight">Centre Layout</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-2" />
      </div>
      {/* 3D Model Viewer Card with Logo on the right */}
      <div className="mb-6 w-full max-w-7xl h-[500px] bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-100 flex flex-row items-center justify-center relative animate-fadein" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}>
        {/* 3D Model Viewer */}
        <div className="flex-1 h-full flex items-center justify-center">
          <ModelErrorBoundary>
            <Canvas camera={{ position: [-35, 30, 100], fov: 35, far: 10000, near: 0.1 }} style={{ width: '100%', height: '100%' }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} />
              <Center position={[0, 0, 0]}>
                <ModelViewer onZoneClick={zone => navigate(`/zones/${zone}`)} />
              </Center>
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true} 
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
                minAzimuthAngle={-Infinity}
                maxAzimuthAngle={Infinity}
              />
            </Canvas>
          </ModelErrorBoundary>
        </div>
        {/* Logo on the right, vertically centered */}
        <div className="flex flex-col items-center justify-center h-full pl-8 pr-8">
          <img
            src="/Logo.png"
            alt="Centre Logo"
            className="h-64 w-auto object-contain drop-shadow-2xl rounded-2xl bg-white/90 p-4 border-2 border-blue-200"
            style={{ maxHeight: '18rem', maxWidth: '22vw' }}
          />
        </div>
      </div>
      {/* Three zone buttons below the 3D model box, each with a modern icon */}
      <div className="flex gap-6 mb-2 w-full max-w-2xl z-10 animate-fadein">
        <button className="flex-1 flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95 border-2 border-blue-200 transition-all duration-200" onClick={() => navigate('/zones/1')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.5 3.5a1 1 0 01.894.553l.724 1.447 2.764-.922a1 1 0 01.764 0l4.5 1.5A1 1 0 0120 6.5v13a1 1 0 01-1.276.97l-4.724-1.575-2.764.922a1 1 0 01-.764 0l-4.5-1.5A1 1 0 014 17.5v-13A1 1 0 015.276 3.53l4.224 1.41.724-1.447A1 1 0 019.5 3.5zm1.5 3.618V19.5l2.5-.833V6.285l-2.5.833z"/></svg>
          Zone 1
        </button>
        <button className="flex-1 flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95 border-2 border-blue-200 transition-all duration-200" onClick={() => navigate('/zones/2')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5V7.5a2 2 0 00-1.106-1.789l-7-4a2 2 0 00-1.788 0l-7 4A2 2 0 003 7.5v9a2 2 0 001.106 1.789l7 4a2 2 0 001.788 0l7-4A2 2 0 0021 16.5zM12 4.236l6.764 3.866-6.764 3.866-6.764-3.866L12 4.236zm-7 5.13l6.5 3.72v7.008l-6.5-3.715V9.366zm8.5 10.728v-7.008l6.5-3.72v7.013l-6.5 3.715z"/></svg>
          Zone 2
        </button>
        <button className="flex-1 flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95 border-2 border-blue-200 transition-all duration-200" onClick={() => navigate('/zones/3')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/></svg>
          Zone 3
        </button>
      </div>
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route path="/zones" element={<ZoneSelectionScreen />} />
        <Route path="/zones/1" element={<Zone1Tabs />} />
        <Route path="/zones/2" element={<Zone2Tabs />} />
        <Route path="/zones/3" element={<Zone3Tabs />} />
        {/* Zone 2 and 3 detail screens to be added */}
      </Routes>
    </Router>
  );
}

export default App;
