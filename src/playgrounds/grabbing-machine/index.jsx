import * as THREE from "three/webgpu";

import { Canvas, extend, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import ClawMachine from "./ClawMachine";
import { useMemo, useRef, createContext, useContext, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { RigidBody, BallCollider } from "@react-three/rapier";
import Borders from "./Borders";
import CinnamonLogo from "./CinnamonLogo";
import Effects from "./Effects";
import { Leva, useControls } from "leva";
import Frame from "./Frame";
import UI from "./UI";
import GradientBackground from "./GradientBackground";
import ReactLenis from "lenis/react";
import SSGIEffects from "./SSGIEffects";
import { MOBILE_SETTINGS, PHYSICS_SETTINGS, INTERACTION_SETTINGS } from "./constants";
import IntroAnimation from "./IntroAnimation";

const defaultAccents = ["#ff8936", "#5b76f5", "#06d6a0", "#f72585"];

// Context for managing ball interactions
const BallInteractionContext = createContext();

// Ball interaction component (works on all devices)
function BallInteraction({ children }) {
  const ballRefs = useRef([]);
  const { camera, raycaster, pointer, gl } = useThree();
  console.log(ballRefs);
  const handlePointerDown = (event) => {
    console.log(event);

    // Determine if mobile and get appropriate settings
    const isMobile = window.innerWidth < MOBILE_SETTINGS.BREAKPOINT;
    const settings = isMobile ? INTERACTION_SETTINGS.MOBILE : INTERACTION_SETTINGS.DESKTOP;

    // Get click position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cast ray from camera through click point
    raycaster.setFromCamera({ x, y }, camera);

    // Get the intersection point with a plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    console.log(ballRefs);
    // Find balls within interaction radius of the click point
    ballRefs.current.forEach((ballRef) => {
      if (ballRef && ballRef.translation) {
        const ballPosition = ballRef.translation();
        const ballPos = new THREE.Vector3(ballPosition.x, ballPosition.y, ballPosition.z);
        const distance = intersectionPoint.distanceTo(ballPos);

        if (distance < settings.RADIUS) {
          // Apply upward and slightly outward impulse
          const direction = ballPos.clone().sub(intersectionPoint).normalize();
          const impulse = {
            x: direction.x * settings.LATERAL_IMPULSE,
            y: settings.IMPULSE_STRENGTH, // Strong upward force
            z: direction.z * settings.LATERAL_IMPULSE,
          };
          ballRef.applyImpulse(impulse, true);

          // Apply random angular impulse for spinning effect
          const angularImpulse = {
            x: (Math.random() - 0.5) * settings.ANGULAR_IMPULSE,
            y: (Math.random() - 0.5) * settings.ANGULAR_IMPULSE,
            z: (Math.random() - 0.5) * settings.ANGULAR_IMPULSE,
          };
          ballRef.applyTorqueImpulse(angularImpulse, true);
        }
      }
    });
  };

  // Add event listener
  useMemo(() => {
    if (gl.domElement) {
      gl.domElement.addEventListener("pointerdown", handlePointerDown);
      return () => gl.domElement.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [gl.domElement]);

  return <BallInteractionContext.Provider value={{ ballRefs }}>{children}</BallInteractionContext.Provider>;
}

export default function GrabbingMachine() {
  const [showIntro, setShowIntro] = useState(true);

  // Leva controls for accent colors
  const { color1, color2, color3, color4 } = useControls("Ball Colors", {
    color1: { value: defaultAccents[0], label: "Color 1" },
    color2: { value: defaultAccents[1], label: "Color 2" },
    color3: { value: defaultAccents[2], label: "Color 3" },
    color4: { value: defaultAccents[3], label: "Color 4" },
  });

  // Create accent array from Leva controls
  const accents = useMemo(() => [color1, color2, color3, color4], [color1, color2, color3, color4]);
  const mobile = useMemo(() => window.innerWidth < MOBILE_SETTINGS.BREAKPOINT, []);
  const connectors = useMemo(() => new Array(PHYSICS_SETTINGS.BALL_COUNT).fill(0).map(() => ({ color: "#444" })), [mobile]);

  return (
    <main className="w-screen h-screen bg-white relative">
      <IntroAnimation onComplete={() => setShowIntro(false)} />
      <Leva  />
      <UI />
      <ReactLenis root />
      <Canvas
        dpr={[1, 1.5]}
        gl={(props) => {
          extend(THREE);
          const renderer = new THREE.WebGPURenderer({ ...props, antialias: false });
          return renderer.init().then(() => renderer);
        }}
        camera={{ position: [0, 0, 30], fov: 17.5 }}
      >
        {/* <OrbitControls /> */}
        {/* <GradientBackground /> */}
        {/* <Frame /> */}
        <ambientLight intensity={1} />
        <BallInteraction>
          <Physics /*debug*/ timeStep="vary" debug={false} gravity={[0, -30, 0]}>
            {/* <ClawMachine /> */}
            <Borders />
            <CinnamonLogo scale={4} />
            {/* {connectors.map((props, i) => <Sphere key={i} {...props} mobile={mobile} accents={accents} />) /* prettier-ignore */}
          </Physics>
        </BallInteraction>
        <Environment background>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            {/* {/* <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} /> */}
            <Lightformer form="circle" color="white" intensity={0} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
            <Lightformer form="circle" color="white" intensity={0} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
            <Lightformer form="circle" color="blue" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
            <Lightformer form="plane" color="white" intensity={2} rotation-y={-Math.PI / 2} position={[0, 1, 20]} scale={8} />
            <Lightformer form="ring" color="white" intensity={5} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
          </group>
        </Environment>
        <Effects />
        {/* <SSGIEffects /> */}
      </Canvas>
    </main>
  );
}

function Sphere({ position, children, mobile, vec = new THREE.Vector3(), r = THREE.MathUtils.randFloatSpread, accent, accents, ...props }) {
  const api = useRef();
  const ref = useRef();
  const { viewport } = useThree();
  const { scene, nodes } = useGLTF("/cinnamon/ball.glb");
  const interactionContext = useContext(BallInteractionContext);

  const pos = useMemo(() => {
    if (position) return position;

    // Calculate safe bounds based on viewport and mobile status
    const safeMargin = mobile ? MOBILE_SETTINGS.SAFE_MARGIN : MOBILE_SETTINGS.DESKTOP_SAFE_MARGIN;
    const maxX = viewport.width / 2 - safeMargin;
    const maxY = viewport.height / 2 - safeMargin;
    const maxZ = mobile ? 1 : 2;

    return [
      (Math.random() - 0.5) * 2 * maxX,
      (Math.random() - 0.5) * 2 * maxY + 2, // Offset slightly upward
      (Math.random() - 0.5) * 2 * maxZ,
    ];
  }, [position, viewport.width, viewport.height, mobile]);

  const color = useMemo(() => {
    return accents[Math.floor(Math.random() * accents.length)];
  }, [accents]);

  // Limit angular velocity
  useFrame(() => {
    if (api.current) {
      const maxAngularVel = 5; // Maximum angular velocity
      const angVel = api.current.angvel();

      if (
        angVel.x > maxAngularVel ||
        angVel.y > maxAngularVel ||
        angVel.z > maxAngularVel ||
        angVel.x < -maxAngularVel ||
        angVel.y < -maxAngularVel ||
        angVel.z < -maxAngularVel
      ) {
        api.current.setAngvel(
          {
            x: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.x)),
            y: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.y)),
            z: Math.max(-maxAngularVel, Math.min(maxAngularVel, angVel.z)),
          },
          true
        );
      }
    }
  });

  const scale = useMemo(() => {
    return mobile ? MOBILE_SETTINGS.SPHERE_SCALE : 1;
  }, [mobile]);

  // Register this ball with the interaction system
  useEffect(() => {
    if (interactionContext && api.current) {
      interactionContext.ballRefs.current.push(api.current);
      return () => {
        const index = interactionContext.ballRefs.current.indexOf(api.current);
        if (index > -1) {
          interactionContext.ballRefs.current.splice(index, 1);
        }
      };
    }
  }, [interactionContext, api.current]);

  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[scale * 1.04]} />
      <group scale={scale}>
        <mesh geometry={nodes.Icosphere.geometry}>
          <meshStandardMaterial color="white" opacity={0.3} transparent metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh geometry={nodes.Icosphere_1.geometry}>
          <meshStandardMaterial color={color} roughness={0.2} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {children}
    </RigidBody>
  );
}
