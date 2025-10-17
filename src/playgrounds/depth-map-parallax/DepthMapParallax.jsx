import { useTexture, useAspect } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useState, useRef, useMemo } from "react";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import * as THREE from "three/webgpu";
import {
  texture,
  uv,
  uniform,
  vec2,
  vec3,
  vec4,
  float,
  mix,
  sin,
  cos,
  time,
  smoothstep,
  abs,
  oneMinus,
  mod,
  nodeProxy,
  fract,
  blendScreen,
  mx_cell_noise_float,
} from "three/tsl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import WebGPUCanvas from "../webgpu/WebGPUCanvas";

extend(THREE);

// Dimensions from the example
const WIDTH = 1600;
const HEIGHT = 900;

function ScanningPlane() {
  const meshRef = useRef();
  const [isTexturesLoaded, setIsTexturesLoaded] = useState(false);

  // Load textures from the depth-parallax folder
  const [rawMap, depthMap] = useTexture(["/depth-parallax/barcode1.webp", "/depth-parallax/depthmap.png"], () => {
    setIsTexturesLoaded(true);
  });

  // Set color space for the main texture when loaded
  if (rawMap && depthMap) {
    rawMap.colorSpace = THREE.SRGBColorSpace;
  }

  // Create persistent uniforms that won't be recreated
  const uniformsRef = useRef({
    uPointer: uniform(new THREE.Vector2(0, 0)),
    uProgress: uniform(0),
  });

  // Create material using persistent uniforms
  const material = useMemo(() => {
    if (!isTexturesLoaded || !rawMap || !depthMap) {
      // Return a simple material while textures are loading
      return new THREE.MeshBasicNodeMaterial({
        colorNode: vec3(0.1, 0.1, 0.1),
        transparent: false,
      });
    }

    const { uPointer, uProgress } = uniformsRef.current;
    const strength = 0.01;

    // Get depth texture first
    const tDepthMap = texture(depthMap);

    // Create displaced texture using depth map
    const tMap = texture(rawMap, uv().add(tDepthMap.r.mul(uPointer).mul(strength)));

    // Calculate aspect ratio
    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    // Procedural grid generation
    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    // Cell noise for brightness variation
    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    // Create dot pattern
    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    // Use the depth texture for scanning
    const depth = tDepthMap;
    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    // Create the scanning mask with red color
    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    // Blend the displaced image with the scanning mask
    const final = blendScreen(tMap, mask);

    return new THREE.MeshBasicNodeMaterial({
      colorNode: final,
    });
  }, [rawMap, depthMap, isTexturesLoaded]);

  // Animate the scanning effect with GSAP using persistent uniforms
  useGSAP(() => {
    console.log("Starting GSAP animation");
    const tl = gsap.to(uniformsRef.current.uProgress, {
      value: 1,
      repeat: -1,
      duration: 3,
      ease: "power1.out",
      onUpdate: () => {
        // console.log("GSAP progress:", uniformsRef.current.uProgress.value);
      },
    });

    return () => {
      console.log("Cleaning up GSAP animation");
      tl.kill();
    };
  }, [isTexturesLoaded]); // Only restart when textures load

  // Track pointer position using persistent uniforms
  useFrame(({ pointer, clock }) => {
    uniformsRef.current.uPointer.value = pointer;
  });

  // Use aspect ratio for proper scaling
  const [w, h] = useAspect(WIDTH, HEIGHT);

  return (
    <mesh ref={meshRef} scale={[w, h, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
}

export default function DepthMapParallax() {
  return (
    <WebGPUCanvas>
      <ScanningPlane />
    </WebGPUCanvas>
  );
}
