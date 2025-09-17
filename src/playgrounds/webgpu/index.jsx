import InteractiveSphere from "./InteractiveSphere";
import WebGPUCanvas from "./WebGPUCanvas";

export default function WebGPU() {
  return (
    <main>
      <WebGPUCanvas>
        <ambientLight intensity={1} />
        <pointLight intensity={3} position={[0, 2, 2]} />
        <InteractiveSphere />
        {/* <BloomPass /> */}
      </WebGPUCanvas>
    </main>
  );
}
