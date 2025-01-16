import { CameraControls, Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import React from "react";
import { Model } from "./Soolax";
import { ReactLenis } from "@studio-freight/react-lenis";
import * as THREE from "three";

const index = () => {
  return (
    <>
      <ReactLenis root>
        <Leva  />
        <div id="wrapper" className="h-[300vh] w-screen z-0 relative bg-black">
          <img src="/bg.png" alt="bg" className="w-full h-[200vh]" />
        </div>
        <Canvas
          camera={{ position: [-2, 0, 12], fov: 30 }}
          style={{
            position: "fixed",
            top: 0,
          }}
          className="z-10 absolute top-0"
        >
          <pointLight position={[5, 5, 5]} />
          <Float>
            <Model />
          </Float>
          <Camera />

          <Environment resolution={512}>
            {/* Ceiling */}
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
            {/* Sides */}
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-50, 2, 0]} scale={[100, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[50, 2, 0]} scale={[100, 2, 1]} />
            {/* Key */}
          </Environment>
        </Canvas>
      </ReactLenis>
    </>
  );
};

const Camera = () => {
  const vec = new THREE.Vector3();
  return useFrame((state) => {
    state.camera.position.lerp(vec.set(state.mouse.x /1, state.mouse.y / 1, 12), 0.05);
    state.camera.lookAt(0, 0, 0);
  });
};

export default index;
