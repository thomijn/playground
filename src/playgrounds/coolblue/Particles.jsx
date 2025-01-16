import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Vector3, Vector2, Color } from "three";
import * as THREE from "three";
import vertexShader from "./shaders/particles/vertex.glsl";
import fragmentShader from "./shaders/particles/fragment.glsl";
import { useControls } from "leva";
import { animate } from "framer-motion";

// Dust component to render particles
function DustParticles({ position, opened }) {
  const pointsRef = useRef();
  const { size, viewport, camera } = useThree();
  const texture = useMemo(() => new THREE.TextureLoader().load("/particle.png"), []);
  const controls = useControls("particles", {
    numParticles: {
      value: 30,
      min: 10,
      max: 1000,
      step: 10,
    },
    particleSize: {
      value: 15,
      min: 10,
      max: 200,
      step: 5,
    },
    revealProgress: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });

  const positions = useMemo(() => {
    const array = new Float32Array(controls.numParticles * 3);
    for (let i = 0; i < controls.numParticles; i++) {
      array[i * 3 + 0] = ((Math.random() - 0.5) * camera.far) / 500;
      array[i * 3 + 1] = ((Math.random() - 0.5) * camera.far) / 500;
      array[i * 3 + 2] = ((Math.random() - 0.5) * camera.far) / 500;
    }
    return array;
  }, [controls.numParticles, camera]);

  useEffect(() => {
    if (opened) {
      animate(
        pointsRef.current.material.uniforms.uRevealProgress,
        {
          value: 1,
        },
        {
          type: "linear",
          duration: 0.8,
          delay: 2,
        }
      );
    }
  }, [opened]);

  useFrame(({ clock }, delta) => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      pointsRef.current.material.uniforms.uParticleSize.value = controls.particleSize;
      // if (!characterRef.current) return;
      // const translation = characterRef.current.translation();
      // const pos = new THREE.Vector3(translation.x, translation.y, translation.z);
      // pointsRef.current.material.uniforms.uCharacterPosition.value = pos;
    }
  });

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: window.devicePixelRatio / 2 },
        uAlpha: { value: 1 },
        uCameraNear: { value: camera.near },
        uCameraFar: { value: camera.far },
        uResolution: { value: new Vector2(size.width, size.height) },
        tMap: { value: texture },
        uParticleSize: { value: controls.particleSize },
        uRevealProgress: { value: 0 },
        uCharacterPosition: { value: new Vector3(0, 0, 0) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    [controls.particleSize, camera, size, texture]
  );

  return (
    <points ref={pointsRef} position={[position.x || 0, 1, position.z || 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial args={[shaderArgs]} />
    </points>
  );
}

export default DustParticles;
