import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

const PRIMITIVE_TYPES = {
  BOX: 0,
  TETRAHEDRON: 1,
  OCTAHEDRON: 2,
  DODECAHEDRON: 3
};

export default function RandomPrimitive({ accents }) {
  const meshRef = useRef();
  
  const primitiveType = useMemo(() => 
    Math.floor(Math.random() * 4), 
    []
  );
  
  const rotationSpeed = useMemo(() => [
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ], []);
  
  const scale = useMemo(() => 
    Math.random() * 0.3 + 0.2, 
    []
  );
  
  const accentColor = useMemo(() => {
    if (!accents || accents.length === 0) return "white";
    return accents[Math.floor(Math.random() * accents.length)];
  }, [accents]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0] * delta;
      meshRef.current.rotation.y += rotationSpeed[1] * delta;
      meshRef.current.rotation.z += rotationSpeed[2] * delta;
    }
  });

  const renderGeometry = () => {
    switch (primitiveType) {
      case PRIMITIVE_TYPES.BOX:
        return <boxGeometry args={[1, 1, 1]} />;
      case PRIMITIVE_TYPES.TETRAHEDRON:
        return <tetrahedronGeometry args={[0.8]} />;
      case PRIMITIVE_TYPES.OCTAHEDRON:
        return <octahedronGeometry args={[0.8]} />;
      case PRIMITIVE_TYPES.DODECAHEDRON:
        return <dodecahedronGeometry args={[0.6]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh ref={meshRef} scale={scale}>
      {renderGeometry()}
      <meshStandardMaterial color={accentColor} />
    </mesh>
  );
}
