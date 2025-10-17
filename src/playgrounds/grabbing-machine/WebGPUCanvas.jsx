import { OrbitControls } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three/webgpu";

const WebGPUCanvas = ({ children, cameraProps = { position: [0, 0, 7], far: 20, fov: 70 } }) => {
  return (
    <Canvas
      className="!fixed inset-0 bg-black"
      dpr={[1, 1.5]}
      camera={cameraProps}
      gl={(props) => {
        extend(THREE);
        const renderer = new THREE.WebGPURenderer({ ...props, antialias: false });
        return renderer.init().then(() => {
          renderer.setClearColor(0x000000, 1);
          return renderer;
        });
      }}
    >
      <color attach="background" args={['#000000']} />
      {children}
      <OrbitControls />
    </Canvas>
  );
};

export default WebGPUCanvas;
