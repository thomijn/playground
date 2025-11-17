import React, { useMemo, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { positionWorld, uniform, vec2, vec3, vec4, mix, color, mul, add, mx_fractal_noise_vec3, time, texture } from "three/tsl";
import * as THREE from "three/webgpu";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { HeightmapEdgeMaterial } from "./HeightmapEdgeMaterial";

export function Sea(props) {
  const { nodes, materials } = useGLTF("/inis-stor/ireland.glb");

  const edgeMap = useTexture("/inis-stor/height-map.webp");

  // Leva controls for the sea material
  const { seaColor1, seaColor2, seaNoiseScale, seaNoiseAmplitude, seaNoiseOctaves, seaMixThreshold, seaMixSmoothness, animated, animationSpeed, edgeColor } =
    useControls("Sea Material", {
      seaColor1: { value: "#0a4e49", label: "Color 1" },
      seaColor2: { value: "#083b37", label: "Color 2" },
      seaNoiseScale: { value: 0.4, min: 0.1, max: 10, step: 0.1, label: "Noise Scale" },
      seaNoiseAmplitude: { value: 0.7, min: 0, max: 5, step: 0.1, label: "Noise Amplitude" },
      seaNoiseOctaves: { value: 2, min: 1, max: 8, step: 1, label: "Noise Octaves" },
      seaMixThreshold: { value: 0, min: 0, max: 1, step: 0.01, label: "Mix Threshold" },
      seaMixSmoothness: { value: 1, min: 0.01, max: 1, step: 0.01, label: "Mix Smoothness" },
      animated: { value: true, label: "Animate" },
      animationSpeed: { value: 0.4, min: 0, max: 2, step: 0.1, label: "Animation Speed" },
      edgeColor: { value: "#6abab4", label: "Edge Color" },
    });

  // Create uniforms that persist across renders
  const uniforms = useMemo(
    () => ({
      uSeaColor1: uniform(new THREE.Color(seaColor1)),
      uSeaColor2: uniform(new THREE.Color(seaColor2)),
      uSeaNoiseScale: uniform(seaNoiseScale),
      uSeaNoiseAmplitude: uniform(seaNoiseAmplitude),
      uSeaNoiseOctaves: uniform(seaNoiseOctaves),
      uSeaMixThreshold: uniform(seaMixThreshold),
      uSeaMixSmoothness: uniform(seaMixSmoothness),
      uAnimationSpeed: uniform(animationSpeed),
      uEdgeColor: uniform(new THREE.Color(edgeColor)),
    }),
    []
  ); // Empty dependency array - create once

  // Update uniforms when Leva controls change
  useEffect(() => {
    uniforms.uSeaColor1.value.set(seaColor1);
    uniforms.uSeaColor2.value.set(seaColor2);
    uniforms.uEdgeColor.value.set(edgeColor);
    uniforms.uSeaNoiseScale.value = seaNoiseScale;
    uniforms.uSeaNoiseAmplitude.value = seaNoiseAmplitude;
    uniforms.uSeaNoiseOctaves.value = seaNoiseOctaves;
    uniforms.uSeaMixThreshold.value = seaMixThreshold;
    uniforms.uSeaMixSmoothness.value = seaMixSmoothness;
    uniforms.uAnimationSpeed.value = animated ? animationSpeed : 0;
  }, [
    seaColor1,
    seaColor2,
    edgeColor,
    seaNoiseScale,
    seaNoiseAmplitude,
    seaNoiseOctaves,
    seaMixThreshold,
    seaMixSmoothness,
    animated,
    animationSpeed,
    uniforms,
  ]);

  // Create the sea material with animated noise
  const material = useMemo(() => {
    const seaMaterial = new MeshBasicNodeMaterial();

    // Get world position
    const worldPos = positionWorld;

    // Create animated position by adding time-based offset
    const animatedPos = add(worldPos, mul(time, uniforms.uAnimationSpeed));

    // Create noise from animated position
    const noiseInput = mul(animatedPos, uniforms.uSeaNoiseScale);
    const noise = mx_fractal_noise_vec3(noiseInput, uniforms.uSeaNoiseOctaves, uniforms.uSeaNoiseAmplitude);

    // Use the x component of the noise for mixing
    const noiseFactor = noise.x;

    // Smooth step mixing between colors based on noise
    const mixAmount = noiseFactor.add(uniforms.uSeaMixThreshold).div(uniforms.uSeaMixSmoothness).smoothstep(0, 1);

    // Mix between two colors
    const finalColor = mix(color(uniforms.uSeaColor1), color(uniforms.uSeaColor2), mixAmount);

    seaMaterial.colorNode = finalColor;

    return seaMaterial;
  }, [uniforms]);

  const colorNode = useMemo(() => {
    const alpha = texture(edgeMap).r;
    const edgeColorNode = color(uniforms.uEdgeColor);
    return vec4(edgeColorNode.r, edgeColorNode.g, edgeColorNode.b, alpha.oneMinus().mul(0.2).clamp(0.0, 0.5));
  }, [uniforms.uEdgeColor]);

  const edgeMaterial = new MeshBasicNodeMaterial({
    colorNode: colorNode,
    transparent: true,
  });

  return (
    <>
      <group {...props} dispose={null} scale={10}>
        <mesh geometry={nodes.sea.geometry} material={material} />
      </group>
      <group position={[0, 0.25, 0]} rotation={[0, 0, 0]} scale={1}>
        <mesh geometry={nodes["edge-map"].geometry}>
          <HeightmapEdgeMaterial useWorldPosition={true} />
        </mesh>

        <mesh geometry={nodes["edge-map"].geometry} material={edgeMaterial} />
      </group>
    </>
  );
}

useGLTF.preload("/inis-stor/ireland-transformed.glb");
