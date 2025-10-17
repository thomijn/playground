import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { PHYSICS_SETTINGS } from "./constants";

export default function Sphere({ 
  position, 
  children, 
  vec = new THREE.Vector3(), 
  scale, 
  r = THREE.MathUtils.randFloatSpread, 
  accent, 
  accents, 
  color,
  ...props 
}) {
  const api = useRef();
  const ref = useRef();
  const { nodes } = useGLTF("/cinnamon/ball.glb");
  
  const pos = useMemo(() => position || [r(10), r(10), r(2)], [position, r]);
  
  const ballColor = useMemo(() => {
    if (color) return color;
    if (accents && accents.length > 0) {
      return accents[Math.floor(Math.random() * accents.length)];
    }
    return "white";
  }, [accents, color]);

  // Limit angular velocity to prevent excessive spinning
  useFrame(() => {
    if (api.current) {
      const maxAngularVel = PHYSICS_SETTINGS.MAX_ANGULAR_VELOCITY;
      const angVel = api.current.angvel();

      const needsLimiting = 
        Math.abs(angVel.x) > maxAngularVel ||
        Math.abs(angVel.y) > maxAngularVel ||
        Math.abs(angVel.z) > maxAngularVel;

      if (needsLimiting) {
        api.current.setAngvel(
          {
            x: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.x)),
            y: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.y)),
            z: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.z)),
          },
          true
        );
      }
    }
  });

  return (
    <RigidBody 
      linearDamping={PHYSICS_SETTINGS.LINEAR_DAMPING} 
      angularDamping={PHYSICS_SETTINGS.ANGULAR_DAMPING} 
      friction={PHYSICS_SETTINGS.FRICTION} 
      position={pos} 
      ref={api} 
      colliders={false}
      {...props}
    >
      <BallCollider args={[1]} />
      <group ref={ref} scale={scale || 0.8}>
        {nodes?.Icosphere && (
          <>
            <mesh geometry={nodes.Icosphere.geometry}>
              <meshStandardMaterial 
                color="white" 
                opacity={0.3} 
                transparent 
                metalness={0.5} 
                roughness={0.5} 
              />
            </mesh>
            <mesh geometry={nodes.Icosphere_1.geometry}>
              <meshStandardMaterial 
                color={ballColor} 
                roughness={0.2} 
                metalness={0} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          </>
        )}
      </group>
      {children}
    </RigidBody>
  );
}
