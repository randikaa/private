"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface WindImageProps {
  src: string
  alt: string
  isActive: boolean
  cardStackProgress: number
}

export const WindImage: React.FC<WindImageProps> = ({ src, alt, isActive, cardStackProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Load texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(src, (texture) => {
      // Shader material with wind effect
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uWindStrength: { value: 0.02 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uTime;
          uniform float uWindStrength;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            
            // Wind wave effect
            float wave = sin(uv.y * 10.0 + uTime * 2.0) * uWindStrength;
            uv.x += wave;
            
            vec4 color = texture2D(uTexture, uv);
            gl_FragColor = color;
          }
        `,
      })

      const geometry = new THREE.PlaneGeometry(2, 2)
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      meshRef.current = mesh

      // Animation loop
      const animate = () => {
        if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
          meshRef.current.material.uniforms.uTime.value += 0.01
        }
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      animate()
    })

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        rendererRef.current.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        )
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      if (meshRef.current) {
        meshRef.current.geometry.dispose()
        if (meshRef.current.material instanceof THREE.Material) {
          meshRef.current.material.dispose()
        }
      }
    }
  }, [src])

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 1.1,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  )
}
