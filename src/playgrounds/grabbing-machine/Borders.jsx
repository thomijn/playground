import { useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useState } from "react";

export default function Borders() {
  const { viewport } = useThree();
  const [close, setClose] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setClose(true);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/* Bottom border */}
      <RigidBody position={[0, (-viewport.height / 2) - 19.06, 0]} rotation={[-Math.PI / 2, 0, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, 6, 1]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Left border */}
      <RigidBody position={[-viewport.width / 2 - 0, -19.06, 0]} rotation={[0, Math.PI / 2, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 0, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Right border */}
      <RigidBody position={[viewport.width / 2 + 0, -19.06, 0]} rotation={[0, -Math.PI / 2, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 0, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Back border */}
      <RigidBody position={[0, -19.06, -3]} rotation={[0, 0, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, 100, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Front border */}
      <RigidBody position={[0, -19.06, 3]} rotation={[0, -Math.PI, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Top section borders */}
      <RigidBody position={[0, -viewport.height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, 6, 1]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      <RigidBody position={[-viewport.width / 2 - 0, 0, 0]} rotation={[0, Math.PI / 2, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 20, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      <RigidBody position={[viewport.width / 2 + 0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 20, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      <RigidBody position={[0, 0, -3]} rotation={[0, 0, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 20, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      <RigidBody position={[0, 0, 3]} rotation={[0, -Math.PI, 0]} colliders="cuboid">
        <mesh>
          <planeGeometry args={[viewport.width, viewport.height + 20, 10]} />
          <shadowMaterial transparent opacity={0.2} />
        </mesh>
      </RigidBody>

      {/* Closing top border after 3 seconds */}
      {close && (
        <RigidBody position={[0, viewport.height / 2, 0]} rotation={[Math.PI / 2, 0, 0]} colliders="cuboid">
          <mesh>
            <planeGeometry args={[viewport.width, 6, 1]} />
            <shadowMaterial transparent opacity={0.2} />
          </mesh>
        </RigidBody>
      )}
    </>
  );
}
