import React, { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sampler, useTexture } from "@react-three/drei";
import Perlin from "perlin.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import vertex from "../../../shaders/grass/vertex.glsl";
import fragment from "../../../shaders/grass/fragment.glsl";
import gsap from "gsap";

Perlin.seed(Math.random());
import { Flower } from "./Flower";
import { useControls } from "leva";

export function Grass({ children, strands = 200, grown = false, ...props }) {
  const alpha = useTexture("/alpha.jpg");
  const meshRef = useRef(null);
  const flowerRef = useRef();

  useEffect(() => {
    meshRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 4));
    meshRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.15));
    flowerRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    flowerRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.1));
  }, []);

  const geomRef = useRef();

  const transform = useCallback(({ position, normal, dummy: object }) => {
    const p = position.clone().multiplyScalar(5);
    const n = Perlin.simplex3(...p.toArray());
    object.scale.setScalar(THREE.MathUtils.mapLinear(n, -1, 1, 0.6, 1.1) * 0.5);

    object.position.copy(position);
    object.lookAt(normal.add(position));
    object.rotation.y += Math.random() - 0.5 * (Math.PI * 0.5);
    object.rotation.z += Math.random() - 0.5 * (Math.PI * 0.5);
    object.rotation.x += Math.random() - 0.5 * (Math.PI * 0.5);
    object.updateMatrix();
    return object;
  }, []);

  const transformFlower = useCallback(({ position, normal, dummy: object }) => {
    object.scale.setScalar((Math.random() * 0.5 + 0.5) * 0.023);
    object.position.copy(position);

    object.rotation.y += Math.random() - 0.5 * (Math.PI * 0.5);
    object.rotation.z += Math.random() - 0.5 * (Math.PI * 0.5);
    object.rotation.x += Math.random() - 0.5 * (Math.PI * 0.5);
    object.updateMatrix();
    return object;
  }, []);

  const grassControlOptions = useMemo(
    () => ({
      colorA: { value: "#757633" },
      colorB: { value: "#414124" },
    }),
    []
  );
  const grassControls = useControls("Bubble Shader", grassControlOptions);

  const grassMaterial = useMemo(() => {
    return new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      color: "#5789ff",
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide,
      alphaMap: alpha,
      alphaTest: 0.4,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(grassControls.colorA) },
        uColorB: { value: new THREE.Color(grassControls.colorB) },
        u_sway: { value: 1.2 },
        u_length: { value: 2.2 },
        uGrowth: { value: 0.0 },
        uOpacity: { value: 0.0 },
      },
    });
  }, [alpha, fragment, grassControls.colorA, grassControls.colorB, vertex]);

  const depthMaterial = useMemo(() => {
    return new CustomShaderMaterial({
      // CSM
      baseMaterial: THREE.MeshDepthMaterial,
      vertexShader: vertex,

      // MeshDepthMaterial
      depthPacking: THREE.RGBADepthPacking,
    });
  });

  useFrame(({ clock }) => {
    if (!grassMaterial) return;
    const material = grassMaterial;
    material.uniforms.uTime.value = clock.elapsedTime / 10;
    material.uniforms.uColorA.value.set(grassControls.colorA);
    material.uniforms.uColorB.value.set(grassControls.colorB);
  });

  useEffect(() => {
    gsap.to(grassMaterial.uniforms.uGrowth, {
      value: grown ? 1.0 : 0.0,
      duration: 2,
      delay: 0.1,
      ease: "power3.inOut",
    });

    gsap.to(grassMaterial.uniforms.uOpacity, {
      value: grown ? 1.0 : 0.0,
      duration: 1.5,
      ease: "power3.inOut",
    });
  }, [grown]);

  return (
    <>
      {React.cloneElement(children, {
        ref: geomRef,
      })}
      <instancedMesh customDepthMaterial={depthMaterial} frustumCulled={false} material={grassMaterial} ref={meshRef} args={[undefined, undefined, strands]}>
        <planeGeometry args={[0.035, 0.4, 2, 20, false, 0, Math.PI]} />
      </instancedMesh>

      <Flower ref={flowerRef} grown={grown} />
      <group>
        <Sampler count={strands} transform={transform} mesh={geomRef} instances={meshRef} />
        <Sampler count={2} transform={transformFlower} mesh={geomRef} instances={flowerRef} />
      </group>
    </>
  );
}
