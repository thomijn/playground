import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { MOBILE_SETTINGS } from "./constants";

export default function CinnamonLogo({ position, scale = 1, ...props }) {
  const api = useRef();
  const { viewport } = useThree();
  const { nodes } = useGLTF("/cinnamon/cinnamon-logo.glb");
  
  // Leva controls for logo color
  const { logoColor } = useControls("Cinnamon Logo", {
    logoColor: { value: "#ff6b35", label: "Logo Color" },
  });
  
  // Calculate initial position if not provided
  const pos = useMemo(() => {
    if (position) return position;
    
    const mobile = window.innerWidth < MOBILE_SETTINGS.BREAKPOINT;
    const safeMargin = mobile ? MOBILE_SETTINGS.SAFE_MARGIN : MOBILE_SETTINGS.DESKTOP_SAFE_MARGIN;
    const maxX = viewport.width / 2 - safeMargin;
    const maxY = viewport.height / 2 - safeMargin;
    const maxZ = mobile ? 1 : 2;
    
    return [
      (Math.random() - 0.5) * 2 * maxX,
      (Math.random() - 0.5) * 2 * maxY + 2,
      (Math.random() - 0.5) * 2 * maxZ,
    ];
  }, [position, viewport.width, viewport.height]);
  
  // Limit angular velocity to prevent excessive spinning
  useFrame(() => {
    if (api.current) {
      const maxAngularVel = 5;
      const angVel = api.current.angvel();
      
      if (
        Math.abs(angVel.x) > maxAngularVel ||
        Math.abs(angVel.y) > maxAngularVel ||
        Math.abs(angVel.z) > maxAngularVel
      ) {
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
      ref={api}
      position={[0, 0, 0]}
      type="fixed"
      linearDamping={4}
      angularDamping={1}
      friction={0.1}
      restitution={0.5}
      colliders="hull"
      {...props}
    >
      <group scale={scale}>
        <mesh geometry={nodes.Curve.geometry}>
          <meshStandardMaterial 
            color={logoColor}
            roughness={0.8}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Preload the model
useGLTF.preload("/cinnamon/cinnamon-logo.glb");
