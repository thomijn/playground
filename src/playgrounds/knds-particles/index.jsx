import React from "react";
import WebGPUCanvas from "../webgpu/WebGPUCanvas";
import { Suspense } from "react";
import Experience from "./Experience.jsx";
import { Leva, useControls } from "leva";
import PostProcessing from "./PostProcessing.jsx";

export default function KNDSParticles() {
  const ppSettings = useControls("Post Processing", {
    strength: {
      value: 0.8,
      min: 0,
      max: 10,
      step: 0.1,
    },
    radius: {
      value: 0.42,
      min: 0,
      max: 10,
      step: 0.1,
    },
    threshold: {
      value: 0.75,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });

  return (
    <main className="w-full h-screen bg-white">
      <Leva />
      <WebGPUCanvas cameraProps={{ position: [-2, 2, -5], far: 20, fov: 40 }}>
        <Suspense>
          <Experience />
        </Suspense>
        {/* <PostProcessing {...ppSettings} /> */}
      </WebGPUCanvas>
    </main>
  );
}
