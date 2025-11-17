import React, { useMemo } from "react";
import { useGLTF, useMatcapTexture } from "@react-three/drei";
import { MeshMatcapNodeMaterial } from "three/webgpu";

const Sheep = () => {
  const { nodes, materials } = useGLTF("/inis-stor/ireland.glb");
  
  // Load matcap textures
  const [sheepMatcap] = useMatcapTexture("E2D3BC_867255_B39E7F_96836C", 1024); // Soft white/cream for sheep
  const [fenceMatcap] = useMatcapTexture("4B362C_715A4F_211913_644C44", 1024); // Gray/wood for fence

  // Create materials
  const sheepMaterial = useMemo(() => {
    if (!sheepMatcap) return null;
    return new MeshMatcapNodeMaterial({
      matcap: sheepMatcap,
    });
  }, [sheepMatcap]);

  const fenceMaterial = useMemo(() => {
    if (!fenceMatcap) return null;
    return new MeshMatcapNodeMaterial({
      matcap: fenceMatcap,
    });
  }, [fenceMatcap]);

  if (!sheepMaterial || !fenceMaterial) return null;

  return (
    <>
      <mesh castShadow geometry={nodes.babysheep.geometry} material={sheepMaterial} />
      <mesh castShadow geometry={nodes.fence.geometry} material={fenceMaterial} />
      <mesh castShadow geometry={nodes.mommysheep.geometry} material={sheepMaterial} />
    </>
  );
};

export default Sheep;
