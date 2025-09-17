import { useCursor, Torus } from "@react-three/drei";
import React, { useState } from "react";
import SelectionIndicator from "./SelectionIndicator";

export const SelectableBox = ({ 
  color = "red",
  selectionColor = "#ffffff",
  edgeThickness = 0.02,
  animationSpeed = 0.35
}) => {
  const [hovered, setHovered] = React.useState(false);

  useCursor(hovered);

  return (
    <Torus
      args={[1, 0.3, 30, 100]} // radius, tube, radialSegments, tubularSegments
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshPhysicalMaterial color={color} />
      {hovered && (
        <SelectionIndicator 
          color={selectionColor}
          edgeThickness={edgeThickness}
          animationSpeed={animationSpeed}
        />
      )}
    </Torus>
  );
};

// Example usage with any mesh:
/*
const MyModel = ({ 
  selectionColor = "#ffffff",
  edgeThickness = 0.02,
  animationSpeed = 0.35
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh 
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <yourGeometry />
      <yourMaterial />
      {hovered && (
        <SelectionIndicator 
          color={selectionColor}
          edgeThickness={edgeThickness}
          animationSpeed={animationSpeed}
        />
      )}
    </mesh>
  );
};
*/

// Re-export SelectionIndicator for convenience
export { default as SelectionIndicator } from './SelectionIndicator'; 