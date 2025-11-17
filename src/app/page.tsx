'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';

function Model({ openAmount }: { openAmount: number }) {
  const { scene } = useGLTF('/shell.glb');
  const [topLid, setTopLid] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    const parts: THREE.Mesh[] = [];
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xD4AF37,
          metalness: 0.7,
          roughness: 0.3,
          envMapIntensity: 1.5,
        });
        parts.push(child);
      }
    });

    // Try to find the top lid (first mesh found)
    if (parts.length > 0 && !topLid) {
      setTopLid(parts[0]);
    }
    console.log('Shell parts found:', parts.length);
  }, [scene]);

  // Stage 1: Rotate the whole shell (0 to 1)
  const stage1Progress = Math.min(openAmount, 1);
  const baseRotation = -Math.PI / 2;
  const maxRotation = (Math.PI / 3) + (Math.PI / 18); // 70 degrees
  const flipRotation = baseRotation - (stage1Progress * maxRotation);

  // Stage 2: Open the lid (1 to 2)
  const stage2Progress = Math.max(0, openAmount - 1);

  useEffect(() => {
    if (topLid) {
      topLid.rotation.z = -stage2Progress * Math.PI / 2; // Open up to 90 degrees on Z axis (reversed)
    }
  }, [stage2Progress, topLid]);

  scene.rotation.set(flipRotation, 0, 0);
  scene.position.set(0, 2.6, 0);
  scene.scale.set(1.3, 1.3, 1.3);
  return <primitive object={scene} />;
}

export default function Home() {
  const [openAmount, setOpenAmount] = useState(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setOpenAmount(prev => {
        const delta = e.deltaY * 0.001;
        return Math.max(0, Math.min(2, prev + delta)); // Changed max to 2 for two stages
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Your Text Content</h1>
          <p className="text-lg text-gray-700">
            Add your text content here. This is the left column where you can put any information you want.
          </p>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} style={{ width: '100%', height: '100vh' }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FFD700" />
          <Suspense fallback={null}>
            <Model openAmount={openAmount} />
          </Suspense>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
    </div>
  );
}
