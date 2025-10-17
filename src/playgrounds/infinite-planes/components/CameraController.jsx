import React, { useRef } from "react";
import { MapControls } from "@react-three/drei";

// Camera controller for top-down map-like movement
function CameraController() {
  const controlsRef = useRef();

  return (
    <MapControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={false} // Disable rotation for top-down view
      maxDistance={50}
      minDistance={5}
      maxPolarAngle={Math.PI / 3} // Limit camera angle to keep it looking down
      minPolarAngle={0} // Allow fully top-down view
    />
  );
}

export default CameraController;
