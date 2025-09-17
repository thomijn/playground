"use client";
import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useState } from "react";
import { MathUtils } from "three";
import { color, mix, positionWorld, uniform, uv, vec3, mul, time, hash, oscSquare, oscSine, oscSawtooth } from "three/tsl";
import { texture } from "three/tsl";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Basic component showing how to add smooth hover interactivity with TSL

const InteractiveSphere = () => {
  const [isPointerOver, setIsPointerOver] = useState(false);

  // Load the noise texture
  const noiseTexture = useTexture("/perlin.png");
  noiseTexture.wrapS = THREE.RepeatWrapping;
  noiseTexture.wrapT = THREE.RepeatWrapping;

  const { key, colorNode, positionNode, uHovered, transmissionNode, roughnessNode } = useMemo(() => {
    // Define a uniform for the hover value
    const uHovered = uniform(0.0);

    // Create color gradients on the Y axis (bottom to top of the sphere)
    const defaultColor = mix(color("#3F4A4B"), color("#7A8B8C"), uv().y);
    const hoverColor = mix(color("#14DCE9"), color("#B462D1"), uv().y);

    // Mix between two default and hovered colors based on the hover value
    const colorNode = mix(defaultColor, hoverColor, uHovered);

    // Create a TSL node from the noise texture
    const noiseNode = texture(noiseTexture, uv().sub(time.div(10.0)));

    // Translate the sphere along the Z axis based on the hover value (between 0 and 1)
    const positionNode = positionWorld;

    // Use the noise to modulate transmission and roughness
    const transmissionNode = mix(0.2, 1.0, noiseNode.r); // More transmission where noise is bright
    const roughnessNode = mix(0.8, 0.1, noiseNode.r); // Less rough where noise is bright

    // Generate a key for the material so that it updates when this data changes
    const key = colorNode.uuid;
    return { key, colorNode, positionNode, uHovered, transmissionNode, roughnessNode };
  }, [noiseTexture]);

  // When hovered, smoothly transition to 1.0, otherwise back to 0.0
  useFrame((_, delta) => {
    uHovered.value = MathUtils.damp(uHovered.value, isPointerOver ? 1.0 : 0.0, 5, delta);
  });

  return (
    <Sphere
      position={[0, 0, 0]}
      args={[1.5, 128, 128]}
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
        setIsPointerOver(true);
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "auto";
        setIsPointerOver(false);
      }}
    >
      {/* Using the Physical Node material for advanced transmission/roughness */}
      <meshPhysicalNodeMaterial
        key={key}
        transparent
        // colorNode={colorNode}
        positionNode={positionNode}
        transmissionNode={transmissionNode}
        roughnessNode={roughnessNode}
        ior={1.5}
        thickness={0.5}
      />
    </Sphere>
  );
};

export default InteractiveSphere;
