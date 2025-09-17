import { extend, useFrame, useThree } from "@react-three/fiber";
// import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { lerp } from "three/src/math/MathUtils.js";

import { Fn } from "three/src/nodes/TSL.js";
import {
  ceil,
  color,
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
  smoothstep,
  sqrt,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  Color,
  DataTexture,
  FloatType,
  RGBAFormat,
  SpriteNodeMaterial,
} from "three/webgpu";

const randValue = /*#__PURE__*/ Fn(({ min, max, seed = 42 }) => {
  return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min);
});

const EXPRESSION_COLORS = {
  happy: {
    start: "#10B981",
    end: "#34D399",
    emissiveIntensity: 0.8,
  },
  sad: {
    start: "#3B82F6",
    end: "#60A5FA",
    emissiveIntensity: 0.4,
  },
  angry: {
    start: "#EF4444",
    end: "#F87171",
    emissiveIntensity: 1.2,
  },
  surprised: {
    start: "#F59E0B",
    end: "#FBBF24",
    emissiveIntensity: 1.0,
  },
  focused: {
    start: "#8B5CF6",
    end: "#A78BFA",
    emissiveIntensity: 0.6,
  },
  disgusted: {
    start: "#84CC16",
    end: "#A3E635",
    emissiveIntensity: 0.7,
  },
  fearful: {
    start: "#F97316",
    end: "#FB923C",
    emissiveIntensity: 0.9,
  },
  neutral: {
    start: "#f59e0b",
    end: "#fbbf24",
    emissiveIntensity: 0.3,
  },
};

const tmpColor = new Color();

