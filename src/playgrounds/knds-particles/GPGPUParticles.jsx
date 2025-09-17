import { useGLTF } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { lerp, randInt } from "three/src/math/MathUtils.js";

import { Fn } from "three/src/nodes/TSL.js";
import {
  ceil,
  color,
  cos,
  deltaTime,
  hash,
  If,
  instancedArray,
  instanceIndex,
  length,
  min,
  mix,
  mx_fractal_noise_vec3,
  range,
  saturate,
  sin,
  smoothstep,
  sqrt,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { AdditiveBlending, Color, DataTexture, FloatType, RGBAFormat, SpriteNodeMaterial } from "three/webgpu";

const randValue = /*#__PURE__*/ Fn(({ min, max, seed = 42 }) => {
  return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min);
});

const MODEL_COLORS = {
  Fox: {
    start: "#00ff49",
    end: "#0040ff",
    emissiveIntensity: 0.1,
  },
  Book: {
    start: "#e8b03b",
    end: "white",
    emissiveIntensity: 0.08,
  },
  Wawa: {
    start: "#5945ce",
    end: "#bbafff",
    emissiveIntensity: 0.6,
  },
};

const tmpColor = new Color();

export const GPGPUParticles = ({ nbParticles = 200000 }) => {
  const { scene: foxScene } = useGLTF("/leclerc-2.glb");

  const { curGeometry, noiseColor1, noiseColor2, emissiveIntensity, particleSize, particleShape, noiseScale, noiseStrength, timeSpeed, targetSpeed, noiseMovementSpeed, spawnShape, spawnSize, spawnPosition, spawnHeight, flowfieldStrength, flowfieldScale, flowfieldSpeed, proximityFactor } = useControls({
    curGeometry: {
      options: ["Fox", "Book", "Wawa"],
      value: "Fox",
    },
    noiseColor2: "#D6CFBB",
    noiseColor1: "#01274D",
    emissiveIntensity: 0.1,
    particleSize: { value: 0.08, min: 0.001, max: 0.2, step: 0.001 },
    particleShape: {
      options: ["rounded", "plane"],
      value: "plane",
    },
    noiseScale: { value: 0.2, min: 0.1, max: 5.0, step: 0.1 },
    noiseStrength: { value: 2.0, min: 0.0, max: 2.0, step: 0.1 },
    timeSpeed: { value: 1, min: 0.0, max: 2.0, step: 0.1 },
    targetSpeed: { value: 0.1, min: 0.001, max: 2.2, step: 0.001 },
    noiseMovementSpeed: { value: 0.3, min: 0.0, max: 2.0, step: 0.01 },
    spawnShape: {
      options: ["cube", "sphere", "plane", "line"],
      value: "sphere",
    },
    spawnSize: { value: 50.0, min: 0.1, max: 100.0, step: 0.1 },
    spawnPosition: { value: { x: 0, y: 20, z: 0 }, step: 0.1 },
    spawnHeight: { value: 5.0, min: -5.0, max: 5.0, step: 0.1 },
    flowfieldStrength: { value: 2, min: 0.0, max: 3.0, step: 0.1 },
    flowfieldScale: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    flowfieldSpeed: { value: 0.15, min: 0.0, max: 0.2, step: 0.01 },
    proximityFactor: { value: 0.5, min: 0.0, max: 2.0, step: 0.1 },
  });

  const geometries = useMemo(() => {
    const geometries = [];
    const sceneToTraverse = {
      Fox: foxScene,
    }[curGeometry];

    sceneToTraverse.traverse((child) => {
      if (child.isMesh) {
        geometries.push(child.geometry);
      }
    });
    return geometries;
  }, [curGeometry, foxScene]);

  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(nbParticles)); // Make a square texture
    const data = new Float32Array(size * size * 4);

    for (let i = 0; i < nbParticles; i++) {
      data[i * 4 + 0] = 0; // X
      data[i * 4 + 1] = 0; // Y
      data[i * 4 + 2] = 0; // Z
      data[i * 4 + 3] = 1; // Alpha (not needed, but required for 4-component format)
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    return texture;
  }, [nbParticles]);

  useEffect(() => {
    if (geometries.length === 0) return;
    for (let i = 0; i < nbParticles; i++) {
      const geometryIndex = randInt(0, geometries.length - 1);
      const randomGeometryIndex = randInt(0, geometries[geometryIndex].attributes.position.count - 1);
      targetPositionsTexture.image.data[i * 4 + 0] = geometries[geometryIndex].attributes.position.array[randomGeometryIndex * 3 + 0];
      targetPositionsTexture.image.data[i * 4 + 1] = geometries[geometryIndex].attributes.position.array[randomGeometryIndex * 3 + 1];
      targetPositionsTexture.image.data[i * 4 + 2] = geometries[geometryIndex].attributes.position.array[randomGeometryIndex * 3 + 2];
      targetPositionsTexture.image.data[i * 4 + 3] = 1;
    }
    targetPositionsTexture.needsUpdate = true;
  }, [geometries]);

  const gl = useThree((state) => state.gl);

  const { nodes, uniforms, computeUpdate } = useMemo(() => {
    // uniforms - initialize with default values, will be updated in useFrame
    const uniforms = {
      noiseColor1: uniform(color("#ff4444")),
      noiseColor2: uniform(color("#4444ff")),
      emissiveIntensity: uniform(0.1),
      particleSize: uniform(0.05),
      noiseScale: uniform(1.0),
      noiseStrength: uniform(1.0),
      time: uniform(0.0),
      timeSpeed: uniform(0.2),
      targetSpeed: uniform(0.03),
      noiseMovementSpeed: uniform(0.3),
      spawnSize: uniform(3.0),
      spawnPosX: uniform(0.0),
      spawnPosY: uniform(5.0),
      spawnPosZ: uniform(0.0),
      spawnHeight: uniform(0.0),
      flowfieldStrength: uniform(0.5),
      flowfieldScale: uniform(1.0),
      flowfieldSpeed: uniform(0.05),
      proximityFactor: uniform(0.5),
    };

    // buffers
    const spawnPositionsBuffer = instancedArray(nbParticles, "vec3");
    const offsetPositionsBuffer = instancedArray(nbParticles, "vec3");
    const agesBuffer = instancedArray(nbParticles, "float");

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);

    // init Fn
    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 });

    const computeInit = Fn(() => {
      // Generate spawn position based on selected shape
      let spawnPos;
      
      if (spawnShape === "cube") {
        // Cube spawn area
        spawnPos = vec3(
          randValue({ min: -1, max: 1, seed: 0 }).mul(uniforms.spawnSize),
          randValue({ min: -1, max: 1, seed: 1 }).mul(uniforms.spawnSize),
          randValue({ min: -1, max: 1, seed: 2 }).mul(uniforms.spawnSize)
        );
      } else if (spawnShape === "sphere") {
        // Sphere spawn area
        const radius = sqrt(randValue({ min: 0, max: 10, seed: 3 })).mul(uniforms.spawnSize);
        const theta = randValue({ min: 0, max: 6.28318, seed: 4 }); // 0 to 2π
        const phi = randValue({ min: 0, max: 3.14159, seed: 5 }); // 0 to π
        spawnPos = vec3(
          radius.mul(sin(phi)).mul(cos(theta)).add(10),
          radius.mul(sin(phi)).mul(sin(theta)),
          radius.mul(cos(phi)).a
        );
      } else if (spawnShape === "plane") {
        // Plane spawn area (XZ plane)
        spawnPos = vec3(
          randValue({ min: -1, max: 1, seed: 0 }).mul(uniforms.spawnSize),
          uniforms.spawnHeight,
          randValue({ min: -1, max: 1, seed: 2 }).mul(uniforms.spawnSize)
        );
      } else { // "line"
        // Line spawn area (along X axis)
        spawnPos = vec3(
          randValue({ min: -1, max: 1, seed: 0 }).mul(uniforms.spawnSize),
          uniforms.spawnHeight,
          0
        );
      }
      
      // Add spawn position offset
      spawnPos = spawnPos.add(vec3(uniforms.spawnPosX, uniforms.spawnPosY, uniforms.spawnPosZ));
      
      spawnPosition.assign(spawnPos);
      offsetPosition.assign(0);
      age.assign(randValue({ min: 0, max: lifetime, seed: 11 }));
    })().compute(nbParticles);

    gl.computeAsync(computeInit);

    // Use uniform values for speeds with some random variation
    const instanceSpeed = uniforms.targetSpeed.mul(randValue({ min: 0.5, max: 1.5, seed: 12 }));
    const offsetSpeed = uniforms.noiseMovementSpeed.mul(randValue({ min: 0.5, max: 1.5, seed: 14 }));

    // Texture data
    const size = ceil(sqrt(nbParticles));
    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    const targetPos = texture(targetPositionsTexture, vec2(x, y)).xyz;

    // update Fn
    const computeUpdate = Fn(() => {
      const distanceToTarget = targetPos.sub(spawnPosition);
      const distanceLength = distanceToTarget.length();
      
      // Primary movement toward target
      If(distanceLength.greaterThan(0.01), () => {
        spawnPosition.addAssign(distanceToTarget.normalize().mul(min(instanceSpeed, distanceLength)));
      });
      
      // Flowfield movement - similar to face-tracking version
      const breathingCycle = age.mul(uniforms.flowfieldSpeed.mul(10)).sin().mul(0.5).add(0.5); // 0 to 1
      const flowfieldDrift = mx_fractal_noise_vec3(
        spawnPosition.mul(uniforms.flowfieldScale).add(uniforms.time.mul(uniforms.flowfieldSpeed))
      ).mul(uniforms.flowfieldStrength).mul(breathingCycle);
      
      // Apply flowfield drift with proximity control
      const proximityEffect = smoothstep(uniforms.proximityFactor.mul(2), uniforms.proximityFactor.mul(0.5), distanceLength);
      offsetPosition.addAssign(
        flowfieldDrift.mul(offsetSpeed).mul(proximityEffect).mul(deltaTime)
      );
      
      // Original noise-based movement (reduced to work with flowfield)
      offsetPosition.addAssign(
        mx_fractal_noise_vec3(spawnPosition.mul(age)).mul(offsetSpeed.mul(0.3)).mul(deltaTime)
      );
      
      // Gentle decay of offset
      offsetPosition.mulAssign(0.995);

      age.addAssign(deltaTime);

      If(age.greaterThan(lifetime), () => {
        age.assign(0);
        offsetPosition.assign(0);
      });
    })().compute(nbParticles);

    const scale = vec3(uniforms.particleSize.mul(range(0.5, 1.5)));
    const particleLifetimeProgress = saturate(age.div(lifetime));

    // Add a random offset to the particles
    const randOffset = vec3(range(-0.001, 0.001), range(-0.001, 0.001), range(-0.001, 0.001));

    // Calculate world position for noise sampling
    const worldPosition = spawnPosition.add(offsetPosition).add(randOffset);

    // Add time-based movement to the noise sampling position
    const timeOffset = vec3(uniforms.time.mul(uniforms.timeSpeed));
    const animatedPosition = worldPosition.add(timeOffset);

    // Use fractal noise based on animated world position to mix between two colors
    const noiseValue = mx_fractal_noise_vec3(animatedPosition.mul(uniforms.noiseScale)).x.mul(uniforms.noiseStrength);
    const noiseMix = saturate(noiseValue.mul(0.5).add(0.5)); // Normalize to 0-1 range

    const colorNode = vec4(
      mix(uniforms.noiseColor2, uniforms.noiseColor1, noiseMix),
      randValue({ min: 0, max: 1, seed: 6 }) // Alpha
    );

    // Conditional shape rendering based on particleShape control
    let finalColor;
    if (particleShape === "rounded") {
      // Transform the particles to a circle
      const dist = length(uv().sub(0.5));
      const circle = smoothstep(0.5, 0.49, dist);
      finalColor = colorNode.mul(circle);
    } else {
      // Plane particles - just use the color as is
      finalColor = colorNode;
    }

    return {
      uniforms,
      computeUpdate,
      nodes: {
        positionNode: spawnPosition.add(offsetPosition).add(randOffset),
        colorNode: finalColor,
        emissiveNode: finalColor.mul(uniforms.emissiveIntensity),
        scaleNode: scale.mul(smoothstep(1, 0, particleLifetimeProgress)),
      },
    };
  }, [particleShape, spawnShape, nbParticles]);

  const lerpedNoiseColor1 = useRef(new Color(noiseColor1));
  const lerpedNoiseColor2 = useRef(new Color(noiseColor2));
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    gl.compute(computeUpdate);

    // Update time for animated noise
    timeRef.current += delta;
    uniforms.time.value = timeRef.current;

    // Always use the noise colors from controls
    tmpColor.set(noiseColor1);
    lerpedNoiseColor1.current.lerp(tmpColor, delta * 5); // Faster color transitions
    tmpColor.set(noiseColor2);
    lerpedNoiseColor2.current.lerp(tmpColor, delta * 5);
    uniforms.noiseColor1.value.set(lerpedNoiseColor1.current);
    uniforms.noiseColor2.value.set(lerpedNoiseColor2.current);

    // Always use the emissive intensity from controls
    uniforms.emissiveIntensity.value = lerp(uniforms.emissiveIntensity.value, emissiveIntensity, delta);

    uniforms.particleSize.value = particleSize;
    uniforms.noiseScale.value = noiseScale;
    uniforms.noiseStrength.value = noiseStrength;
    uniforms.timeSpeed.value = timeSpeed;
    uniforms.targetSpeed.value = targetSpeed;
    uniforms.noiseMovementSpeed.value = noiseMovementSpeed;
    uniforms.spawnSize.value = spawnSize;
    uniforms.spawnPosX.value = spawnPosition.x;
    uniforms.spawnPosY.value = spawnPosition.y;
    uniforms.spawnPosZ.value = spawnPosition.z;
    uniforms.spawnHeight.value = spawnHeight;
    uniforms.flowfieldStrength.value = flowfieldStrength;
    uniforms.flowfieldScale.value = flowfieldScale;
    uniforms.flowfieldSpeed.value = flowfieldSpeed;
    uniforms.proximityFactor.value = proximityFactor;
  });

  return (
    <>
      <sprite count={nbParticles}>
        <spriteNodeMaterial {...nodes} transparent depthWrite={false} />
      </sprite>
    </>
  );
};

extend({ SpriteNodeMaterial });
