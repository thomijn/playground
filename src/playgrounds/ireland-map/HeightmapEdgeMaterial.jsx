import { useFrame } from "@react-three/fiber";
import { useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { Fn, uniform, vec4, texture, uv, mix, time, vec2 } from "three/tsl";
import * as THREE from "three/webgpu";

export const HeightmapEdgeMaterial = ({ heightmapPath = "/inis-stor/height-map.webp", ...props }) => {
  // Load heightmap texture
  const heightmapTexture = useTexture(heightmapPath);
  heightmapTexture.flipY = false;

  // Load perlin noise texture
  const perlinTexture = useTexture("/perlin.png");
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  // Leva controls for gradient colors
  const { gradientColor1, gradientColor2 } = useControls("Heightmap Gradient", {
    gradientColor1: { value: "#0d0d0d", label: "Near Color (Shore)" },
    gradientColor2: { value: "#072e2b", label: "Far Color" },
  });

  // Leva controls for noise and effects
  const { noiseScale, noiseFrequency, noiseThreshold, rippleSpeed, rippleFrequency, heightThreshold, rippleThreshold } = useControls("Heightmap Effects", {
    noiseScale: { value: 19, min: 0.1, max: 20.0, step: 0.1, label: "Noise Scale" },
    noiseFrequency: { value: 0.9, min: 0.0, max: 5.0, step: 0.1, label: "Noise Frequency" },
    noiseThreshold: { value: 0.59, min: 0.0, max: 1.0, step: 0.01, label: "Noise Threshold" },
    rippleSpeed: { value: 0.02, min: 0.0, max: 0.1, step: 0.001, label: "Ripple Speed" },
    rippleFrequency: { value: 25, min: 1, max: 200, step: 1, label: "Ripple Frequency" },
    heightThreshold: { value: 0.57, min: 0.0, max: 1.0, step: 0.01, label: "Height Threshold" },
    rippleThreshold: { value: 0.03, min: 0.0, max: 0.1, step: 0.001, label: "Ripple Threshold" },
  });

  // Create uniforms that persist across renders
  const uniforms = useMemo(
    () => ({
      uGradientColor1: uniform(new THREE.Color(gradientColor1)),
      uGradientColor2: uniform(new THREE.Color(gradientColor2)),
      uNoiseScale: uniform(noiseScale),
      uNoiseFrequency: uniform(noiseFrequency),
      uNoiseThreshold: uniform(noiseThreshold),
      uRippleSpeed: uniform(rippleSpeed),
      uRippleFrequency: uniform(rippleFrequency),
      uHeightThreshold: uniform(heightThreshold),
      uRippleThreshold: uniform(rippleThreshold),
    }),
    []
  );

  const { nodes } = useMemo(() => {
    const outputNode = Fn(() => {
      // Get UV coordinates directly from mesh
      const meshUV = uv();

      // Sample the heightmap texture
      const heightmapNode = texture(heightmapTexture);
      // heightValue is 0 at land/shore, increases as we go away from shore
      const heightValue = heightmapNode.sample(meshUV).r;

      // Sample perlin noise texture
      const noiseUV = uv().mul(vec2(1, 1)).mul(noiseScale).sub(time.mul(0.02))
      
      const noiseNode = texture(perlinTexture);
      const noiseValue = noiseNode.sample(noiseUV).r.mul(uniforms.uNoiseFrequency).mul(heightValue.oneMinus().add(0.5))
      
      // const steppedHeightValue = heightValue.smoothstep(0.1, 2.0);

      const ripple = heightValue.add(time.mul(uniforms.uRippleSpeed)).mul(uniforms.uRippleFrequency).mod(2).sub(heightValue.oneMinus())
      const rippleIndex = ripple.floor();
      
      heightValue.greaterThan(uniforms.uHeightThreshold).discard();
      ripple.greaterThan(uniforms.uRippleThreshold).discard();
      noiseValue.lessThan(uniforms.uNoiseThreshold).discard();
       
      // Mix between two colors based on height value
      // const gradientColor = mix(uniforms.uGradientColor1, uniforms.uGradientColor2, heightValue);
      const finalColor = vec4(heightValue.oneMinus(), heightValue.oneMinus(), heightValue.oneMinus(), 1.0);

      return vec4(finalColor.rgb, heightValue.oneMinus().sub(0.4).clamp(0.0, 0.3));
    })();

    return {
      nodes: {
        outputNode: outputNode
      },
    };
  }, [heightmapTexture, perlinTexture, uniforms]);

  // Update uniforms when Leva controls change
  useEffect(() => {
    uniforms.uGradientColor1.value.set(gradientColor1);
    uniforms.uGradientColor2.value.set(gradientColor2);
    uniforms.uNoiseScale.value = noiseScale;
    uniforms.uNoiseFrequency.value = noiseFrequency;
    uniforms.uNoiseThreshold.value = noiseThreshold;
    uniforms.uRippleSpeed.value = rippleSpeed;
    uniforms.uRippleFrequency.value = rippleFrequency;
    uniforms.uHeightThreshold.value = heightThreshold;
    uniforms.uRippleThreshold.value = rippleThreshold;
  }, [gradientColor1, gradientColor2, noiseScale, noiseFrequency, noiseThreshold, rippleSpeed, rippleFrequency, heightThreshold, rippleThreshold, uniforms]);

  return <meshBasicNodeMaterial transparent={true} {...props} {...nodes} />;
};
