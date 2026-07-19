import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const ORBIT_NODES = [
  { name: 'AI CORE', isRed: true, pos: [1.4, 0.6, 0.4] },
  { name: 'RAG', isRed: false, pos: [-1.4, 0.6, -0.3] },
  { name: 'BACKEND', isRed: false, pos: [1.1, -0.85, -0.5] },
  { name: 'VECTOR', isRed: true, pos: [-1.1, -0.85, 0.5] }
];

function CyberCore3D({ isDark, isMobile }) {
  const coreRef = useRef();
  const innerCubeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const groupRef = useRef();

  // Theme-aware color palette
  const colors = useMemo(() => ({
    redAccent: isDark ? '#FF003C' : '#DC0032',
    wireframe: isDark ? '#FFFFFF' : '#1A1A2E',
    wireframeOpacity: isDark ? 0.3 : 0.25,
    ring1Color: isDark ? '#FFFFFF' : '#1A1A2E',
    ring1Opacity: isDark ? 0.6 : 0.45,
    ring3Color: isDark ? '#888890' : '#555566',
    ring3Opacity: isDark ? 0.35 : 0.3,
    connectorColor: isDark ? '#FFFFFF' : '#1A1A2E',
    connectorOpacity: isDark ? 0.25 : 0.18,
    nodeNeutralColor: isDark ? '#FFFFFF' : '#1A1A2E',
    nodeNeutralEmissive: isDark ? '#222222' : '#111118',
    particleColor: isDark ? '#FFFFFF' : '#1A1A2E',
    particleOpacity: isDark ? 0.6 : 0.35,
    labelBg: isDark ? 'rgba(0, 0, 0, 0.78)' : 'rgba(255, 255, 255, 0.9)',
    labelShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.8)' : '0 4px 14px rgba(0, 0, 0, 0.12)',
    labelBorder: isDark ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
    labelNeutralText: isDark ? '#FFFFFF' : '#1A1A2E',
    cubeEmissive: isDark ? '#550012' : '#880020',
    cubeEmissiveIntensity: isDark ? 0.6 : 0.8,
    ambientIntensity: isDark ? 0.6 : 1.0,
    directionalIntensity: isDark ? 2.2 : 2.8,
    frontFillIntensity: isDark ? 1.2 : 1.5,
  }), [isDark]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.35;
      coreRef.current.rotation.x += delta * 0.12;
    }
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.y += delta * 0.6;
      innerCubeRef.current.rotation.x += delta * 0.4;
      innerCubeRef.current.rotation.z += delta * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.4;
      ring1Ref.current.rotation.x = Math.sin(t * 0.8) * 0.35;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.3;
      ring2Ref.current.rotation.y = Math.cos(t * 0.7) * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.25;
      ring3Ref.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const linesGeometry = useMemo(() => {
    const points = [];
    const center = new THREE.Vector3(0, 0, 0);
    ORBIT_NODES.forEach(node => {
      points.push(center);
      points.push(new THREE.Vector3(...node.pos));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // Reduce particles on mobile
  const particleCount = isMobile ? 60 : 140;

  return (
    <group ref={groupRef} position={[0.3, 0, 0]}>
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh ref={innerCubeRef} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshPhysicalMaterial
            color={colors.redAccent}
            emissive={colors.cubeEmissive}
            emissiveIntensity={colors.cubeEmissiveIntensity}
            roughness={0.12}
            metalness={0.88}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            reflectivity={1.0}
          />
        </mesh>
      </Float>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial
          color={colors.wireframe}
          wireframe
          transparent
          opacity={colors.wireframeOpacity}
        />
      </mesh>

      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.37, 64]} />
          <meshBasicMaterial color={colors.ring1Color} side={THREE.DoubleSide} transparent opacity={colors.ring1Opacity} />
        </mesh>
      </group>

      <group ref={ring2Ref}>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <ringGeometry args={[1.65, 1.67, 64]} />
          <meshBasicMaterial color={colors.redAccent} side={THREE.DoubleSide} transparent opacity={0.45} />
        </mesh>
      </group>

      <group ref={ring3Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
          <ringGeometry args={[1.95, 1.97, 64]} />
          <meshBasicMaterial color={colors.ring3Color} side={THREE.DoubleSide} transparent opacity={colors.ring3Opacity} />
        </mesh>
      </group>

      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color={colors.connectorColor} transparent opacity={colors.connectorOpacity} />
      </lineSegments>

      {ORBIT_NODES.map((node, i) => (
        <group key={i} position={node.pos}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.10, 32, 32]} />
            <meshPhysicalMaterial
              color={node.isRed ? colors.redAccent : colors.nodeNeutralColor}
              emissive={node.isRed ? '#440008' : colors.nodeNeutralEmissive}
              emissiveIntensity={0.5}
              roughness={0.15}
              metalness={0.9}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              reflectivity={1.0}
            />
          </mesh>

          {/* Hide labels on mobile to reduce WebGL overhead & clutter */}
          {!isMobile && (
            <Html position={[0, 0.16, 0]} center distanceFactor={5.2}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                backgroundColor: colors.labelBg,
                backdropFilter: 'blur(10px)',
                border: colors.labelBorder,
                padding: '0.28rem 0.85rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: colors.labelShadow,
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: node.isRed ? colors.redAccent : colors.labelNeutralText,
                  letterSpacing: '0.04em'
                }}>
                  {node.name}
                </span>
              </div>
            </Html>
          )}
        </group>
      ))}

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={useMemo(() => {
              const pos = new Float32Array(particleCount * 3);
              for (let i = 0; i < particleCount; i++) {
                pos[i * 3] = (Math.random() - 0.5) * 4.5;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
              }
              return pos;
            }, [particleCount])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.04 : 0.05}
          color={colors.particleColor}
          transparent
          opacity={colors.particleOpacity}
          blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>

      <ambientLight intensity={colors.ambientIntensity} />
      <directionalLight position={[5, 8, 5]} intensity={colors.directionalIntensity} color="#FFFFFF" castShadow />
      <pointLight position={[10, 10, 10]} intensity={2.0} color="#FFFFFF" />
      <pointLight position={[-10, -10, -10]} intensity={1.8} color={colors.redAccent} />
      <pointLight position={[0, 0, 5]} intensity={colors.frontFillIntensity} color="#FFFFFF" />
    </group>
  );
}

export default function CyberneticAiCore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5.0], fov: 48 }}
        style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
      >
        <CyberCore3D isDark={isDark} isMobile={isMobile} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 2.5}
          /* On mobile, disable manual rotation so page scrolling isn't blocked */
          enabled={!isMobile}
        />
      </Canvas>
    </div>
  );
}
