import { Plane, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { createDerivedMaterial } from "troika-three-utils";

// Text constants
const TEXT_CONSTANTS = {
  fontSize: 0.7,
  maxWidth: 8,
  lineHeight: 1.1,
  text: "A new paradigm for client interaction"
};

// Gradient text constants
const GRADIENT_CONSTANTS = {
  color1: "#ff790b",
  color2: "#ff33db",
  color3: "#33c2ff",
  dampingFactor: 0.05,
  maxDistance: 2,
  minOpacity: 0.0,
  maxOpacity: 1.0,
  outlineWidth: 0.01,
  outlineBlur: 0.1,
  outlineOpacity: 0.8,
  outlineColor: "#ff33cc"
};

// Dots constants
const DOTS_CONSTANTS = {
  dotDensity: 19,
  dotSize: 0.12,
  dotColor: "#efefef",
  planeOpacity: 1.0,
  mouseRadius: 0.2,
  mouseLerpFactor: 0.03
};

// Shader source code
const DOTS_SHADER = {
  vertexShader: `
    varying vec2 vUv;
    varying vec2 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uDotDensity;
    uniform float uDotSize;
    uniform vec3 uDotColor;
    uniform float uPlaneOpacity;
    uniform vec2 uMouse;
    uniform float uMouseRadius;
    varying vec2 vUv;
    varying vec2 vPosition;

    void main() {
      vec2 aspectRatio = uResolution.x > uResolution.y 
          ? vec2(uResolution.x/uResolution.y, 1.0)
          : vec2(1.0, uResolution.y/uResolution.x);
      
      vec2 scaledUV = vUv * uDotDensity * aspectRatio;
      
      vec2 gridUV = fract(scaledUV);
      vec2 cellID = floor(scaledUV);

      float mouseDistance = length(vUv - uMouse);
      float mouseInfluence = 1.0 - smoothstep(0.0, uMouseRadius, mouseDistance);
      
      float dist = distance(gridUV, vec2(0.5, 0.5));
      float dotFactor = smoothstep(uDotSize, uDotSize - 0.05, dist);
      
      float opacity = mix(0.2, 0.8, mouseInfluence);

      float distanceToCenter = distance(vUv, vec2(0.5, 0.5));
      float centerInfluence = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
      opacity = mix(opacity, 0.0, centerInfluence);
      
      vec3 finalColor = mix(vec3(1.0), uDotColor, dotFactor);
      gl_FragColor = vec4(finalColor, dotFactor * opacity);
    }
  `
};

const GlowText = () => {
  return (
    <>
      <Canvas>
        <group position={[0, 0, 0.1]}>
          <TextGradient />
          <TextRaw />
        </group>
        <DotsPlane />
      </Canvas>
    </>
  );
};

const TextGradient = () => {
  const mouseRef = useRef({
    current: new THREE.Vector2(0.5, 0.5),
    target: new THREE.Vector2(0.5, 0.5),
  });

  const { color1, color2, color3, dampingFactor, maxDistance, minOpacity, maxOpacity, outlineWidth, outlineBlur, outlineOpacity } = GRADIENT_CONSTANTS;

  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const customMaterial = createDerivedMaterial(baseMaterial, {
    timeUniform: "elapsed",
    uniforms: {
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uColor3: { value: new THREE.Color(color3) },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMaxDist: { value: maxDistance },
      uMinOpacity: { value: minOpacity },
      uMaxOpacity: { value: maxOpacity },
      uTime: { value: 0 },
    },
    vertexDefs: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
    `,
    vertexTransform: `
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    `,
    fragmentDefs: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform vec2 uMouse;
      uniform float uMaxDist;
      uniform float uMinOpacity;
      uniform float uMaxOpacity;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uTime;

      float getDistanceToMouse() {
        vec3 mouseWorldPos = vec3(uMouse.x, uMouse.y, 0.0);
        return distance(vWorldPos.xy, mouseWorldPos.xy);
      }

      float getWaveOpacity() {
        float speed = 0.8;
        float width = 1.0;
        float x = vUv.x - mod(uTime * speed, 3.0) + 1.0;
        return smoothstep(0.0, width, 1.0 - abs(x));
      }
    `,
    fragmentColorTransform: `
      // Create two gradients and mix them based on position
      vec3 firstHalf = mix(uColor1, uColor2, smoothstep(0.0, 0.5, vUv.x));
      vec3 secondHalf = mix(uColor2, uColor3, smoothstep(0.5, 1.0, vUv.x));
      vec3 gradientColor = mix(firstHalf, secondHalf, step(0.5, vUv.x));
      
      // Calculate real world distance and convert to opacity
      float dist = getDistanceToMouse();
      float mouseOpacity = mix(uMaxOpacity, uMinOpacity, smoothstep(0.0, uMaxDist, dist));
      
      // Add wave opacity
      float waveOpacity = getWaveOpacity() * 1.0; // Adjust the 0.4 multiplier to control wave intensity
      float finalOpacity = max(mouseOpacity, waveOpacity);
      
      gradientColor *= 1.5;
      
      gl_FragColor = vec4(gradientColor, finalOpacity);
    `,
  });

  // Track mouse position and update time with damping
  useFrame((state) => {
    if (customMaterial.uniforms) {
      // Get mouse position in world coordinates
      const vector = new THREE.Vector3((state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0);

      // Update target position
      mouseRef.current.target.set(vector.x, vector.y);

      // Lerp current position towards target
      mouseRef.current.current.lerp(mouseRef.current.target, dampingFactor);

      // Update shader uniforms
      customMaterial.uniforms.uMouse.value.set(mouseRef.current.current.x, mouseRef.current.current.y, 0);
      customMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
      customMaterial.uniforms.uMaxDist.value = maxDistance;
      customMaterial.uniforms.uMinOpacity.value = minOpacity;
      customMaterial.uniforms.uMaxOpacity.value = maxOpacity;
    }
  });

  return (
    <Text
      lineHeight={TEXT_CONSTANTS.lineHeight}
      material={customMaterial}
      fontSize={TEXT_CONSTANTS.fontSize + 0.005}
      maxWidth={TEXT_CONSTANTS.maxWidth}
      font="/inter.ttf"
      textAlign="center"
      color={"black"}
      outlineWidth={outlineWidth}
      outlineBlur={outlineBlur}
      outlineOpacity={1.0}
      outlineColor={GRADIENT_CONSTANTS.outlineColor}
    >
      {TEXT_CONSTANTS.text}
    </Text>
  );
};

const TextRaw = () => {
  return (
    <Text lineHeight={TEXT_CONSTANTS.lineHeight} font="/inter.ttf" fontSize={TEXT_CONSTANTS.fontSize} maxWidth={TEXT_CONSTANTS.maxWidth} textAlign="center" color={"black"}>
      {TEXT_CONSTANTS.text}
    </Text>
  );
};

const DotsPlane = () => {
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  
  // Create shader material with uniforms
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: DOTS_SHADER.vertexShader,
      fragmentShader: DOTS_SHADER.fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uDotDensity: { value: DOTS_CONSTANTS.dotDensity },
        uDotSize: { value: DOTS_CONSTANTS.dotSize },
        uDotColor: { value: new THREE.Color(DOTS_CONSTANTS.dotColor) },
        uPlaneOpacity: { value: DOTS_CONSTANTS.planeOpacity },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseRadius: { value: DOTS_CONSTANTS.mouseRadius }
      }
    });
  }, [size]);

  // Update uniforms on frame
  useFrame((state) => {
    const x = state.pointer.x / 2 + 0.5;
    const y = state.pointer.y / 2 + 0.5;
    material.uniforms.uMouse.value.lerp(new THREE.Vector2(x, y), DOTS_CONSTANTS.mouseLerpFactor);
  });

  return (
    <Plane args={[viewport.width, viewport.height]} position={[0, 0, 0]}>
      <primitive object={material} attach="material" />
    </Plane>
  );
};

export default GlowText;
