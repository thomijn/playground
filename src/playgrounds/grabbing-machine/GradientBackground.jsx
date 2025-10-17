import React, { useRef, useMemo } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three/webgpu';
import { 
  vec2, 
  vec3, 
  vec4, 
  uniform, 
  varying, 
  uv, 
  length, 
  smoothstep, 
  mix,
  pow,
  clamp
} from 'three/tsl';
import { useThree } from '@react-three/fiber';

const GradientBackground = () => {
  const meshRef = useRef();
  const viewport = useThree((state) => state.viewport);
  // Leva controls for gradient customization
  const {
    centerColor,
    edgeColor,
    gradientIntensity,
    gradientPower,
    centerX,
    centerY,
    gradientScale
  } = useControls('Background Gradient', {
    centerColor: { value: '#131d7c', label: 'Center Color' },
    edgeColor: { value: '#2a2a2a', label: 'Edge Color' },
    gradientIntensity: { value: 1.2, min: 0.1, max: 3.0, step: 0.1, label: 'Intensity' },
    gradientPower: { value: 0.1, min: 0.5, max: 5.0, step: 0.1, label: 'Power' },
    centerX: { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: 'Center X' },
    centerY: { value: 0.7, min: 0.0, max: 1.0, step: 0.01, label: 'Center Y' },
    gradientScale: { value: 1.0, min: 0.1, max: 2.0, step: 0.1, label: 'Scale' }
  });

  // Create TSL shader material
  const material = useMemo(() => {
    // Convert hex colors to RGB
    const centerColorRGB = new THREE.Color(centerColor);
    const edgeColorRGB = new THREE.Color(edgeColor);

    // Create uniforms
    const uCenterColor = uniform(vec3(centerColorRGB.r, centerColorRGB.g, centerColorRGB.b));
    const uEdgeColor = uniform(vec3(edgeColorRGB.r, edgeColorRGB.g, edgeColorRGB.b));
    const uGradientIntensity = uniform(gradientIntensity);
    const uGradientPower = uniform(gradientPower);
    const uCenter = uniform(vec2(centerX, centerY));
    const uGradientScale = uniform(gradientScale);

    // Create the gradient effect using TSL
    const vUv = varying(uv());
    
    // Calculate distance from center
    const center = uCenter.mul(uGradientScale);
    const dist = length(vUv.sub(center));
    
    // Create radial gradient
    const gradient = smoothstep(0.0, 1.0, pow(dist.mul(uGradientIntensity), uGradientPower));
    const clampedGradient = clamp(gradient, 0.0, 1.0);
    
    // Mix colors based on gradient
    const finalColor = mix(uCenterColor, uEdgeColor, clampedGradient);

    // Create material using THREE.MeshBasicNodeMaterial
    const mat = new THREE.MeshBasicNodeMaterial();
    mat.colorNode = finalColor;
    mat.side = THREE.DoubleSide;
    mat.depthWrite = false;
    mat.depthTest = false;

    return mat;
  }, [centerColor, edgeColor, gradientIntensity, gradientPower, centerX, centerY, gradientScale]);

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -50]}
      renderOrder={-1}
      material={material}
    >
      <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
    </mesh>
  );
};

export default GradientBackground;
