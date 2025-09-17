import { useFrame, extend } from "@react-three/fiber";
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { shaderMaterial,  } from "@react-three/drei";

// Create the selection material using shaderMaterial
const SelectionShaderMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0xffffff),
    strikeWidth: 0.5,
    strikeAlpha: 0.5,
    borderWidth: 0.02,
    borderAlpha: 1.0,
    animationSpeed: 0.35,
  },
  // vertex shader
  `
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float strikeWidth;
    uniform float strikeAlpha;
    uniform float borderWidth;
    uniform float borderAlpha;
    uniform float animationSpeed;
    
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      // Use absolute position for consistent edge detection
      vec3 absPos = abs(vPosition);
      
      // Define the cube bounds
      float cubeSize = 0.5;
      
      // Calculate distance from each face
      vec3 dist = absPos - vec3(cubeSize);
      
      // Edge thickness
      float edgeThickness = borderWidth;
      
      // Detect if we're on an edge (where at least one component is near the boundary)
      float edgeFactor = 0.0;
      
      // Check if we're close to an edge (where two coordinates are near max)
      if (abs(absPos.x - cubeSize) < edgeThickness && abs(absPos.y - cubeSize) < edgeThickness) {
        edgeFactor = 1.0; // x-y edge
      }
      else if (abs(absPos.x - cubeSize) < edgeThickness && abs(absPos.z - cubeSize) < edgeThickness) {
        edgeFactor = 1.0; // x-z edge
      }
      else if (abs(absPos.y - cubeSize) < edgeThickness && abs(absPos.z - cubeSize) < edgeThickness) {
        edgeFactor = 1.0; // y-z edge
      }
      
      // Discard non-edge fragments
      if (edgeFactor < 0.5) {
        discard;
      }
      
      // Animate stripes along edges
      float stripe = mod(vPosition.x + vPosition.y + vPosition.z - time * animationSpeed, strikeWidth);
      stripe = step(strikeWidth * 0.5, stripe) * strikeAlpha;
      
      // Final color
      gl_FragColor = vec4(color, stripe * borderAlpha);
    }
  `
);

// Extend for use in JSX
extend({ SelectionShaderMaterial });

const SelectionIndicator = ({ 
  color = "#ffffff", 
  edgeThickness = 0.02, 
  animationSpeed = 0.35,
  strikeWidth = 0.5,
  strikeAlpha = 0.5,
  borderAlpha = 1.0
}) => {
  const materialRef = useRef();
  const meshRef = useRef();
  const [bounds, setBounds] = useState({ size: [1, 1, 1], center: [0, 0, 0] });

  // Convert color string to THREE.Color
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useEffect(() => {
    // Get the parent mesh
    const parentMesh = meshRef.current?.parent;
    if (!parentMesh) return;

    // Get the bounding box of the parent mesh
    const bbox = new THREE.Box3().setFromObject(parentMesh);
    const size = bbox.getSize(new THREE.Vector3());

    // Update bounds - since we're a child, we use local coordinates
    setBounds({
      size: [size.x, size.y, size.z],
      center: [0, 0, 0], // Center is 0,0,0 in local space
    });

    // Create timeline for coordinated animation
    const tl = gsap.timeline();

    // Animate in
    if (meshRef.current) {
      meshRef.current.scale.set(0, 0, 0);
      tl.to(meshRef.current.scale, {
        x: size.x * 1.05,
        y: size.y * 1.05,
        z: size.z * 1.05,
        duration: 0.3,
        ease: "back.out(1.2)",
      });
    }
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.getElapsedTime();
      
      // Update material properties if they change
      materialRef.current.color = threeColor;
      materialRef.current.borderWidth = edgeThickness;
      materialRef.current.animationSpeed = animationSpeed;
      materialRef.current.strikeWidth = strikeWidth;
      materialRef.current.strikeAlpha = strikeAlpha;
      materialRef.current.borderAlpha = borderAlpha;
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[0, 0, 0]} // Start with scale 0
    >
      <boxGeometry />
      <selectionShaderMaterial 
        ref={materialRef} 
        key={SelectionShaderMaterial.key} 
        transparent 
        side={THREE.DoubleSide}
        color={threeColor}
        borderWidth={edgeThickness}
        animationSpeed={animationSpeed}
        strikeWidth={strikeWidth}
        strikeAlpha={strikeAlpha}
        borderAlpha={borderAlpha}
      />
    </mesh>
  );
};

export default SelectionIndicator; 