import { OrbitControls } from "@react-three/drei";
import { GPGPUParticles } from "./GPGPUParticles";

const Experience = () => {
  return (
    <>
      {/* <Environment preset="warehouse" /> */}
      <OrbitControls />
      <group rotation={[Math.PI * -0.5, 0, 0]} position={[0, 0, 0]} scale={0.2}>
        <GPGPUParticles />
      </group>
      {/* <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh> */}
    </>
  );
};

export default Experience;