export const GPGPUParticles = ({ 
  nbParticles = 50000, 
  landmarks = null, 
  expression = null 
}) => {
  // Temporary fixed settings until React 19 compatibility is resolved
  const particleCount = nbParticles;
  const startColor = "#10B981";
  const endColor = "#34D399";
  const debugColor = false;
  const emissiveIntensity = 0.8;
  const particleSize = 0.005;
  const speed = 0.45;

  // Convert landmarks to 3D positions for particle targets
  const landmarkPositions = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return [];
    
    return landmarks.map(landmark => ({
      x: (landmark.x - 0.5) * 4,
      y: -(landmark.y - 0.5) * 4,
      z: landmark.z * 2,
    }));
  }, [landmarks]);

  const targetPositionsTexture = useMemo(() => {
    const size = Math.ceil(Math.sqrt(particleCount));
    const data = new Float32Array(size * size * 4);

    for (let i = 0; i < particleCount; i++) {
      data[i * 4 + 0] = 0; // X
      data[i * 4 + 1] = 0; // Y
      data[i * 4 + 2] = 0; // Z
      data[i * 4 + 3] = 1; // Alpha
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    return texture;
  }, [particleCount]);

  useEffect(() => {
    if (landmarkPositions.length === 0) return;
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles across all landmarks
      const landmarkIndex = i % landmarkPositions.length;
      const landmark = landmarkPositions[landmarkIndex];
      
      // Add some random offset around each landmark
      const randomOffset = 0.1;
      const offsetX = (Math.random() - 0.5) * randomOffset;
      const offsetY = (Math.random() - 0.5) * randomOffset;
      const offsetZ = (Math.random() - 0.5) * randomOffset;
      
      targetPositionsTexture.image.data[i * 4 + 0] = landmark.x + offsetX;
      targetPositionsTexture.image.data[i * 4 + 1] = landmark.y + offsetY;
      targetPositionsTexture.image.data[i * 4 + 2] = landmark.z + offsetZ;
      targetPositionsTexture.image.data[i * 4 + 3] = 1;
    }
    targetPositionsTexture.needsUpdate = true;
  }, [landmarkPositions, particleCount, targetPositionsTexture]);

  const gl = useThree((state) => state.gl);

  const { nodes, uniforms, computeUpdate } = useMemo(() => {
    // uniforms
    const uniforms = {
      color: uniform(color(startColor)),
      endColor: uniform(color(endColor)),
      emissiveIntensity: uniform(emissiveIntensity),
      speed: uniform(speed),
      particleSize: uniform(particleSize),
    };

    // buffers
    const spawnPositionsBuffer = instancedArray(particleCount, "vec3");
    const offsetPositionsBuffer = instancedArray(particleCount, "vec3");
    const agesBuffer = instancedArray(particleCount, "float");

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);
    const age = agesBuffer.element(instanceIndex);

    // init Fn
    const lifetime = randValue({ min: 0.1, max: 6, seed: 13 });

    const computeInit = Fn(() => {
      spawnPosition.assign(
        vec3(
          randValue({ min: -4, max: 4, seed: 0 }),
          randValue({ min: -4, max: 4, seed: 1 }),
          randValue({ min: -2, max: 2, seed: 2 })
        )
      );
      offsetPosition.assign(0);
      age.assign(randValue({ min: 0, max: lifetime, seed: 11 }));
    })().compute(particleCount);

    gl.computeAsync(computeInit);

    const instanceSpeed = uniforms.speed.mul(randValue({ min: 2.0, max: 5.0, seed: 12 }));
    const offsetSpeed = randValue({ min: 0.3, max: 0.8, seed: 14 });
    const noiseScale = randValue({ min: 0.8, max: 1.2, seed: 15 });
    const driftStrength = randValue({ min: 0.3, max: 0.8, seed: 16 });

    // Texture data
    const size = ceil(sqrt(particleCount));
    const col = instanceIndex.modInt(size).toFloat();
    const row = instanceIndex.div(size).toFloat();
    const x = col.div(size.toFloat());
    const y = row.div(size.toFloat());
    const targetPos = texture(targetPositionsTexture, vec2(x, y)).xyz;

    // update Fn
    const computeUpdate = Fn(() => {
      const distanceToTarget = targetPos.sub(spawnPosition);
      const distanceLength = distanceToTarget.length();
      
      // Strong attraction to landmark - this is the primary force
      If(distanceLength.greaterThan(0.01), () => {
        spawnPosition.addAssign(
          distanceToTarget
            .normalize()
            .mul(min(instanceSpeed, distanceLength))
            .mul(deltaTime)
        );
      });
      
      // Subtle organic drift around the landmark
      const breathingCycle = age.mul(0.8).sin().mul(0.5).add(0.5); // 0 to 1
      const localDrift = mx_fractal_noise_vec3(
        spawnPosition.mul(noiseScale).add(age.mul(0.05))
      ).mul(driftStrength).mul(breathingCycle);
      
      // Apply gentle drift only when close to target
      const proximityFactor = smoothstep(0.5, 0.1, distanceLength);
      offsetPosition.addAssign(
        localDrift.mul(offsetSpeed).mul(proximityFactor).mul(deltaTime)
      );
      
      // Gentle decay of offset
      offsetPosition.mulAssign(0.995);

      age.addAssign(deltaTime);

      If(age.greaterThan(lifetime), () => {
        age.assign(0);
        offsetPosition.assign(0);
      });
    })().compute(particleCount);

    const scale = vec3(uniforms.particleSize.mul(range(0.5, 3.0)));
    const particleLifetimeProgress = saturate(age.div(lifetime));

    const colorNode = vec4(
      mix(uniforms.color, uniforms.endColor, particleLifetimeProgress),
      randValue({ min: 0, max: 1, seed: 6 }) // Alpha
    );

    // Transform the particles to a circle
    const dist = length(uv().sub(0.5));
    const circle = smoothstep(0.5, 0.49, dist);
    const finalColor = colorNode.mul(circle);

    // Add a random offset to the particles
    const randOffset = vec3(
      range(-0.001, 0.001),
      range(-0.001, 0.001),
      range(-0.001, 0.001)
    );

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
  }, [particleCount, speed, particleSize, startColor, endColor, emissiveIntensity, targetPositionsTexture]);

  const currentExpression = expression?.expression || 'neutral';
  const expressionColors = EXPRESSION_COLORS[currentExpression] || EXPRESSION_COLORS.neutral;
  const lerpedStartColor = useRef(new Color(expressionColors.start));
  const lerpedEndColor = useRef(new Color(expressionColors.end));

  useFrame((_, delta) => {
    gl.compute(computeUpdate);

    // Update colors based on expression or debug settings
    const safeExpressionColors = EXPRESSION_COLORS[currentExpression] || EXPRESSION_COLORS.neutral;
    tmpColor.set(debugColor ? startColor : safeExpressionColors.start);
    lerpedStartColor.current.lerp(tmpColor, delta * 2);
    tmpColor.set(debugColor ? endColor : safeExpressionColors.end);
    lerpedEndColor.current.lerp(tmpColor, delta * 2);
    uniforms.color.value.set(lerpedStartColor.current);
    uniforms.endColor.value.set(lerpedEndColor.current);

    // Update emissive intensity based on expression
    uniforms.emissiveIntensity.value = lerp(
      uniforms.emissiveIntensity.value,
      debugColor
        ? emissiveIntensity
        : safeExpressionColors.emissiveIntensity,
      delta * 3
    );

    // Update speed and size uniforms
    uniforms.speed.value = speed;
    uniforms.particleSize.value = particleSize;
  });

  return (
    <>
      <sprite count={particleCount}>
        <spriteNodeMaterial
          {...nodes}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </>
  );
};

extend({ SpriteNodeMaterial });
