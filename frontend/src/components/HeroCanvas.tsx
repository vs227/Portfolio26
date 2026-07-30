"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function MouseReactionPoints() {
  const pointsRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const count = 1200;
  const tempPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * (viewport.width / 2);
    const mouseY = state.pointer.y * (viewport.height / 2);

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.04;
      pointsRef.current.rotation.x = time * 0.02;
    }

    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, mouseX * 0.8, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, mouseY * 0.8, 0.05);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, Math.sin(time) * 1, 0.05);
      meshRef.current.rotation.x = time * 0.3;
      meshRef.current.rotation.y = time * 0.4;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[tempPositions, 3]}
            count={count}
            itemSize={3}
            array={tempPositions}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          opacity={0.4}
        />
      </points>

      <mesh ref={meshRef} position={[0, 0, -2]}>
        <icosahedronGeometry args={[1.5, 4]} />
        <meshPhysicalMaterial
          color="#151515"
          emissive="#000000"
          roughness={0.2}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          wireframe={true}
          flatShading={true}
        />
      </mesh>
    </>
  );
}

// Fallback gradient background when WebGL is unavailable
function GradientFallback() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#020202] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-neutral-800 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neutral-900 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202] opacity-80" />
    </div>
  );
}

export default function HeroCanvas() {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <GradientFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10 bg-[#020202] overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor("#020202", 1);
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#333333" />
        <MouseReactionPoints />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202] opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202] opacity-60" />
    </div>
  );
}
