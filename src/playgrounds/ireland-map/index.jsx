import WebGPUCanvas from "./WebGPUCanvas";
import { Ireland } from "./Ireland";
import { Sea } from "./Sea";
import { useControls, Leva } from "leva";
import Sheep from "./sheep";
import Clouds from "./Clouds";
import { PostProcessing } from "./PostProcessing";
import { CameraController } from "./CameraController";
import { Markers } from "./Markers";
import { FilterBar } from "./FilterBar";
import { MakerModal } from "./MakerModal";
import { ReactLenis } from "lenis/react";
import { useRef } from "react";

export default function IrelandMap() {
  const topRightBorderRef = useRef();
  const bottomLeftBorderRef = useRef();

  const { backgroundColor, fogColor, fogNear, fogFar } = useControls("Scene", {
    backgroundColor: { value: "#f2eccf", label: "Background Color" },
    fogColor: { value: "#f2eccf", label: "Fog Color" },
    fogNear: { value: 15, min: 0, max: 100, step: 1, label: "Fog Near" },
    fogFar: { value: 40, min: 0, max: 100, step: 1, label: "Fog Far" },
  });

  const { focusDistance, focalLength, bokehScale } = useControls("Depth of Field", {
    focusDistance: { value: 13.5, min: 1, max: 100, step: 0.5, label: "Focus Distance" },
    focalLength: { value: 4, min: 0, max: 100, step: 1, label: "Focal Length" },
    bokehScale: { value: 8.5, min: 0, max: 20, step: 0.5, label: "Bokeh Scale" },
  });

  const { dissolveSize, dissolveThickness, dissolveColor, dissolveIntensity, dissolveBackgroundColor, animateDissove, dissolveDuration } = useControls(
    "Dissolve Effect",
    {
      animateDissove: { value: true, label: "Animate" },
      dissolveDuration: { value: 5, min: 0.5, max: 10, step: 0.5, label: "Duration" },
      dissolveSize: { value: 8, min: 1, max: 20, step: 0.5, label: "Noise Size" },
      dissolveThickness: { value: 0.15, min: 0.01, max: 0.5, step: 0.01, label: "Border Thickness" },
      dissolveColor: { value: "#065765", label: "Border Color" },
      dissolveIntensity: { value: 3, min: 0, max: 10, step: 0.5, label: "Border Intensity" },
      dissolveBackgroundColor: { value: "#023c46", label: "Background Color" },
    }
  );

  return (
    <main className="h-[100vh]">
      <ReactLenis root />
      <div className="p-10 h-full w-full relative">
        <WebGPUCanvas className="h-full w-full rounded-lg overflow-hidden" shadows cameraProps={{ position: [0, 10, -2], far: 500, fov: 30, near: 0.1 }}>
          <ambientLight intensity={0.5} />

          {/* Add your 3D content here */}
          <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
          <color attach="background" args={[backgroundColor]} />

          <Sea />
          <Ireland />
          <Clouds />
          <Sheep />
          <Markers bokehScale={bokehScale} />
          <CameraController />
          <PostProcessing
            focusDistance={focusDistance}
            focalLength={focalLength}
            bokehScale={bokehScale}
            dissolveSize={dissolveSize}
            dissolveThickness={dissolveThickness}
            dissolveColor={dissolveColor}
            dissolveIntensity={dissolveIntensity}
            dissolveBackgroundColor={dissolveBackgroundColor}
            animateDissove={animateDissove}
            dissolveDuration={dissolveDuration}
          />
        </WebGPUCanvas>

        {/* Logo with white background and inverted borders */}
        <div className="absolute top-10 left-10 z-10">
          <div className="relative bg-white p-2 rounded-tl-lg rounded-br-lg">
            <img src="/inis-stor/logo.png" alt="Inis Stór Logo" className="w-48 -translate-y-1 h-auto" />

            {/* Top right inverted border */}
            <div
              ref={topRightBorderRef}
              className="absolute bottom-0 -right-[10px] h-[111px] w-[10px] rounded-tl-[10px]"
              style={{
                backgroundColor: "transparent",
                boxShadow: "0 -10px 0 0 #ffffff",
                transformOrigin: "left center",
              }}
            />

            {/* Bottom left inverted border */}
            <div
              ref={bottomLeftBorderRef}
              className="absolute bottom-[-50px] left-[-0px] h-[50px] w-[10px] rounded-tl-[10px] rotate-0"
              style={{
                backgroundColor: "transparent",
                boxShadow: "0 -10px 0 0 #ffffff",
                transformOrigin: "left left",
              }}
            />
          </div>
        </div>
      </div>
      <FilterBar />
      {/* <MakerModal /> */}
      <Leva hidden={true} />
    </main>
  );
}
