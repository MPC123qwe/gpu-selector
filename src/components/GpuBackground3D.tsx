import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Floating GPU Chip — 3D box with glow                             */
/* ------------------------------------------------------------------ */
function GpuChip({
  position,
  size,
  color,
  speed,
}: {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle floating
    meshRef.current.position.y = position[1] + Math.sin(t * speed + position[0]) * 0.3;
    // Slow rotation
    meshRef.current.rotation.x = t * speed * 0.1 + position[0];
    meshRef.current.rotation.y = t * speed * 0.15 + position[2];
    // Scale on hover
    const targetScale = hovered ? 1.3 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[size, size * 0.15, size]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={hovered ? 0.4 : 0.08}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Particle Field — floating dots                                    */
/* ------------------------------------------------------------------ */
function ParticleField({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Reset if out of bounds
      if (posArray[i * 3 + 1] > 12) {
        posArray[i * 3 + 1] = -12;
        posArray[i * 3] = (Math.random() - 0.5) * 30;
      }
      if (Math.abs(posArray[i * 3]) > 20) velocities[i * 3] *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#4e6ef2"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid Floor — subtle 3D grid                                      */
/* ------------------------------------------------------------------ */
function GridFloor() {
  return (
    <gridHelper
      args={[40, 40, "#e2e5ea", "#eef0f2"]}
      position={[0, -8, 0]}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Mouse Camera Control                                              */
/* ------------------------------------------------------------------ */
function MouseCamera() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    const targetX = mouseRef.current.x * 0.5;
    const targetY = mouseRef.current.y * 0.3 + 2;
    state.camera.position.x += (targetX - state.camera.position.x) * 0.02;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene Content                                                     */
/* ------------------------------------------------------------------ */
function Scene() {
  const chips = useMemo(
    () => [
      { pos: [-6, 3, -4] as [number, number, number], size: 1.2, color: "#4e6ef2", speed: 0.4 },
      { pos: [5, -2, -3] as [number, number, number], size: 1.0, color: "#7c3aed", speed: 0.5 },
      { pos: [-4, -4, -2] as [number, number, number], size: 0.8, color: "#2563eb", speed: 0.6 },
      { pos: [7, 4, -5] as [number, number, number], size: 1.4, color: "#6366f1", speed: 0.35 },
      { pos: [3, 6, -3] as [number, number, number], size: 0.9, color: "#3b82f6", speed: 0.55 },
      { pos: [-8, 0, -6] as [number, number, number], size: 1.1, color: "#8b5cf6", speed: 0.45 },
      { pos: [0, -6, -4] as [number, number, number], size: 1.3, color: "#4f46e5", speed: 0.3 },
      { pos: [9, -1, -7] as [number, number, number], size: 0.7, color: "#60a5fa", speed: 0.65 },
      { pos: [-3, 7, -5] as [number, number, number], size: 1.0, color: "#818cf8", speed: 0.5 },
      { pos: [-10, -3, -3] as [number, number, number], size: 0.85, color: "#a78bfa", speed: 0.4 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} color="#4e6ef2" intensity={0.3} />

      {/* GPU Chips */}
      {chips.map((chip, i) => (
        <GpuChip key={i} position={chip.pos} size={chip.size} color={chip.color} speed={chip.speed} />
      ))}

      {/* Particles */}
      <ParticleField count={150} />

      {/* Grid Floor */}
      <GridFloor />

      {/* Mouse Control */}
      <MouseCamera />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component — 3D Background Canvas                             */
/* ------------------------------------------------------------------ */
export default function GpuBackground3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #f0f4f8 50%, #e8eef5 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
