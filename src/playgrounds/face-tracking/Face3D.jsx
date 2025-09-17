import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, OrbitControls, Stats, Text } from "@react-three/drei";
import WebGPUCanvas from "../webgpu/WebGPUCanvas.jsx";
import { GPGPUParticles } from "./GPGPUParticles.jsx";
// import { useControls } from "leva";
import { PostProcessing } from "./PostProcessing.jsx";

// Face mesh connection indices for drawing lines between landmarks
const FACE_CONNECTIONS = [
  // Face oval
  [10, 338],
  [338, 297],
  [297, 332],
  [332, 284],
  [284, 251],
  [251, 389],
  [389, 356],
  [356, 454],
  [454, 323],
  [323, 361],
  [361, 288],
  [288, 397],
  [397, 365],
  [365, 379],
  [379, 378],
  [378, 400],
  [400, 377],
  [377, 152],
  [152, 148],
  [148, 176],
  [176, 149],
  [149, 150],
  [150, 136],
  [136, 172],
  [172, 58],
  [58, 132],
  [132, 93],
  [93, 234],
  [234, 127],
  [127, 162],
  [162, 21],
  [21, 54],
  [54, 103],
  [103, 67],
  [67, 109],
  [109, 10],

  // Left eye
  [33, 7],
  [7, 163],
  [163, 144],
  [144, 145],
  [145, 153],
  [153, 154],
  [154, 155],
  [155, 133],
  [133, 173],
  [173, 157],
  [157, 158],
  [158, 159],
  [159, 160],
  [160, 161],
  [161, 246],
  [246, 33],

  // Right eye
  [362, 382],
  [382, 381],
  [381, 380],
  [380, 374],
  [374, 373],
  [373, 390],
  [390, 249],
  [249, 263],
  [263, 466],
  [466, 388],
  [388, 387],
  [387, 386],
  [386, 385],
  [385, 384],
  [384, 398],
  [398, 362],

  // Lips outer
  [61, 84],
  [84, 17],
  [17, 314],
  [314, 405],
  [405, 320],
  [320, 307],
  [307, 375],
  [375, 321],
  [321, 308],
  [308, 324],
  [324, 318],
  [318, 402],
  [402, 317],
  [317, 14],
  [14, 87],
  [87, 178],
  [178, 88],
  [88, 95],
  [95, 78],
  [78, 191],
  [191, 80],
  [80, 81],
  [81, 82],
  [82, 13],
  [13, 312],
  [312, 311],
  [311, 310],
  [310, 415],
  [415, 61],
];

const FaceLandmarks = React.memo(({ landmarks, expression }) => {
  const getExpressionColor = (expr) => {
    const colors = {
      happy: "#10B981",
      sad: "#3B82F6",
      angry: "#EF4444",
      surprised: "#F59E0B",
      focused: "#8B5CF6",
      disgusted: "#84CC16",
      fearful: "#F97316",
      neutral: "#f59e0b",
    };
    return colors[expr?.expression] || "#f59e0b";
  };
  const pointsGeometryRef = useRef();
  const linesGeometryRef = useRef();

  const points = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return new Float32Array(0);

    const positions = new Float32Array(landmarks.length * 3);
    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const idx = i * 3;
      positions[idx] = (landmark.x - 0.5) * 4;
      positions[idx + 1] = -(landmark.y - 0.5) * 4;
      positions[idx + 2] = landmark.z * 2;
    }
    return positions;
  }, [landmarks]);

  const linePositions = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return new Float32Array(0);

    // Pre-allocate array for better performance
    const positions = new Float32Array(FACE_CONNECTIONS.length * 6);
    let posIdx = 0;

    for (let i = 0; i < FACE_CONNECTIONS.length; i++) {
      const [start, end] = FACE_CONNECTIONS[i];
      if (landmarks[start] && landmarks[end]) {
        const startLm = landmarks[start];
        const endLm = landmarks[end];

        positions[posIdx++] = (startLm.x - 0.5) * 4;
        positions[posIdx++] = -(startLm.y - 0.5) * 4;
        positions[posIdx++] = startLm.z * 2;
        positions[posIdx++] = (endLm.x - 0.5) * 4;
        positions[posIdx++] = -(endLm.y - 0.5) * 4;
        positions[posIdx++] = endLm.z * 2;
      }
    }

    return positions.slice(0, posIdx); // Trim unused space
  }, [landmarks]);

  useFrame(() => {
    if (pointsGeometryRef.current && points.length > 0) {
      pointsGeometryRef.current.attributes.position.array = points;
      pointsGeometryRef.current.attributes.position.needsUpdate = true;
    }

    if (linesGeometryRef.current && linePositions.length > 0) {
      linesGeometryRef.current.attributes.position.array = linePositions;
      linesGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  if (!landmarks || landmarks.length === 0) {
    return (
      <group>
        {/* Placeholder when no face detected */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#666" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshBasicMaterial color="#333" transparent opacity={0.2} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[1.5, 0.1, 0.1]} />
          <meshBasicMaterial color="#333" transparent opacity={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#4f46e5" transparent opacity={0.7} />
      </lineSegments>

      <points>
        <bufferGeometry ref={pointsGeometryRef}>
          <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={getExpressionColor(expression)} size={0.03} sizeAttenuation={false} />
      </points>
    </group>
  );
});

const Face3D = ({ landmarks, expression }) => {
  // Temporary fixed settings until React 19 compatibility is resolved
  const ppSettings = {
    strength: 0.8,
    radius: 0.42,
    threshold: 0.75,
  };
  return (
    <div className="w-full h-full  rounded-xl b overflow-hidden relative">
      <WebGPUCanvas cameraProps={{ position: [0, 0, -3], fov: 50, far: 20 }} className="bg-transparent">
        {/* <ambientLight intensity={0.5} /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}
        {/* <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} /> */}

        {/* <FaceLandmarks landmarks={landmarks} expression={expression} /> */}

        {/* <Box /> */}
        {/* <Stats /> */}

        <GPGPUParticles landmarks={landmarks} expression={expression} nbParticles={20000} />
        <PostProcessing {...ppSettings} />
      </WebGPUCanvas>

      <div className="absolute w-full h-full  flex flex-col items-center justify-center -z-10">
        <h1 className="text-white">Angry</h1>
      </div>
    </div>
  );
};

export default Face3D;
