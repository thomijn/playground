import React, { useRef, useEffect, Suspense, useState, useMemo } from "react";
import { Html, Image, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate rotation based on view type and selection state
 */
const getRotationForView = (viewType, foundPlane, index) => {
  // If this plane is found, rotate it to face the camera
  if (foundPlane === index) {
    return [-Math.PI / 2, 0, 0];
  }

  if (viewType === "Timeline") {
    // Diagonal rotation for timeline view (like cards in perspective)
    return [-Math.PI / 2.5, -Math.PI / 4, 0];
  } else {
    // Flat rotation for grid view
    return [-Math.PI / 2, 0, 0];
  }
};

/**
 * Calculate scale to fill viewport when plane is selected
 */
const getViewportFitScale = (foundPlane, index, viewport, scale) => {
  if (foundPlane !== index) return scale;
  // Fill the entire viewport, disregarding original aspect ratio
  return [viewport.width, viewport.height, scale[2]];
};

/**
 * Calculate target scale for different view types
 */
const getScaleForView = (viewType, foundPlane, index, viewport, scale) => {
  // If this plane is found, use viewport fit scale
  if (foundPlane === index) {
    return getViewportFitScale(foundPlane, index, viewport, scale);
  }

  if (viewType === "Timeline") {
    // For Timeline view, use uniform size with 1.6 aspect ratio
    const targetAspectRatio = 1.6;
    const uniformHeight = 2.0; // Fixed height for all Timeline planes
    const uniformWidth = uniformHeight * targetAspectRatio;
    return [uniformWidth, uniformHeight, scale[2]];
  } else {
    // For Grid view, use original scale
    return scale;
  }
};

/**
 * Calculate text position at bottom left of plane
 */
const getTextPosition = (pos, scale) => [
  pos[0] - scale[0] / 2 + 0.55, // Left edge + small offset
  pos[1] + 0.01, // Slightly above plane to prevent z-fighting
  pos[2] + scale[1] / 2 + 0.2, // Bottom edge + small offset
];

/**
 * Calculate opacity based on distance for timeline view
 */
const calculateTimelineOpacity = (positions, planeGroupRef, maxOpacityDistance, falloffPower, minOpacity, maxDistance) => {
  // Get world position of the plane
  const worldPosition = new THREE.Vector3(0, 0, Math.abs(positions["Timeline"][2]));

  // Get the group's current Z position (defaults to 0 if group doesn't exist)
  const groupZ = planeGroupRef?.current?.position?.z || 0;

  // Calculate distance to adjusted origin (0, 0, groupZ) to account for group movement
  const adjustedOrigin = new THREE.Vector3(0, 0, groupZ);
  const distanceToOrigin = worldPosition.distanceTo(adjustedOrigin);

  // Calculate opacity based on controllable parameters
  if (distanceToOrigin <= maxOpacityDistance) {
    // Within max opacity distance - opacity is 1
    return 1;
  } else {
    // Beyond max opacity distance - apply exponential falloff
    const falloffDistance = distanceToOrigin - maxOpacityDistance;
    const normalizedFalloffDistance = Math.min(falloffDistance / (maxDistance - maxOpacityDistance), 1);

    // Apply exponential falloff with controllable power
    const exponentialFalloff = Math.pow(1 - normalizedFalloffDistance, falloffPower);

    // Blend between 1 and minOpacity based on falloff
    return minOpacity + (1 - minOpacity) * exponentialFalloff;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Plane({ positions, scale, rotation, index, typeOfView, planeGroupRef, foundPlane, setFoundPlane }) {
  // ============================================================================
  // REFS AND STATE
  // ============================================================================
  const meshRef = useRef();
  const htmlRef = useRef();
  const groupRef = useRef();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ============================================================================
  // HOOKS
  // ============================================================================
  const { viewport, size, camera } = useThree();

  // Randomly select a barcode image for this plane instance
  const barcodeUrl = useMemo(() => {
    const barcodeNumber = Math.floor(Math.random() * 6) + 1; // Random number between 1-6
    return `/barcode/barcode${barcodeNumber}.webp`;
  }, [index]); // Use index as dependency so each plane gets a consistent random image

  const texture = useTexture(barcodeUrl, (texture) => {
    setLoaded(true);
  });

  // ============================================================================
  // CONTROLS
  // ============================================================================
  const { maxOpacityDistance, falloffPower, minOpacity, maxDistance } = useControls("Opacity Falloff", {
    maxOpacityDistance: { value: 0.4, min: 0, max: 10, step: 0.1, description: "Distance at which opacity reaches 1" },
    falloffPower: { value: 20, min: 0.5, max: 20, step: 0.5, description: "Exponential falloff power" },
    minOpacity: { value: 0.21, min: 0, max: 1, step: 0.01, description: "Minimum opacity for distant planes" },
    maxDistance: { value: 10, min: 1, max: 30, step: 1, description: "Maximum distance for opacity calculation" },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const currentPosition = positions[typeOfView];
  const currentRotation = getRotationForView(typeOfView, foundPlane, index);
  const currentScale = getScaleForView(typeOfView, foundPlane, index, viewport, scale);
  const showText = foundPlane === null && typeOfView === "Grid";

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handlePlaneClick = (event) => {
    event.stopPropagation();
    setFoundPlane(index);
  };

  // ============================================================================
  // ANIMATIONS
  // ============================================================================

  // Initial animation - only run once on mount
  useEffect(() => {
    if (meshRef.current && !hasInitialized) {
      gsap.to(meshRef.current.material, {
        opacity: 1,
        duration: 1,
        ease: "osmo-ease",
        delay: 0.6 + index * 0.02,
      });

      gsap.to(meshRef.current.scale, {
        x: currentScale[0],
        y: currentScale[1],
        z: currentScale[2],
        duration: 1,
        ease: "osmo-ease",
        delay: 0.6 + index * 0.02,
        onComplete: () => {
          setHasInitialized(true);
        },
      });
    }
  }, [loaded, meshRef.current, currentScale]);

  // Position animation when typeOfView changes
  useEffect(() => {
    if (meshRef.current && hasInitialized) {
      const targetPosition = positions[typeOfView];
      const textPos = getTextPosition(targetPosition, scale);
      const targetScale = [currentScale[0], currentScale[1], currentScale[2]];

      // Kill any existing animations to prevent conflicts
      gsap.killTweensOf(meshRef.current.position);
      gsap.killTweensOf(meshRef.current.rotation);
      gsap.killTweensOf(meshRef.current.scale);
      if (htmlRef.current) {
        gsap.killTweensOf(htmlRef.current.position);
      }

      // Create timeline for synchronized animations
      const tl = gsap.timeline();

      // Animate mesh position
      tl.to(
        meshRef.current.position,
        {
          x: targetPosition[0],
          y: targetPosition[1],
          z: targetPosition[2],
          duration: 1.2,
          ease: "osmo-ease",
        },
        index * 0.005
      );

      // Animate mesh rotation
      tl.to(
        meshRef.current.rotation,
        {
          x: currentRotation[0],
          y: currentRotation[1],
          z: currentRotation[2],
          duration: 1.2,
          ease: "osmo-ease",
        },
        index * 0.005
      );

      // Animate mesh scale
      tl.to(
        meshRef.current.scale,
        {
          x: targetScale[0],
          y: targetScale[1],
          z: targetScale[2],
          duration: 1.2,
          ease: "osmo-ease",
        },
        index * 0.005
      );

      tl.to(
        meshRef.current.material.scale,
        {
          x: targetScale[0],
          y: targetScale[1],
          z: targetScale[2],
          duration: 1.2,
          ease: "osmo-ease",
        },
        index * 0.005
      );

      // Animate HTML text position if it exists
      if (htmlRef.current) {
        tl.to(
          htmlRef.current.position,
          {
            x: textPos[0],
            y: textPos[1],
            z: textPos[2],
            duration: 1.2,
            ease: "osmo-ease",
          },
          index * 0.005
        );
      }

      // Cleanup function to kill animations on unmount
      return () => {
        tl.kill();
      };
    }
  }, [typeOfView, index, positions, currentScale]);

  // Handle foundPlane animation for viewport scaling
  useEffect(() => {
    if (meshRef.current && hasInitialized) {
      if (foundPlane === index) {
        const viewportScale = getViewportFitScale(foundPlane, index, viewport, scale);

        // Kill any existing animations
        gsap.killTweensOf(meshRef.current.scale);
        gsap.killTweensOf(meshRef.current.position);

        // Center the plane in front of the camera and scale it
        const timeline = gsap.timeline();

        // Move to exact camera x and z coordinates, slightly in front for y
        timeline.to(meshRef.current.position, {
          x: camera.position.x,
          y: camera.position.y - 5, // Slightly in front of camera to avoid z-fighting
          z: camera.position.z,
          duration: 0.8,
          ease: "osmo-ease",
        });

        // Then scale to viewport size
        timeline.to(
          meshRef.current.scale,
          {
            x: viewportScale[0],
            y: viewportScale[1],
            z: viewportScale[2],
            duration: 0.8,
            ease: "osmo-ease",
          },
          "<+0.5"
        ); // Start at the same time as position animation

        // Also update material scale if it exists
        if (meshRef.current.material && meshRef.current.material.scale) {
          gsap.killTweensOf(meshRef.current.material.scale);
          timeline.to(
            meshRef.current.material.scale,
            {
              x: viewportScale[0],
              y: viewportScale[1],
              z: viewportScale[2],
              duration: 0.8,
              ease: "osmo-ease",
            },
            "<"
          );
        }
      } else if (foundPlane !== index && foundPlane !== null) {
        // Reset to normal position and scale when another plane is found
        const normalScale = getScaleForView(typeOfView, foundPlane, index, viewport, scale);
        const targetPosition = positions[typeOfView];

        gsap.killTweensOf(meshRef.current.scale);
        gsap.killTweensOf(meshRef.current.position);

        const timeline = gsap.timeline();

        // Return to original position
        timeline.to(meshRef.current.position, {
          x: targetPosition[0],
          y: targetPosition[1],
          z: targetPosition[2],
          duration: 0.8,
          ease: "osmo-ease",
        });

        // Return to normal scale
        timeline.to(
          meshRef.current.scale,
          {
            x: normalScale[0],
            y: normalScale[1],
            z: normalScale[2],
            duration: 0.8,
            ease: "osmo-ease",
          },
          "<"
        );

        if (meshRef.current.material && meshRef.current.material.scale) {
          gsap.killTweensOf(meshRef.current.material.scale);
          timeline.to(
            meshRef.current.material.scale,
            {
              x: normalScale[0],
              y: normalScale[1],
              z: normalScale[2],
              duration: 0.8,
              ease: "osmo-ease",
            },
            "<"
          );
        }
      }
    }
  }, [
    foundPlane,
    index,
    viewport.width,
    viewport.height,
    positions,
    typeOfView,
    camera.position.x,
    camera.position.y,
    camera.position.z,
    hasInitialized,
    scale,
  ]);

  // ============================================================================
  // FRAME UPDATES
  // ============================================================================

  useFrame(() => {
    // if (index === 6) {
    //   console.log(meshRef.current.position);
    // }

    if (meshRef.current && hasInitialized) {
      let targetOpacity = 1;

      if (foundPlane === index) {
        targetOpacity = 1;
      } else if (foundPlane !== index && foundPlane !== null) {
        targetOpacity = 0;
      }

      // Timeline view opacity calculations
      if (typeOfView === "Timeline") {
        targetOpacity = calculateTimelineOpacity(positions, planeGroupRef, maxOpacityDistance, falloffPower, minOpacity, maxDistance);
      }

      // Smoothly animate to the target opacity
      if (meshRef.current.material) {
        meshRef.current.material.opacity = THREE.MathUtils.lerp(
          meshRef.current.material.opacity,
          targetOpacity,
          0.05 // Smooth interpolation factor
        );

        if (typeOfView === "Timeline") {
          groupRef.current.position.z = THREE.MathUtils.lerp(
            groupRef.current.position.z,
            1 - targetOpacity,
            0.05 // Smooth interpolation factor
          );
        }
      }
    }
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <group ref={groupRef}>
      {/* Main plane image */}
      <Image
        key={index}
        url={barcodeUrl}
        ref={meshRef}
        transparent
        opacity={0}
        position={positions.Grid}
        scale={[scale[0] * 0.5, scale[1] * 0.5, scale[2] * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[1, 1]} />
      </Image>

      {/* Text overlay */}
      <Html ref={htmlRef} position={getTextPosition(positions["Grid"], scale)} transform zIndexRange={[99, 999]} sprite>
        <div className="plane-text">
          <motion.h1
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: showText ? 1 : 0, y: 0 }}
            transition={{
              duration: showText ? 1 : 0.3,
              ease: [0.625, 0.05, 0, 1],
              delay: showText ? 1 + index * 0.02 : 0,
            }}
            className="text-white text-[4px] font-light"
          >
            {index + 1}. The Muse / Masterplan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: showText ? 1 : 0, y: 0 }}
            transition={{
              duration: showText ? 1 : 0.3,
              ease: [0.625, 0.05, 0, 1],
              delay: showText ? 1 + index * 0.04 : 0,
            }}
            className="text-white/50 text-[3.5px] font-light leading-0"
          >
            The Muse / Masterplan
          </motion.p>
        </div>
      </Html>
    </group>
  );
}

export default Plane;
