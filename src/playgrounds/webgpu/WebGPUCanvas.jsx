import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import React, { useLayoutEffect, useState } from "react";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import * as THREE from "three/webgpu";

extend(THREE);

const WebGPUCanvas = ({ children, cameraProps = { position: [0, 0, 5], far: 20, fov: 70 } }) => {
  const [isSupported, setIsSupported] = useState(null);

  useLayoutEffect(() => {
    setIsSupported(WebGPU.isAvailable());
  }, []);

  if (isSupported === null) return null;
  //   if (!isSupported) return <NotSupported />;
  return (
    <Canvas
      className="!fixed inset-0 bg-transparent"
      performance={{ min: 0.5, debounce: 300 }}
      camera={cameraProps}
      flat={true}
      gl={async (props) => {
        console.warn("WebGPU is supported");
        const renderer = new THREE.WebGPURenderer({ 
          ...props, 
          alpha: true,
          premultipliedAlpha: false 
          
        });
        // renderer.setClearColor(0x000000, 0); // Transparent clear color
        await renderer.init();
        return renderer;
      }}
    >
      {children}
      <OrbitControls />
      {/* {process.env.NODE_ENV === "development" && <Stats />} */}
    </Canvas>
  );
};

export default WebGPUCanvas;
