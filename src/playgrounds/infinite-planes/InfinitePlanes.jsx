import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import PlaneGrid from "./components/PlaneGrid";
import OrthographicCamera from "./components/OrthographicCamera";
import PlaneGroupControls from "./components/PlaneGroupControls";
import PlaneFilter from "./components/PlaneFilter";
import { Box, Text } from "@react-three/drei";
import ProjectTitle from "./components/ProjectTitle";
import { motion } from "framer-motion";

// Main component
export default function InfinitePlanes() {
  const [typeOfView, setTypeOfView] = useState("Grid");
  const [foundPlane, setFoundPlane] = useState(null);
  const planeGroupRef = useRef();

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFoundPlane(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {/* Filter UI */}
      <PlaneFilter typeOfView={typeOfView} setTypeOfView={setTypeOfView} foundPlane={foundPlane} setFoundPlane={setFoundPlane} />

      <ProjectTitle foundPlane={foundPlane} />

      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          ease: [0.625, 0.05, 0, 1],
          delay: 1.5,
        }}
        src="/barcode/logo.svg"
        alt="barcode"
        className="absolute top-0 left-8 z-[9999] w-[100px] h-[100px] object-contain"
      />

      <Canvas
        orthographic
        camera={{
          position: [0, 30, 0],
          zoom: 1,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {/* Fog for depth */}
        <fog attach="fog" args={["#000000", 30, 200]} />

        {/* Grid of planes */}
        <PlaneGrid typeOfView={typeOfView} planeGroupRef={planeGroupRef} foundPlane={foundPlane} setFoundPlane={setFoundPlane} />

        {/* Custom orthographic camera */}
        <OrthographicCamera typeOfView={typeOfView} foundPlane={foundPlane} />

        {/* Plane group controls for Timeline mode */}
        <PlaneGroupControls typeOfView={typeOfView} planeGroupRef={planeGroupRef} foundPlane={foundPlane} />
      </Canvas>

      <Leva hidden />
    </div>
  );
}
