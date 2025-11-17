import React, { useMemo, useRef, useEffect } from "react";
import { useGLTF, useMatcapTexture } from "@react-three/drei";
import { useControls } from "leva";
import { positionWorld, texture, uniform, vec2, vec3, vec4, mix, color, add, mul, normalWorld, mx_fractal_noise_vec3, attribute } from "three/tsl";
import * as THREE from "three/webgpu";
import { MeshMatcapNodeMaterial, MeshBasicNodeMaterial } from "three/webgpu";
import { Grass } from "./Grass";

export function Ireland(props) {
  const { nodes, materials } = useGLTF("/inis-stor/ireland.glb");
  const [matcap, url] = useMatcapTexture(
    "415325_83A24E_678239_748C3C", // index of the matcap texture https://github.com/emmelleppi/matcaps/blob/master/matcap-list.json
    1024 // size of the texture ( 64, 128, 256, 512, 1024 )
  );

  const materialRef = useRef();
  const meshRef = useRef();

  // Leva controls for the material
  const {
    color1,
    color2,
    noiseScale,
    noiseAmplitude,
    noiseOctaves,
    mixThreshold,
    mixSmoothness,
    shorelineHeight,
    shorelineThickness,
    shorelineColor,
    showGrass,
    grassStrands,
    grassGroundColor,
  } = useControls("Ireland Material", {
    color1: { value: "#ffffff", label: "Color 1" },
    color2: { value: "#e5e5e5", label: "Color 2" },
    noiseScale: { value: 0.4, min: 0.1, max: 10, step: 0.1, label: "Noise Scale" },
    noiseAmplitude: { value: 1.5, min: 0, max: 5, step: 0.1, label: "Noise Amplitude" },
    noiseOctaves: { value: 4, min: 1, max: 8, step: 1, label: "Noise Octaves" },
    mixThreshold: { value: 0.36, min: 0, max: 1, step: 0.01, label: "Mix Threshold" },
    mixSmoothness: { value: 1, min: 0.01, max: 1, step: 0.01, label: "Mix Smoothness" },
    shorelineHeight: { value: -0.6, min: -5, max: 5, step: 0.01, label: "Shoreline Height" },
    shorelineThickness: { value: 0.86, min: 0.001, max: 1, step: 0.001, label: "Shoreline Thickness" },
    shorelineColor: { value: "#ffffff", label: "Shoreline Color" },
    showGrass: { value: true, label: "Show Grass" },
    grassStrands: { value: 500000, min: 100, max: 20000, step: 100, label: "Grass Strands" },
    grassGroundColor: { value: "#072e2b", label: "Grass Ground Color" },
  });

  // Create uniforms that persist across renders
  const uniforms = useMemo(
    () => ({
      uColor1: uniform(new THREE.Color(color1)),
      uColor2: uniform(new THREE.Color(color2)),
      uNoiseScale: uniform(noiseScale),
      uNoiseAmplitude: uniform(noiseAmplitude),
      uNoiseOctaves: uniform(noiseOctaves),
      uMixThreshold: uniform(mixThreshold),
      uMixSmoothness: uniform(mixSmoothness),
      uShorelineHeight: uniform(shorelineHeight),
      uShorelineThickness: uniform(shorelineThickness),
      uShorelineColor: uniform(new THREE.Color(shorelineColor)),
      uGrassGroundColor: uniform(new THREE.Color(grassGroundColor)),
    }),
    []
  ); // Empty dependency array - create once

  // Create the custom material with TSL color node
  const material = useMemo(() => {
    const mat = new MeshMatcapNodeMaterial({
      matcap: matcap,
    });

    // Get world position XZ coordinates
    const worldPos = positionWorld;
    const xz = vec2(worldPos.x, worldPos.z);

    // Scale the coordinates for noise
    const scaledPos = mul(xz, uniforms.uNoiseScale);

    // Create 3D position for fractal noise (using 0 for Y)
    const noisePos = vec3(scaledPos.x, scaledPos.y, 0.0);

    // Generate fractal noise using mx_fractal_noise_vec3
    // Parameters: position, octaves, lacunarity, diminish
    const noiseResult = mx_fractal_noise_vec3(noisePos, uniforms.uNoiseOctaves.toInt(), 2.0, 0.5);

    // Extract single value from noise result (using x component)
    const noiseValue = mul(noiseResult.x, uniforms.uNoiseAmplitude);

    // Create mix factor with threshold and smoothness
    const mixFactor = noiseValue.sub(uniforms.uMixThreshold).div(uniforms.uMixSmoothness).add(0.5).clamp(0.0, 1.0);

    // Mix between two colors
    const customColorNode = mix(uniforms.uColor1, uniforms.uColor2, mixFactor);

    // Sample matcap texture
    const matcapTexture = texture(matcap);
    const normal = normalWorld;
    const matcapUV = mul(add(normal.xy, vec2(1.0)), 0.5);
    const matcapColor = matcapTexture.sample(matcapUV).rgb;

    // Multiply matcap color with our custom color
    const baseColor = vec4(mul(matcapColor, customColorNode), 1.0);

    // Calculate shoreline effect based on Y position (hard line, no gradient)
    const yPos = worldPos.y;
    const distanceFromShoreline = yPos.sub(uniforms.uShorelineHeight).abs();
    // Use step function for hard edge: 1.0 if within thickness, 0.0 otherwise
    const shorelineMask = distanceFromShoreline.lessThan(uniforms.uShorelineThickness).toFloat();

    // Mix base color with pure shoreline color (not affected by matcap)
    const pureShorelineColor = vec4(uniforms.uShorelineColor, 1.0);
    const finalOutput = mix(baseColor, pureShorelineColor, shorelineMask);

    // Assign the color node to the material
    mat.colorNode = finalOutput;

    // Store reference to material
    materialRef.current = mat;

    return mat;
  }, [matcap, uniforms]);

  const grassGroundMaterial = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;

    // Get the vertex color attribute (RGB values from Sampler weight)
    const colorAttribute = attribute("color");

    // Create color node from uniform and use color attribute as alpha
    // const baseColor = color(uniforms.uColor1);
    mat.colorNode = vec4(uniforms.uGrassGroundColor, colorAttribute.r);

    return mat;
  }, [uniforms]);

  console.log(nodes)

  // Update uniforms when Leva controls change
  useEffect(() => {
    uniforms.uColor1.value.set(color1);
    uniforms.uColor2.value.set(color2);
    uniforms.uNoiseScale.value = noiseScale;
    uniforms.uNoiseAmplitude.value = noiseAmplitude;
    uniforms.uNoiseOctaves.value = noiseOctaves;
    uniforms.uMixThreshold.value = mixThreshold;
    uniforms.uMixSmoothness.value = mixSmoothness;
    uniforms.uShorelineHeight.value = shorelineHeight;
    uniforms.uShorelineThickness.value = shorelineThickness;
    uniforms.uShorelineColor.value.set(shorelineColor);
    uniforms.uGrassGroundColor.value.set(grassGroundColor);
  }, [color1, color2, noiseScale, noiseAmplitude, noiseOctaves, mixThreshold, mixSmoothness, shorelineHeight, shorelineThickness, shorelineColor, uniforms]);

  return (
    <group {...props} dispose={null} position={[0, 0, 0]} scale={1}>
      <mesh receiveShadow geometry={nodes["ireland-map"].geometry} material={material} ref={meshRef} />
      {showGrass && (
        <Grass strands={grassStrands} grown={true}>
          <mesh geometry={nodes["Plane"].geometry} visible={true} material={grassGroundMaterial} />
        </Grass>
      )}
    </group>
  );
}
