import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

/**
 * Controls for moving the entire plane group in Timeline mode
 * Handles diagonal movement based on the plane arrangement angle
 */
function PlaneGroupControls({ typeOfView, planeGroupRef, foundPlane }) {
  const { gl } = useThree();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const groupTarget = useRef({ x: 0, y: 0, z: 0 });
  const currentPosition = useRef({ x: 0, y: 0, z: 0 });

  // Controls for plane group movement
  const { panSpeed, scrollSpeed, diagonalAngle, animationSpeed } = useControls("Plane Group Controls", {
    panSpeed: { value: 0.02, min: 0.005, max: 0.1, step: 0.005 },
    scrollSpeed: { value: 0.004, min: 0.0001, max: 0.005, step: 0.0001 }, // Delta-based multiplier
    diagonalAngle: { value: -0.25, min: -1, max: 1, step: 0.05 }, // Ratio of Z movement to Y movement
    animationSpeed: { value: 0.07, min: 0.001, max: 0.1, step: 0.001 },
  });

  // Handle mouse/touch events for Timeline mode only
  useEffect(() => {
    if (typeOfView !== "Timeline" || !planeGroupRef?.current || foundPlane !== null) return;

    const canvas = gl.domElement;

    const handlePointerDown = (event) => {
      isDragging.current = true;
      const rect = canvas.getBoundingClientRect();
      lastPointer.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (event) => {
      if (!isDragging.current) return;

      const rect = canvas.getBoundingClientRect();
      const currentPointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const deltaX = (currentPointer.x - lastPointer.current.x) * panSpeed;
      const deltaY = (currentPointer.y - lastPointer.current.y) * panSpeed;

      // Calculate combined diagonal movement from both X and Y mouse movement
      // This creates a single diagonal axis that combines mouse movement
      const diagonalMovement = deltaX + deltaY;

      // Update target position (inverted movement for natural feel)
      groupTarget.current.x -= diagonalMovement;
      groupTarget.current.y -= diagonalMovement;
      groupTarget.current.z -= diagonalMovement * diagonalAngle;

      lastPointer.current = currentPointer;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "grab";
    };

    const handleWheel = (event) => {
      event.preventDefault();
      
      // Use actual delta value for proportional movement
      const wheelDelta = event.deltaY * scrollSpeed;
      
      // Move along the diagonal line using scroll (proportional to scroll intensity)
      groupTarget.current.x -= wheelDelta;
      groupTarget.current.y -= wheelDelta;
      groupTarget.current.z -= wheelDelta * diagonalAngle;
    };

    // Add event listeners
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Set cursor for Timeline mode
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.style.cursor = "default";
    };
  }, [typeOfView, panSpeed, scrollSpeed, diagonalAngle, gl, planeGroupRef, foundPlane]);

  // Smooth animation loop using lerp
  useFrame(() => {
    if (planeGroupRef?.current) {
      // Always smooth interpolation towards target position
      currentPosition.current.x = THREE.MathUtils.lerp(currentPosition.current.x, groupTarget.current.x, animationSpeed);
      currentPosition.current.y = THREE.MathUtils.lerp(currentPosition.current.y, groupTarget.current.y, animationSpeed);
      currentPosition.current.z = THREE.MathUtils.lerp(currentPosition.current.z, groupTarget.current.z, animationSpeed);
      // Apply the smooth position to the plane group
      planeGroupRef.current.position.set(
        currentPosition.current.x,
        currentPosition.current.y,
        currentPosition.current.z
      );
    }
  });

  // Reset plane group position when switching views
  useEffect(() => {
    if (typeOfView !== "Timeline" && planeGroupRef?.current) {
      // Smoothly animate back to origin when not in Timeline mode
      groupTarget.current = { x: 0, y: 0, z: 0 };
      // Don't immediately reset currentPosition and planeGroupRef.current.position
      // Let the useFrame loop handle the smooth animation to origin
    }
  }, [typeOfView, planeGroupRef]);

  return null; // This component doesn't render anything visible
}

export default PlaneGroupControls;
