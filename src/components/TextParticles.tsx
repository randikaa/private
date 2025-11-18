'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TextParticlesProps {
  isTransitioning: boolean;
  text: string;
}

// Vertex Shader
const vertexShader = `
  attribute float size;
  attribute vec3 velocity;
  attribute float life;
  
  varying float vLife;
  
  void main() {
    vLife = life;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader
const fragmentShader = `
  varying float vLife;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - dist * 2.0) * vLife;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

export default function TextParticles({ isTransitioning, text }: TextParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!isTransitioning || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    camera.position.z = 100;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create text texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 512;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Playfair Display';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * 90 - (lines.length - 1) * 45);
    });

    // Sample pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const positions: number[] = [];
    const velocities: number[] = [];
    const sizes: number[] = [];
    const lives: number[] = [];

    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const index = (y * canvas.width + x) * 4;
        const alpha = imageData.data[index + 3];

        if (alpha > 128) {
          // Position
          const px = (x - canvas.width / 2) * 0.08;
          const py = -(y - canvas.height / 2) * 0.08;
          positions.push(px, py, 0);

          // Velocity
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1;
          velocities.push(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            (Math.random() - 0.5) * 2
          );

          // Size and life
          sizes.push(Math.random() * 3 + 2);
          lives.push(1.0);
        }
      }
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('life', new THREE.Float32BufferAttribute(lives, 1));

    // Create material with custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create particles
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation
    let frame = 0;
    const maxFrames = 120;
    let animationId: number;

    const animate = () => {
      frame++;
      const progress = frame / maxFrames;

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array;
        const lives = particlesRef.current.geometry.attributes.life.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
          // Update position with velocity
          positions[i] += velocities[i] * 0.5;
          positions[i + 1] += velocities[i + 1] * 0.5;
          positions[i + 2] += velocities[i + 2] * 0.5;

          // Apply drag
          velocities[i] *= 0.98;
          velocities[i + 1] *= 0.98;
          velocities[i + 2] *= 0.98;

          // Update life
          const lifeIndex = i / 3;
          lives[lifeIndex] = Math.max(0, 1 - progress);
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.geometry.attributes.life.needsUpdate = true;

        // Rotate slightly
        particlesRef.current.rotation.z = progress * 0.1;
      }

      renderer.render(scene, camera);

      if (frame < maxFrames) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Cleanup
        container.removeChild(renderer.domElement);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [isTransitioning, text]);

  if (!isTransitioning) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
