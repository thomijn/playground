import { Sphere, useGLTF } from "@react-three/drei";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { RigidBody, CuboidCollider, useRopeJoint, BallCollider } from "@react-three/rapier";
import { useRef, useState } from "react";
import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { MOBILE_SETTINGS } from "./constants";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function ClawMachine() {
  const rodRef = useRef();
  const j1 = useRef(); // Single joint segment
  const clawGroupRef = useRef();
  const { viewport } = useThree();
  const vec = new THREE.Vector3();
  const currentX = useRef(0);
  const currentY = useRef(0);

  const { nodes } = useGLTF("/cinnamon/claw.glb");
  
  // Determine if mobile and calculate appropriate scale
  const mobile = window.innerWidth < MOBILE_SETTINGS.BREAKPOINT;
  const clawScale = mobile ? MOBILE_SETTINGS.CLAW_SCALE : MOBILE_SETTINGS.DESKTOP_CLAW_SCALE;
  // Segment properties for stable physics - more controlled movement
  const segmentProps = {
    type: "dynamic",
    canSleep: false, // Prevent claw from going to sleep
    colliders: false,
    angularDamping: 8, // Much higher damping to reduce swinging
    linearDamping: 1,  // Higher linear damping for slower movement
    mass: 15,          // Add some mass to make it more stable
  };

  // Create simple rope joint chain with just one intermediate segment - much closer
  useRopeJoint(rodRef, j1, [[0, -2.5, 0], [0, 0, 0], 0.15]); // Rod to joint segment - shorter rope for less swing
  useRopeJoint(j1, clawGroupRef, [[0, 0, 0], [0, 0.5, 0], 0.2]); // Joint segment to claw - shorter rope for control

  // Track mouse movement and update rod position
  useFrame(({ mouse }) => {
    if (rodRef.current) {
      // Convert normalized mouse coordinates (-1 to 1) to world coordinates
      // Limit movement to stay within the frame bounds
      const maxX = viewport.width / 2 - 1; // Leave some margin
      const targetX = (mouse.x / 2) * viewport.width;
      const clampedTargetX = Math.max(-maxX, Math.min(maxX, targetX));

      // Map mouse Y (-1 to 1) to rod movement range
      // mouse.y = 1 (top) should be highest position, mouse.y = -1 (bottom) should be lowest
      const maxY = viewport.height / 1.7; // Top position
      const minY = viewport.height / 1.7 - 3; // Bottom position (3 units down)
      const mouseYNormalized = (mouse.y + 1) / 2; // Convert from [-1,1] to [0,1]
      const targetY = minY + mouseYNormalized * (maxY - minY); // Map to [minY, maxY]
      const clampedTargetY = Math.max(minY, Math.min(maxY, targetY));

      // Smooth lerp movement
      currentX.current = THREE.MathUtils.lerp(currentX.current, clampedTargetX, 0.05);
      currentY.current = THREE.MathUtils.lerp(currentY.current, clampedTargetY, 0.05);

      // Use setNextKinematicTranslation for proper kinematic body movement
      rodRef.current.setNextKinematicTranslation(vec.set(currentX.current, currentY.current, 0));
        j1.current.setNextKinematicTranslation(vec.set(currentX.current, currentY.current - 2.7, 0));
    }
  });

  return (
    <group>
      {/* Rod - fixed at the top, moves left and right */}
      <RigidBody type="kinematicPosition" ref={rodRef} position={[0, viewport.height / 1.7, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 5, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </mesh>
        <Sphere args={[0.2]} position={[0, -2.5, 0]} >
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </Sphere>
        <CuboidCollider args={[0.1, 2.5, 0.1]} />
      </RigidBody>

      {/* Single joint segment for stable connection - positioned much closer */}
      <RigidBody ref={j1} position={[0, viewport.height / 1.7 - 2.7, 0]} type="kinematicPosition">
        <BallCollider args={[0.05]} />
      </RigidBody>

      {/* Claw Group - connected via rope joint chain - positioned much closer */}
      <RigidBody ref={clawGroupRef} position={[0, viewport.height / 1.7, 0]} {...segmentProps}>
        {nodes.claw ? (
          <mesh geometry={nodes.claw.geometry} material={nodes.claw.material} scale={clawScale} />
        ) : (
          // Fallback claw if model doesn't load
          <group scale={clawScale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
            </mesh>
            {[0, 1, 2].map((i) => {
              const angle = (i / 3) * Math.PI * 2;
              const x = Math.cos(angle) * 0.5;
              const z = Math.sin(angle) * 0.5;
              return (
                <mesh key={i} position={[x, -0.5, z]} rotation={[0, angle, Math.PI / 6]}>
                  <boxGeometry args={[0.1, 1, 0.05]} />
                  <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
                </mesh>
              );
            })}
          </group>
        )}
        <CuboidCollider args={[clawScale * 0.4, clawScale * 0.4, clawScale * 0.4]} position={[0, -0.4, 0]} />
      </RigidBody>
    </group>
  );
}
