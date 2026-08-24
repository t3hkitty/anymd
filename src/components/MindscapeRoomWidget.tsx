import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, useGLTF, Html } from '@react-three/drei';
import { WidgetPanel } from '@lorik/shared-kawaii-ui';

// Placeholder Low-Poly Bed Mesh with live telemetry bindings
const TelemetryBed: React.FC<{ sleepDebt: number }> = ({ sleepDebt }) => {
  const [hovered, setHover] = useState(false);
  const glowColor = sleepDebt > 2 ? "#f43f5e" : "#10b981"; // Red if tired, green if rested

  return (
    <mesh 
      position={[0, 0.3, -1]} 
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={() => alert(`🛏️ Sleep Status: You secured a great night of rest! Rest Debt: ${sleepDebt}h`)}
    >
      <boxGeometry args={[1.5, 0.6, 2]} />
      <meshStandardMaterial 
        color={hovered ? glowColor : "#cbd5e1"} 
        roughness={0.7} 
      />
    </mesh>
  );
};

// Spinning Desk Fan Mesh bound to active telemetry
const TelemetryFan: React.FC<{ isRunning: boolean, temp: number }> = ({ isRunning, temp }) => {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!isRunning && temp < 75) return;
    const interval = setInterval(() => {
      setAngle(prev => (prev + (temp > 77 ? 0.3 : 0.1)) % (Math.PI * 2));
    }, 16);
    return () => clearInterval(interval);
  }, [isRunning, temp]);

  return (
    <group position={[1.2, 0.8, 1.2]}>
      {/* Fan Base */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Fan Blades */}
      <mesh position={[0, 0.3, 0]} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#f87171" />
      </mesh>
    </group>
  );
};

export const MindscapeRoomWidget: React.FC = () => {
  // Live parameters fetched from local myBlackbox state managers
  const [roomTemp, setRoomTemp] = useState<number>(78); // °F
  const [sleepDebt, setSleepDebt] = useState<number>(0.5); // Hours
  const [choreActive, setChoreActive] = useState<boolean>(false);
  const [vacationMode, setVacationMode] = useState<boolean>(false);

  // Monitor local storage to dynamically update the 3D room in real-time
  useEffect(() => {
    const checkState = () => {
      setChoreActive(localStorage.getItem('anymd_chore_active') === 'true');
      setVacationMode(localStorage.getItem('anymd_vacation_enabled') === 'true');
      const savedTemp = localStorage.getItem('anymd_room_temp');
      if (savedTemp) setRoomTemp(parseInt(savedTemp));
    };
    checkState();
    window.addEventListener('storage', checkState);
    return () => window.removeEventListener('storage', checkState);
  }, []);

  return (
    <WidgetPanel 
      title="📐 3D Somatic Mindscape (3/4 View)" 
      badge="💎 WEBGL LOCAL"
      className="border-4 border-black shadow-[4px_4px_0_#000] bg-white p-2 rounded-none w-full h-[500px]"
    >
      <div className="w-full h-full bg-slate-100 border-2 border-black relative overflow-hidden">
        
        {/* Dynamic HUD Overlay */}
        <div className="absolute top-2 left-2 z-10 bg-white border-2 border-black p-1.5 font-mono text-[9px] font-bold leading-tight shadow-[2px_2px_0_#000]">
          <span className="text-purple-800 uppercase block">📡 HUD Telemetry</span>
          🌡️ TEMP: {roomTemp}°F <br />
          🛌 SLEEP DEBT: {sleepDebt}h <br />
          🏝️ VACATION: {vacationMode ? "ON" : "OFF"}
        </div>

        {/* The 3D Render Canvas */}
        <Canvas>
          {/* Isometric Camera setup (Fixed Orthographic 3/4 view) */}
          <OrthographicCamera 
            makeDefault 
            position={[5, 5, 5]} 
            zoom={80} 
            near={0.1} 
            far={1000} 
          />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 3} 
          />

          {/* Stylized Lighting */}
          <ambientLight intensity={vacationMode ? 0.8 : 0.5} color={vacationMode ? "#e9d5ff" : "#ffffff"} />
          <directionalLight position={[5, 10, 3]} intensity={0.8} />

          <Suspense fallback={null}>
            <group position={[0, -0.5, 0]}>
              
              {/* Isometric Room Walls & Floor */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[4, 4]} />
                <meshStandardMaterial color={vacationMode ? "#faf5ff" : "#f1f5f9"} />
              </mesh>
              {/* Back-Left Wall */}
              <mesh position={[-2, 1, 0]}>
                <boxGeometry args={[0.1, 2, 4]} />
                <meshStandardMaterial color={vacationMode ? "#e9d5ff" : "#e2e8f0"} />
              </mesh>
              {/* Back-Right Wall */}
              <mesh position={[0, 1, -2]}>
                <boxGeometry args={[4, 2, 0.1]} />
                <meshStandardMaterial color={vacationMode ? "#e9d5ff" : "#e2e8f0"} />
              </mesh>

              {/* 3D Telemetry Assets */}
              <TelemetryBed sleepDebt={sleepDebt} />
              <TelemetryFan isRunning={choreActive} temp={roomTemp} />

              {/* Decorative Rug */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.8]}>
                <planeGeometry args={[1.5, 1]} />
                <meshStandardMaterial color="#fef08a" />
              </mesh>

            </group>
          </Suspense>
        </Canvas>

        {/* Vacation Overlay */}
        {vacationMode && (
          <div className="absolute inset-0 bg-purple-200/40 pointer-events-none flex items-center justify-center">
            <span className="font-black text-xs uppercase tracking-widest text-purple-900 bg-white border-2 border-black px-3 py-1.5 shadow-[4px_4px_0_#c084fc]">
              🏝️ System Snoozing in Lavender Fields
            </span>
          </div>
        )}

      </div>
    </WidgetPanel>
  );
};