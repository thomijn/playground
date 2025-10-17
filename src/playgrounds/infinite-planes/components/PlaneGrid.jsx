import React, { useMemo, Suspense, useRef } from "react";
import { useControls } from "leva";
import Plane from "./Plane";
import { createPrecalculatedPlanePositions } from "../utils/placementAlgorithm";

function PlaneGrid({ typeOfView, planeGroupRef, foundPlane, setFoundPlane }) {
  const { numPlanes, areaSize, minPadding, minAspectRatio, maxAspectRatio, minSize, maxSize, regenerate } = useControls("Plane Grid", {
    numPlanes: { value: 80, min: 10, max: 150, step: 5 },
    areaSize: { value: 50, min: 20, max: 100, step: 5 },
    minPadding: { value: 0.4, min: 0.1, max: 3, step: 0.1 },
    minAspectRatio: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    maxAspectRatio: { value: 1.8, min: 1, max: 5, step: 0.1 },
    minSize: { value: 1.6, min: 0.5, max: 3, step: 0.1 },
    maxSize: { value: 2.5, min: 1, max: 4, step: 0.1 },
    regenerate: { value: 0, min: 0, max: 100, step: 1 },
  });

  const planes = useMemo(() => {
    const aspectRatioRange = { min: minAspectRatio, max: maxAspectRatio };
    const sizeRange = { min: minSize, max: maxSize };

    // Generate planes with precalculated positions for all view types
    return createPrecalculatedPlanePositions(numPlanes, areaSize, minPadding, aspectRatioRange, sizeRange);
  }, [numPlanes, areaSize, minPadding, minAspectRatio, maxAspectRatio, minSize, maxSize, regenerate]);

  return (
    <group ref={planeGroupRef}>
      {planes.map((plane) => (
        <Suspense key={plane.id} fallback={null}>
          <Plane key={plane.id} positions={plane.positions} scale={plane.scale} rotation={plane.rotation} index={plane.index} typeOfView={typeOfView} planeGroupRef={planeGroupRef} foundPlane={foundPlane} setFoundPlane={setFoundPlane} />
        </Suspense>
      ))}
    </group>
  );
}

export default PlaneGrid;
