// Utility functions for plane placement algorithms

// Helper function to check if two rectangles overlap with padding
const checkOverlap = (newPlane, existingPlanes, padding) => {
  return existingPlanes.some((existing) => {
    const dx = Math.abs(newPlane.position.x - existing.position[0]);
    const dz = Math.abs(newPlane.position.z - existing.position[2]);

    // Calculate half-widths including padding
    const newHalfWidth = newPlane.scale.width / 2 + padding;
    const newHalfHeight = newPlane.scale.height / 2 + padding;
    const existingHalfWidth = existing.scale[0] / 2 + padding;
    const existingHalfHeight = existing.scale[1] / 2 + padding;

    // Check for overlap in both dimensions
    return dx < newHalfWidth + existingHalfWidth && dz < newHalfHeight + existingHalfHeight;
  });
};

// Create centered radial distribution of planes
export function createCenteredRadialDistribution(numPlanes, areaSize, minPadding, aspectRatioRange, sizeRange) {
  const planes = [];
  const maxAttempts = 100;

  // Fixed aspect ratios to choose from
  const aspectRatios = [1.6, 0.8, 1.3];

  // First plane: always centered
  const centerAspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
  const centerSize = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
  const centerWidth = centerSize * centerAspectRatio;
  const centerHeight = centerSize;

  planes.push({
    id: "center-plane",
    position: [0, 0, 0],
    scale: [centerWidth, centerHeight, 1],
    rotation: [Math.PI / 2, 0, 0],
    index: 0,
  });

  // Place remaining planes in expanding circular rings
  let currentRadius = Math.max(centerWidth, centerHeight) / 2 + minPadding + 2;
  let planesInCurrentRing = 6; // Start with 6 planes in first ring
  let placedInCurrentRing = 0;
  let ringIndex = 0;

  for (let i = 1; i < numPlanes; i++) {
    let validPlane = null;
    let attempts = 0;

    // Try to place in current ring
    while (attempts < maxAttempts && !validPlane) {
      // Generate plane size
      const aspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
      const baseSize = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
      const planeWidth = baseSize * aspectRatio;
      const planeHeight = baseSize;

      // Calculate angle for this position in the ring
      const angleStep = (Math.PI * 2) / planesInCurrentRing;
      const baseAngle = placedInCurrentRing * angleStep;
      const angleJitter = (Math.random() - 0.5) * angleStep * 0.3; // Small random offset
      const angle = baseAngle + angleJitter;

      // Add some radius variation
      const radiusJitter = (Math.random() - 0.5) * 1.5;
      const finalRadius = currentRadius + radiusJitter;

      const candidatePos = {
        x: Math.cos(angle) * finalRadius,
        z: Math.sin(angle) * finalRadius,
      };

      // Check if within area bounds
      const maxPlaneExtent = Math.max(planeWidth, planeHeight) / 2;
      if (Math.abs(candidatePos.x) + maxPlaneExtent < areaSize / 2 && Math.abs(candidatePos.z) + maxPlaneExtent < areaSize / 2) {
        const candidatePlane = {
          position: candidatePos,
          scale: { width: planeWidth, height: planeHeight },
        };

        if (!checkOverlap(candidatePlane, planes, minPadding)) {
          validPlane = {
            id: `plane-${i}`,
            position: [candidatePos.x, 0, candidatePos.z],
            scale: [planeWidth, planeHeight, 1],
            rotation: [Math.PI / 2, 0, 0],
            index: i,
          };
        }
      }
      attempts++;
    }

    // If we couldn't place in the ring, try a more random position
    if (!validPlane) {
      attempts = 0;
      while (attempts < 50 && !validPlane) {
        const aspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
        const baseSize = sizeRange.min + Math.random() * 0.5; // Smaller size
        const planeWidth = baseSize * aspectRatio;
        const planeHeight = baseSize;

        const candidatePos = {
          x: (Math.random() - 0.5) * (areaSize - planeWidth),
          z: (Math.random() - 0.5) * (areaSize - planeHeight),
        };

        const candidatePlane = {
          position: candidatePos,
          scale: { width: planeWidth, height: planeHeight },
        };

        if (!checkOverlap(candidatePlane, planes, minPadding)) {
          validPlane = {
            id: `plane-${i}`,
            position: [candidatePos.x, 0, candidatePos.z],
            scale: [planeWidth, planeHeight, 1],
            rotation: [Math.PI / 2, 0, 0],
            index: i,
          };
        }
        attempts++;
      }
    }

    if (validPlane) {
      planes.push(validPlane);
      placedInCurrentRing++;

      // Check if we need to move to the next ring
      if (placedInCurrentRing >= planesInCurrentRing) {
        placedInCurrentRing = 0;
        ringIndex++;
        currentRadius += 4 + Math.random() * 2; // Increase radius for next ring
        planesInCurrentRing = Math.min(planesInCurrentRing + 4, 16); // Increase planes per ring, cap at 16
      }
    }
  }

  return planes;
}

// Create precalculated positions for all view types
export function createPrecalculatedPlanePositions(numPlanes, areaSize, minPadding, aspectRatioRange, sizeRange) {
  // First generate the grid layout to establish plane properties (size, scale, etc.)
  const gridPlanes = createCenteredRadialDistribution(numPlanes, areaSize, minPadding, aspectRatioRange, sizeRange);

  // Create the result array with both position sets
  const planesWithPositions = gridPlanes.map((plane, index) => {
    // Grid position (already calculated)
    const gridPosition = plane.position;

    // Timeline position - arrange in straight line with 1 unit offset
    const timelinePosition = [index * 1.1, 0, (-index * 1.1) / 4];

    return {
      id: plane.id,
      scale: plane.scale,
      rotation: plane.rotation,
      index: plane.index,
      positions: {
        Grid: gridPosition,
        Timeline: timelinePosition,
      },
    };
  });

  return planesWithPositions;
}
