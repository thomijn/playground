import React, { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import { Sampler, useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { Fn, uniform, vec4, vec3, uv, mix, time, positionLocal, texture, vec2, positionWorld, modelWorldMatrix, mx_fractal_noise_vec3 } from "three/tsl";
import Perlin from "perlin.js";
import gsap from "gsap";

Perlin.seed(Math.random());

export function Grass({ children, strands = 2, grown = false, ...props }) {
  const alpha = useTexture("/inis-stor/alpha.jpg");
  const perlinTexture = useTexture("/perlin.png");
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  const meshRef = useRef(null);
  const geomRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 4));
      meshRef.current.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.15));
    }
  }, []);

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

  // Leva controls
  const { colorA, colorB, swayAmount, swaySpeed, grassLength, windScale, windStrength, windSpeed } = useControls("Grass", {
    colorA: { value: "#10413d", label: "Tip Color" },
    colorB: { value: "#135f3d", label: "Base Color" },
    swayAmount: { value: 1.2, min: 0, max: 5, step: 0.1, label: "Sway Amount" },
    swaySpeed: { value: 1.3, min: 0, max: 2, step: 0.1, label: "Sway Speed" },
    grassLength: { value: 0.4, min: 0.1, max: 5, step: 0.1, label: "Grass Length" },
    windScale: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: "Wind Scale" },
    windStrength: { value: 0.8, min: 0, max: 3, step: 0.1, label: "Wind Strength" },
    windSpeed: { value: 1.2, min: 0, max: 2, step: 0.1, label: "Wind Speed" },
  });

  // Create uniforms
  const uniforms = useMemo(
    () => ({
      uTime: uniform(0),
      uColorA: uniform(new THREE.Color(colorA)),
      uColorB: uniform(new THREE.Color(colorB)),
      uSway: uniform(swayAmount),
      uSwaySpeed: uniform(swaySpeed),
      uLength: uniform(grassLength),
      uGrowth: uniform(grown ? 1.0 : 0.0),
      uOpacity: uniform(grown ? 1.0 : 0.0),
      uWindScale: uniform(windScale),
      uWindStrength: uniform(windStrength),
      uWindSpeed: uniform(windSpeed),
    }),
    []
  );

  // Create grass material with TSL
  const grassMaterial = useMemo(() => {
    const material = new THREE.MeshBasicNodeMaterial();
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.alphaTest = 0.6;

    // Position modifier function
    material.positionNode = Fn(() => {
      const pos = positionLocal;
      const meshUV = uv();

      // Use UV coordinates to determine height along blade
      const heightFactor = meshUV.y;

      // Manually compute world position using model matrix
      const worldPos = modelWorldMatrix.mul(vec4(pos, 1.0)).xyz;
      
      // Use fractal noise instead of texture for per-blade variation
      const noisePos = vec3(worldPos.x, worldPos.y, time.mul(uniforms.uWindSpeed)).mul(uniforms.uWindScale);
      const noiseResult = mx_fractal_noise_vec3(noisePos, 3, 2.0, 0.5);
      
      // mx_fractal_noise_vec3 returns vec3 with values roughly -1 to 1
      // Convert to 0-1 range: (value + 1) / 2
      const noiseValueRaw = noiseResult.x.add(1.0).mul(0.5);
      
      // Apply smoothstep for more contrast (optional)
      const noiseValue = noiseValueRaw.smoothstep(0.3, 0.7);
      // Simple periodic sway using time - multiply by noiseValue for wind effect
      // Add 0.2 so there's always some base movement
      const swayX = time.mul(uniforms.uSwaySpeed).sin().mul(heightFactor.mul(heightFactor)).mul(uniforms.uSway).mul(0.1).mul(noiseValue.add(0.2));
      const swayY = time.mul(uniforms.uSwaySpeed).cos().mul(heightFactor.mul(heightFactor)).mul(uniforms.uSway).mul(0.1).mul(noiseValue.add(0.2));

      // Apply growth animation
      const grownPos = vec3(pos.x.add(swayX), pos.y.add(swayY), pos.z.mul(uniforms.uGrowth).mul(uniforms.uLength));

      return grownPos;
    })();

    // Color and alpha node
    material.colorNode = Fn(() => {
      const meshUV = uv();
      const gradientColor = mix(uniforms.uColorB, uniforms.uColorA, meshUV.y);

      // Sample alpha texture
      const alphaTexture = texture(alpha);
      const alphaValue = alphaTexture.sample(meshUV).r;

      // Apply opacity
      const finalAlpha = alphaValue.mul(uniforms.uOpacity);

      // Use same fractal noise as position for visualization
      const worldPos = positionWorld;
      const noisePos = vec3(worldPos.x, worldPos.z, time.mul(uniforms.uWindSpeed)).mul(uniforms.uWindScale);
      const noiseResult = mx_fractal_noise_vec3(noisePos, 3, 2.0, 0.5);
      
      // Convert from -1,1 to 0,1 range
      const noiseValueRaw = noiseResult.x.add(1.0).mul(0.5);
      const noiseValue = noiseValueRaw.smoothstep(0.3, 0.7);

      const finalColor = vec3(gradientColor)
      
      const mixedColor = mix(finalColor, uniforms.uColorB, noiseValue.mul(1));

      // Show noise in color for debugging (or use gradientColor for final)
      return vec4(mixedColor, alphaValue);
    })();

    return material;
  }, [uniforms, alpha, perlinTexture]);

  // Update uniforms
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uColorA.value.set(colorA);
    uniforms.uColorB.value.set(colorB);
    uniforms.uSway.value = swayAmount;
    uniforms.uSwaySpeed.value = swaySpeed;
    uniforms.uLength.value = grassLength;
    uniforms.uWindScale.value = windScale;
    uniforms.uWindStrength.value = windStrength;
    uniforms.uWindSpeed.value = windSpeed;
  });

  // Animate growth
  useEffect(() => {
    gsap.to(uniforms.uGrowth, {
      value: grown ? 1.0 : 0.0,
      duration: 2,
      delay: 0.1,
      ease: "power3.inOut",
    });

    gsap.to(uniforms.uOpacity, {
      value: grown ? 1.0 : 0.0,
      duration: 1.5,
      ease: "power3.inOut",
    });
  }, [grown, uniforms]);

  console.log(geomRef);

  return (
    <>
      {React.cloneElement(children, {
        ref: geomRef,
      })}
      <instancedMesh frustumCulled={false} material={grassMaterial} ref={meshRef} args={[undefined, undefined, strands]}>
        <planeGeometry args={[0.015, 0.4, 2, 20]} />
      </instancedMesh>

      <group>
        <Sampler count={strands} transform={transform} mesh={geomRef} weight="color" instances={meshRef} />
      </group>
    </>
  );
}
