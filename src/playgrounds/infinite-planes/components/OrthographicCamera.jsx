import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import CustomEase from "gsap/customEase";

gsap.registerPlugin(CustomEase, useGSAP);

CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

function OrthographicCamera({ typeOfView = "Grid", foundPlane }) {
  const { camera, gl, size } = useThree();
  const cameraRef = useRef();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const cameraTarget = useRef({ x: 0, z: 0, zoom: 50 }); // Start zoomed out
  const currentPosition = useRef({ x: 0, z: 0, zoom: 50 });
  const [userControlsEnabled, setUserControlsEnabled] = useState(false);
  const [introAnimationComplete, setIntroAnimationComplete] = useState(false);
  const [isViewChangeAnimating, setIsViewChangeAnimating] = useState(false);
  const previousGridPosition = useRef(null); // Store complete camera position when switching to Timeline
  const previousTypeOfView = useRef(typeOfView);

  // Camera animation controls
  const {
    cameraHeight,
    animationSpeed,
    zoomSpeed,
    panSpeed,
    enableAnimations,
    autoRotate,
    autoRotateSpeed,
    minZoom,
    maxZoom,
    introAnimationDuration,
    introZoomTarget,
  } = useControls("Camera", {
    cameraHeight: { value: 30, min: 5, max: 100, step: 1 },
    animationSpeed: { value: 0.07, min: 0.001, max: 0.1, step: 0.001 },
    zoomSpeed: { value: 2, min: 0.5, max: 5, step: 0.1 },
    panSpeed: { value: 0.4, min: 0.1, max: 3, step: 0.1 },
    enableAnimations: true,
    autoRotate: false,
    autoRotateSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    minZoom: { value: 100, min: 1, max: 100, step: 1 },
    maxZoom: { value: 300, min: 100, max: 1000, step: 10 },
    introAnimationDuration: { value: 2, min: 1, max: 10, step: 0.5 },
    introZoomTarget: { value: 150, min: 100, max: 300, step: 10 },
  });

  // Initialize orthographic camera
  useEffect(() => {
    if (camera && camera.type !== "OrthographicCamera") {
      const aspect = size.width / size.height;
      const frustumSize = 20;

      const orthoCamera = new THREE.OrthographicCamera((frustumSize * aspect) / -2, (frustumSize * aspect) / 2, frustumSize / 2, frustumSize / -2, 0.1, 1000);

      orthoCamera.position.set(0, cameraHeight, 0);
      orthoCamera.lookAt(0, 0, 0);
      orthoCamera.zoom = currentPosition.current.zoom;
      orthoCamera.updateProjectionMatrix();

      // Replace the camera
      gl.render(gl.scene || new THREE.Scene(), orthoCamera);
      cameraRef.current = orthoCamera;
    }
  }, [camera, size, cameraHeight, gl]);

  // GSAP intro animation
  useGSAP(
    () => {
      console.log(introAnimationComplete, cameraRef);
      if (!introAnimationComplete && cameraRef.current) {
        gsap.to(cameraTarget.current, {
          zoom: introZoomTarget,
          duration: introAnimationDuration,
          delay: 0.5, // 500ms delay before starting animation
          ease: "osmo-ease",
          onComplete: () => {
            setIntroAnimationComplete(true);
            setUserControlsEnabled(true);
          },
        });
      }
    },
    { dependencies: [introAnimationComplete, introAnimationDuration, introZoomTarget, cameraRef.current] }
  );

  // Animate camera position when typeOfView changes
  useEffect(() => {
    if (previousTypeOfView.current !== typeOfView && introAnimationComplete) {
      // Disable controls during view change animation
      setIsViewChangeAnimating(true);

      // Store current zoom for restoration
      const currentZoom = cameraTarget.current.zoom;
      console.log(currentZoom);
      const zoomOutAmount = currentZoom * 0.4; // Zoom out to 60% of current zoom

      // Create timeline for zoom out, move, zoom in sequence
      const tl = gsap.timeline({
        onComplete: () => {
          setIsViewChangeAnimating(false);
        },
      });

      // First: Zoom out
      tl.to(cameraTarget.current, {
        zoom: zoomOutAmount,
        duration: 0.4,
        ease: "osmo-ease",
      });

      if (typeOfView === "Timeline") {
        // Switching to Timeline: store current position and animate to (0,0)
        previousGridPosition.current = {
          x: cameraTarget.current.x,
          z: cameraTarget.current.z,
        };
        tl.to(
          cameraTarget.current,
          {
            x: 0,
            z: 0,
            duration: 0.6,
            ease: "osmo-ease",
          },
          "-=0.2"
        ); // Start 0.2s before zoom out completes
      } else if (typeOfView === "Grid") {
        // Switching to Grid: restore previous position if it was stored, otherwise stay at current position
        if (previousGridPosition.current !== null) {
          tl.to(
            cameraTarget.current,
            {
              x: previousGridPosition.current.x,
              z: previousGridPosition.current.z,
              duration: 0.6,
              ease: "osmo-ease",
            },
            "-=0.2"
          ); // Start 0.2s before zoom out completes
        }
        // If previousGridPosition is null, don't animate position - keep current position
      }

      // Finally: Zoom back in
      tl.to(
        cameraTarget.current,
        {
          zoom: currentZoom,
          duration: 0.4,
          ease: "osmo-ease",
        },
        "-=0.1"
      ); // Start 0.1s before position animation completes
    }
    previousTypeOfView.current = typeOfView;
  }, [typeOfView, introAnimationComplete]);

  // Handle mouse/touch events
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (event) => {
      if (!userControlsEnabled || isViewChangeAnimating || typeOfView === "Timeline" || foundPlane !== null) return;
      isDragging.current = true;
      const rect = canvas.getBoundingClientRect();
      lastPointer.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (event) => {
      if (!userControlsEnabled || !isDragging.current || isViewChangeAnimating || typeOfView === "Timeline" || foundPlane !== null) return;

      const rect = canvas.getBoundingClientRect();
      const currentPointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const deltaX = (currentPointer.x - lastPointer.current.x) * panSpeed * 0.1;
      const deltaY = (currentPointer.y - lastPointer.current.y) * panSpeed * 0.1;

      // Convert screen space to world space movement
      const zoomFactor = Math.max(currentPosition.current.zoom / 50, 0.1);
      cameraTarget.current.x -= deltaX / zoomFactor;

      // In timeline mode, restrict movement to X-axis only (keep Z at 0)
      if (typeOfView !== "Timeline") {
        cameraTarget.current.z -= deltaY / zoomFactor; // No Y inversion
      }

      lastPointer.current = currentPointer;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "grab";
    };

    const handleWheel = (event) => {
      if (!userControlsEnabled || isViewChangeAnimating || typeOfView === "Timeline" || foundPlane !== null) return;
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      cameraTarget.current.zoom = THREE.MathUtils.clamp(cameraTarget.current.zoom + zoomDelta * 2, minZoom, maxZoom);
    };

    // Add event listeners
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Set initial cursor
    canvas.style.cursor = userControlsEnabled && !isViewChangeAnimating && typeOfView !== "Timeline" && foundPlane === null ? "grab" : "default";

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.style.cursor = "default";
    };
  }, [panSpeed, zoomSpeed, minZoom, maxZoom, userControlsEnabled, isViewChangeAnimating, typeOfView, foundPlane]);

  // Animation loop
  useFrame((state) => {
    if (!cameraRef.current && camera?.type === "OrthographicCamera") {
      cameraRef.current = camera;
    }

    if (!cameraRef.current) return;

    // Smooth camera transitions
    if (enableAnimations) {
      currentPosition.current.x = THREE.MathUtils.lerp(currentPosition.current.x, cameraTarget.current.x, animationSpeed);
      currentPosition.current.z = THREE.MathUtils.lerp(currentPosition.current.z, cameraTarget.current.z, animationSpeed);
      currentPosition.current.zoom = THREE.MathUtils.lerp(currentPosition.current.zoom, cameraTarget.current.zoom, animationSpeed);
    } else {
      currentPosition.current.x = cameraTarget.current.x;
      currentPosition.current.z = cameraTarget.current.z;
      currentPosition.current.zoom = cameraTarget.current.zoom;
    }

    // Update camera position and zoom
    cameraRef.current.position.set(currentPosition.current.x, cameraHeight, currentPosition.current.z);

    // Camera look direction - in timeline mode, look at current Z position (which animates to 0)
    cameraRef.current.lookAt(currentPosition.current.x, 0, currentPosition.current.z);

    cameraRef.current.zoom = currentPosition.current.zoom;
    cameraRef.current.updateProjectionMatrix();
  });

  // Public API for camera animations
  const animateToPosition = (x, z, zoom = currentPosition.current.zoom, duration = 1000) => {
    cameraTarget.current.x = x;
    cameraTarget.current.z = z;
    cameraTarget.current.zoom = zoom;
  };

  // Expose camera controls to parent components
  useEffect(() => {
    // Attach methods to the camera for external access
    if (cameraRef.current) {
      cameraRef.current.animateToPosition = animateToPosition;
    }
  });

  return null; // This component doesn't render anything visible
}

export default OrthographicCamera;
