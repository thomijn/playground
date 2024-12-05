import React, { useRef } from "react";
import { MeshTransmissionMaterial, useFBO, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ScrollTrigger from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

// Component for individual mesh with configurable materials
function ConfigurableMesh({ geometry, material, position, rotation, scale, config, index }) {
  const ref = useRef();

  console.log(index);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#wrapper",
        start: "top top",
        end: "bottom end",
        scrub: true,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });

    // rotation each one 360 deg
    tl.to(ref.current.rotation, {
      z: Math.PI * 1,
      y: Math.PI * 1,
      ease: "power3.inOut",
    });
  });

  return (
    <mesh ref={ref} geometry={geometry} material={material}>
      {config.meshPhysicalMaterial ? <meshPhysicalMaterial {...config} /> : <MeshTransmissionMaterial background={new THREE.Color(config.bg)} {...config} />}
    </mesh>
  );
}

// Main Model component
export function Model(props) {
  const { nodes } = useGLTF("/soolax.glb");

  const ref = useRef();

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#wrapper",
        start: "top top",
        end: "bottom end",
        scrub: true,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });

    tl.to(ref.current.rotation, {
      z: Math.PI * 1,
      y: Math.PI * 1,
      ease: "power3.inOut",
    });
  });

  const config = useControls({
    meshPhysicalMaterial: false,
    transmissionSampler: false,
    backside: false,
    samples: { value: 10, min: 1, max: 32, step: 1 },
    resolution: { value: 2048, min: 256, max: 2048, step: 256 },
    transmission: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.15, min: 0, max: 1, step: 0.01 },
    thickness: { value: 1, min: 0, max: 10, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 0.06, min: 0, max: 1 },
    anisotropy: { value: 0.1, min: 0, max: 1, step: 0.01 },
    distortion: { value: 0.0, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 0.3, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.5, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 1, min: 0, max: 1 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: "#ffffff",
    color: "#68ffc0",
    bg: "#beceb9",
  });

  const buffer = useFBO();

  useFrame((state) => {
    state.gl.setRenderTarget(buffer);
    state.gl.render(state.scene, state.camera);
    state.gl.setRenderTarget(null);
  });

  const meshes = [
    {
      geometry: nodes.Cube.geometry,
      material: nodes.Cube.material,
    },
    {
      geometry: nodes.Cube001.geometry,
      material: nodes.Cube001.material,
    },
    {
      geometry: nodes.Cube002.geometry,
      material: nodes.Cube002.material,
    },
    {
      geometry: nodes.Cube003.geometry,
      material: nodes.Cube003.material,
    },
  ];

  return (
    <group {...props} ref={ref} dispose={null}>
      {meshes.map((meshProps, index) => (
        <ConfigurableMesh key={index} index={index} {...meshProps} config={config} />
      ))}
    </group>
  );
}

useGLTF.preload("/soolax.glb");
