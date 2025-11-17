import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { create } from "zustand";

// Zustand store for camera animation control
export const useCameraStore = create((set) => ({
  animateToPosition: null,
  setAnimateToPosition: (fn) => set({ animateToPosition: fn }),
  animatedBokehScale: null,
  setAnimatedBokehScale: (value) => set({ animatedBokehScale: value }),
  cameraDistance: 20,
  setCameraDistance: (distance) => set({ cameraDistance: distance }),
}));

export const CameraController = () => {
  const { camera } = useThree();
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const hasPlayedIntro = useRef(false);
  const controlsRef = useRef();
  const setAnimateToPosition = useCameraStore((state) => state.setAnimateToPosition);
  const setAnimatedBokehScale = useCameraStore((state) => state.setAnimatedBokehScale);
  const setCameraDistance = useCameraStore((state) => state.setCameraDistance);
  const bokehScaleValue = useRef({ value: null });

  // Update camera distance on every frame
  useEffect(() => {
    const updateDistance = () => {
      if (controlsRef.current) {
        const distance = camera.position.distanceTo(controlsRef.current.target);
        setCameraDistance(distance);
      }
      requestAnimationFrame(updateDistance);
    };
    updateDistance();
  }, [camera, setCameraDistance]);

  // Expose animateToTarget function to the store
  useEffect(() => {
    // Function to animate camera to a target position
    const animateToTarget = (targetPosition, originalBokehScale) => {
      
      // Kill any existing animations
      gsap.killTweensOf(camera.position);
      if (controlsRef.current) {
        gsap.killTweensOf(controlsRef.current.target);
      }
      gsap.killTweensOf(bokehScaleValue.current);
      
      // Disable controls during animation
      setControlsEnabled(false);
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      // Initialize bokeh scale value if needed
      if (bokehScaleValue.current.value === null) {
        bokehScaleValue.current.value = originalBokehScale;
      }

      // Calculate camera position: offset from target
      const offset = { x: -1, y: 5, z: -4 };
      const cameraTarget = {
        x: targetPosition.x + offset.x,
        y: targetPosition.y + offset.y,
        z: targetPosition.z + offset.z,
      };

      // Animate both camera position and controls target
      const timeline = gsap.timeline({
        onComplete: () => {
          // Re-enable controls after animation
          setControlsEnabled(true);
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        },
      });

      timeline.to(camera.position, {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: 1.5,
        ease: "power3.inOut",
      }, 0);

      if (controlsRef.current) {
        timeline.to(controlsRef.current.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1.5,
          ease: "power3.inOut",
        }, 0);
      }

      // Animate bokeh scale to 0 with delay
      timeline.to(bokehScaleValue.current, {
        value: 0,
        duration: 1.15,
        delay: 0.35,
        ease: "power2.inOut",
        onUpdate: () => {
          setAnimatedBokehScale(bokehScaleValue.current.value);
        },
      }, 0);
    };
    
    setAnimateToPosition(animateToTarget);
  }, [setAnimateToPosition, camera, setControlsEnabled, controlsEnabled, setAnimatedBokehScale]);

  // GSAP Intro Animation
  useEffect(() => {
    if (!hasPlayedIntro.current) {
      hasPlayedIntro.current = true;
      
      // Set initial camera position
      camera.position.set(-25, 25, -25);
      camera.lookAt(10, 0, 10);
      
      // Animate camera position
      gsap.to(camera.position, {
        x: -2,
        y: 10,
        z: -10,
        delay: 0,
        duration: 3.5,
        ease: "power3.inOut",
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          // Enable controls after animation
          setControlsEnabled(true);
        }
      });
    }
  }, [camera]);

  return (
    <MapControls
      ref={controlsRef}
      enabled={controlsEnabled}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2}
    />
  );
};

