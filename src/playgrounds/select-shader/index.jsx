import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import { SelectableBox } from "./SelectionComponents";
// import SelectionIndicator from "./SelectionIndicator";

const SelectShader = () => {
  // Example of state that could be controlled by UI
  const [selectionSettings, setSelectionSettings] = useState({
    color: "blue",
    selectionColor: "#00ffff",
    edgeThickness: 0.03,
    animationSpeed: 0.5,
  });

  return (
    <div className="z-10 absolute top-0 bg-red-500">
   
    <video autoPlay loop muted playsinline width={500} height={500}>
  <source src="/render-hevc-safari.mp4" type="video/mp4" />
  <source src="/render-vp9-chrome.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
    </div>
  );
    // <Canvas
    //   camera={{ position: [0, 0, 10], fov: 30 }}
    //   style={{
    //     position: "fixed",
    //     top: 0,
    //   }}
    //   className="z-10 absolute top-0"
    // >
    //   <directionalLight position={[5, 5, 5]} />
    //   <ambientLight intensity={0.5} />
    //   <CameraControls />
    //   <color attach="background" args={["black"]} />

    //   {/* Example with custom props */}
    //   <SelectableBox 
    //     color={selectionSettings.color}
    //     selectionColor={selectionSettings.selectionColor}
    //     edgeThickness={selectionSettings.edgeThickness}
    //     animationSpeed={selectionSettings.animationSpeed}
    //   />
      
    //   {/* Example with default props */}
    //   <SelectableBox position={[-3, 0, 0]} />
    // </Canvas>

};

export default SelectShader;
