import React, { useRef, useMemo } from "react";
import { useGLTF, useMatcapTexture } from "@react-three/drei";
import { MeshMatcapNodeMaterial } from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import { vec4 } from "three/tsl";
import * as THREE from "three";
import { useControls } from "leva";

const Clouds = () => {
  const { nodes, materials } = useGLTF("/inis-stor/ireland.glb");
  const [matcap] = useMatcapTexture("DFDBB7_F9F8E3_B5AF86_BCBC8C", 1024);

  const cloud1Ref = useRef(null);
  const cloud2Ref = useRef(null);

  // Leva controls for rain
  const rainControls = useControls("Rain", {
    enabled: { value: true, label: "Enable Rain" },
    particleCount: { value: 150, min: 50, max: 500, step: 10, label: "Particle Count" },
    color: { value: "#6b8ba8", label: "Color" },
    opacity: { value: 1, min: 0, max: 1, step: 0.05, label: "Opacity" },
    size: { value: 50, min: 0.1, max: 50, step: 0.1, label: "Size" },
    sizeAttenuation: { value: false, label: "Size Attenuation" },
    minSpeed: { value: 0.02, min: 0.01, max: 0.1, step: 0.005, label: "Min Speed" },
    maxSpeed: { value: 0.05, min: 0.01, max: 0.15, step: 0.005, label: "Max Speed" },
    spawnRadius: { value: 1.5, min: 0.1, max: 10, step: 0.1, label: "Spawn Radius" },
    resetThreshold: { value: -2, min: -20, max: 5, step: 0.5, label: "Reset Height" },
    yOffset: { value: 0, min: -5, max: 5, step: 0.1, label: "Y Offset" },
  });

  // Rain particle refs
  const rain1Ref = useRef(null);
  const rain2Ref = useRef(null);
  const rain1VelocitiesRef = useRef(null);
  const rain2VelocitiesRef = useRef(null);

  const material = useMemo(() => {
    if (!matcap) return null;

    const mat = new MeshMatcapNodeMaterial({
      matcap: matcap,
    });
    return mat;
  }, [matcap]);

  // Create rain particle geometry and velocities
  const { rainGeometry1, rainGeometry2, rainVelocities1, rainVelocities2 } = useMemo(() => {
    const createRainSystem = () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(rainControls.particleCount * 3);
      const velocities = new Float32Array(rainControls.particleCount);

      for (let i = 0; i < rainControls.particleCount; i++) {
        // Random position in circular area - will be updated to cloud position in useFrame
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * rainControls.spawnRadius;

        positions[i * 3 + 0] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = -Math.random() * 3; // y (below cloud)
        positions[i * 3 + 2] = Math.sin(angle) * radius; // z

        // Random fall speed
        velocities[i] = rainControls.minSpeed + Math.random() * (rainControls.maxSpeed - rainControls.minSpeed);
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return { geometry, velocities };
    };

    const rain1 = createRainSystem();
    const rain2 = createRainSystem();

    return {
      rainGeometry1: rain1.geometry,
      rainGeometry2: rain2.geometry,
      rainVelocities1: rain1.velocities,
      rainVelocities2: rain2.velocities,
    };
  }, [rainControls.particleCount, rainControls.spawnRadius, rainControls.minSpeed, rainControls.maxSpeed]);

  // Store velocities in refs
  if (!rain1VelocitiesRef.current) rain1VelocitiesRef.current = rainVelocities1;
  if (!rain2VelocitiesRef.current) rain2VelocitiesRef.current = rainVelocities2;

  // Rain material
  const rainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(rainControls.color),
      size: rainControls.size,
      transparent: true,
      opacity: rainControls.opacity,
      sizeAttenuation: rainControls.sizeAttenuation,
      depthWrite: false,
      depthTest: false,
    });
  }, [rainControls.color, rainControls.size, rainControls.opacity, rainControls.sizeAttenuation]);

  useFrame(() => {
    // Rotate clouds
    if (cloud1Ref.current) {
      cloud1Ref.current.rotation.y += 0.0001;
    }
    if (cloud2Ref.current) {
      cloud2Ref.current.rotation.y += 0.0001;
    }

    // Animate rain particles
    if (rainControls.enabled && rain1Ref.current && rain2Ref.current && cloud1Ref.current && cloud2Ref.current) {
      const updateRain = (rainRef, velocitiesRef, cloudMesh) => {
        const positions = rainRef.geometry.attributes.position.array;
        const velocities = velocitiesRef.current;

        // Get cloud's world position
        const cloudWorldPos = new THREE.Vector3();
        cloudMesh.getWorldPosition(cloudWorldPos);

        for (let i = 0; i < rainControls.particleCount; i++) {
          // Update Y position based on velocity
          positions[i * 3 + 1] -= velocities[i];

          // Reset particle if it falls below threshold
          if (positions[i * 3 + 1] < rainControls.resetThreshold) {
            // Reset to random position under cloud
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * rainControls.spawnRadius;

            positions[i * 3 + 0] = cloudWorldPos.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = cloudWorldPos.y + rainControls.yOffset;
            positions[i * 3 + 2] = cloudWorldPos.z + Math.sin(angle) * radius;

            // Randomize velocity slightly
            velocities[i] = rainControls.minSpeed + Math.random() * (rainControls.maxSpeed - rainControls.minSpeed);
          }
        }

        rainRef.geometry.attributes.position.needsUpdate = true;
      };

      updateRain(rain1Ref.current, rain1VelocitiesRef, cloud1Ref.current);
      updateRain(rain2Ref.current, rain2VelocitiesRef, cloud2Ref.current);
    }
  });
  if (!material) return null;

  return (
    <>
      <mesh geometry={nodes.cloud1.geometry} ref={cloud1Ref} material={material} />
      <mesh geometry={nodes.cloud2.geometry} ref={cloud2Ref} material={material} />

      {/* {rainControls.enabled && (
        <group position={[0, 1, 0]} scale={3}>
          <points ref={rain1Ref} geometry={rainGeometry1} material={rainMaterial} frustumCulled={false} />
          <points ref={rain2Ref} geometry={rainGeometry2} material={rainMaterial} frustumCulled={false} />
        </group>
      )} */}
    </>
  );
};

export default Clouds;
