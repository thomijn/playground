import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React from "react";

const Frame = () => {
  const viewport = useThree((state) => state.viewport);
  const { scene } = useGLTF("/cinnamon/frame.glb");
  return <primitive 
  rotation={[0, 0, 0]}
  position={[0, 0, 5]} object={scene} scale={[viewport.width / 2.15, viewport.height / 2.15, 8]} />;
};

export default Frame;
