import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../../store";

const PlaceIndicator = () => {
  const outer = useRef();
  const group = useRef();
  const { nodes, materials } = useGLTF("/place.glb");
  const { placed, setPlacePosition } = useStore();

  useFrame((state) => {
    if (outer.current && group.current) {
      outer.current.rotation.y += 0.04;

      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        state.camera.rotation.y * 2 * -1,
        0.1
      );

      group.current.position.z = THREE.MathUtils.lerp(
        group.current.position.z,
        (state.camera.rotation.x * 3 + 4.2) * -1,
        0.1
      );
    }
  });

  useEffect(() => {
    if (placed) {
      setPlacePosition(group.current.position);
    }
  }, [placed, setPlacePosition]);

  return (
    <group ref={group} position={[0, 0, -3]} dispose={null}>
      <mesh
        ref={outer}
        castShadow
        receiveShadow
        geometry={nodes.Circle_1.geometry}
        material={materials.white}
      >
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Circle_2.geometry}
        material={materials.transparant}
      >
        <meshBasicMaterial transparent opacity={0.2} color="white" />
      </mesh>
    </group>
  );
};

export default PlaceIndicator;
