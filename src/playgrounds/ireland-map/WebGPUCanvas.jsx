import { Stats, PerformanceMonitor } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import React, { useLayoutEffect, useState } from "react";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import * as THREE from "three/webgpu";
import { useStore } from "../../store";

extend(THREE);

const CanvasContent = ({ children, setDpr }) => {
  const quality = useStore((state) => state.quality);
  const setQuality = useStore((state) => state.setQuality);

  return (
    <>
      <PerformanceMonitor
        onIncline={() => {
          setDpr(2);
          setQuality(quality === "low" ? "medium" : "high");
        }}
        onDecline={() => {
          setDpr(1);
          setQuality(quality === "high" ? "medium" : "low");
        }}
      />
      {children}
      {/* {process.env.NODE_ENV === "development" && <Stats />} */}
    </>
  );
};

const WebGPUCanvas = ({ children, cameraProps = { position: [0, 0, 5], far: 20, fov: 70 }, className = "" }) => {
  const [isSupported, setIsSupported] = useState(null);
  const [dpr, setDpr] = useState(2);

  useLayoutEffect(() => {
    setIsSupported(WebGPU.isAvailable());
  }, []);

  if (isSupported === null) return null;
  //   if (!isSupported) return <NotSupported />;
  return (
    <Canvas
      className={className}
      dpr={[1, dpr]}
      // performance={{ min: 0.5, debounce: 300 }}
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
      <CanvasContent setDpr={setDpr}>
        {children}
      </CanvasContent>
    </Canvas>
  );
};

export default WebGPUCanvas;

