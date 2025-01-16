import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

import use8thWall from "../../hooks/use8thWall";
import PlaceIndicator from "./PlaceIndicator";
import { useStore } from "../../store";
import { Box, CameraControls, Cone, Cylinder, Environment, SoftShadows } from "@react-three/drei";
import styled from "styled-components";
import { Model } from "./Coolblue";
import ExplosionConfetti from "./ExplosionConfetti";
import DustParticles from "./Particles";
import gsap from "gsap";
import { Leva } from "leva";

const Coolblue = () => {
  const [canvasEl, setCanvasEl] = useState();
  const { setPlaced, placed } = useStore();
  const { XR8, detailStatus, envMap } = use8thWall("MOhg15P4Ggtk7VWC5Hpy8wKndZNVLzlXoiTxnnlCjlNCccqsbNFn2Lp87pE8oN0tPQBEQ", canvasEl);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setCanvasEl(document.getElementsByTagName("canvas")[0]);
  }, []);

  return (
    <>
      {!placed && (
        <motion.div
          animate={{
            opacity: placed ? 0 : 1,
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: placed ? 99 : 101,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            onClick={() => {
              setPlaced(true);
            }}
            style={{
              boxShadow: "inset 0 -2px 0 0 #1e4680",
              position: "absolute",
              bottom: 60,
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 16,
              fontWeight: 600,
              background: "#fff",
              paddingInline: 16,
              width: "fit-content",
              height: "48px",
              borderRadius: "4px",
              zIndex: 100,
              background: "#285dab",
            }}
          >
            Plaats
          </div>
        </motion.div>
      )}
      <Leva hidden />
      {placed && <Interface opened={opened} />}
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          zIndex: 100,
        }}
        shadows
      >
        {/* <ExperienceSimple opened={opened} setOpened={setOpened} /> */}

        {XR8 && XR8.Threejs.xrScene() && <Experience setOpened={setOpened} opened={opened} envMap={envMap} detailStatus={detailStatus} XR8={XR8} />}
      </Canvas>
    </>
  );
};

const ExperienceSimple = (props) => {
  const confettiRef = useRef();

  const triggerExplosion = () => {
    // Trigger an explosion at a random position
    // const position = [Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5];
    confettiRef.current.handleExplosion(new THREE.Vector3(0, 0 + 1.5, 0));
  };

  const placePosition = new THREE.Vector3(0, 0, 0);
  return (
    <>
      <SoftShadows />
      <color attach="background" args={["black"]} />
      <Cone scale={3} args={[0.5, -2, 100]} rotation={[-Math.PI, 0, 0]} position={[0, 1, 0]}>
        <meshBasicMaterial color="#fff4bd" depthWrite={false} transparent opacity={0.1} side={THREE.DoubleSide} />
      </Cone>

      <directionalLight castShadow position={[-5, 8, 5]} intensity={0.5} />
      <directionalLight castShadow position={[2.5, 8, 2.5]} intensity={1} shadow-bias={-0.0002} />
      <Environment preset="apartment" environmentIntensity={1} />
      <ExplosionConfetti ref={confettiRef} amount={100} radius={10} enableShadows colors={["#1792E1", "#FD6721"]} />
      <CameraControls />
      <mesh
        onClick={() => {
          props.setOpened(true);
          setTimeout(() => {
            triggerExplosion();
          }, 3000);
        }}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" transparent opacity={0.3} />
      </mesh>

      <DustParticles />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <planeGeometry attach="geometry" args={[100, 100]} />
        <meshStandardMaterial attach="material" colorWrite={false} />
      </mesh>
      {placePosition && (
        <>
          <Model rotation={[0, Math.PI / 2, 0]} scale={1.1} position={placePosition} setOpened={props.setOpened} opened={props.opened} />
        </>
      )}
      {!placePosition && <PlaceIndicator />}
    </>
  );
};

const Experience = (props) => {
  const { scene, camera } = props.XR8.Threejs.xrScene();
  const setDefaultCamera = useThree(({ set }) => set);
  const appRef = useRef();
  const { placePosition } = useStore();

  useEffect(() => {
    if (scene) {
      scene.add(appRef.current);
    }
  }, [scene]);

  useEffect(() => {
    if (camera) {
      setDefaultCamera({
        camera,
        scene,
      });
    }
  }, [camera, setDefaultCamera]);
  console.log(props.opened);

  const confettiRef = useRef();

  const triggerExplosion = () => {
    // Trigger an explosion at a random position
    // const position = [Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5];
    confettiRef.current.handleExplosion(new THREE.Vector3(placePosition.x, placePosition.y + 1.5, placePosition.z));
  };

  const coneLight = useRef();

  return (
    <group ref={appRef} visible={true}>
      <SoftShadows />
      <directionalLight castShadow position={[-5, 8, 5]} intensity={0.5} />
      <directionalLight castShadow position={[2.5, 8, 2.5]} intensity={1} shadow-bias={-0.0002} />
      <Environment map={props.envMap} environmentIntensity={1.5} />
      <ExplosionConfetti ref={confettiRef} amount={100} radius={10} enableShadows colors={["#1792E1", "#FD6721"]} />

      <Cone ref={coneLight} scale={3} args={[0.5, -2, 100]} rotation={[-Math.PI, 0, 0]} position={[placePosition.x, 1, placePosition.z]}>
        <meshBasicMaterial color="#fff4bd" depthWrite={false} transparent opacity={0} side={THREE.DoubleSide} />
      </Cone>

      <DustParticles position={placePosition} opened={props.opened} />

      <mesh
        onClick={() => {
          props.setOpened(true);

          gsap.to(coneLight.current.material, {
            opacity: 0.03,
            duration: 1,
            ease: "power3.inOut",
            delay: 2,
          });

          setTimeout(() => {
            triggerExplosion();
          }, 3000);
        }}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" transparent opacity={0.3} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <planeGeometry attach="geometry" args={[100, 100]} />
        <meshStandardMaterial attach="material" colorWrite={false} />
      </mesh>
      {placePosition && (
        <>
          <Model rotation={[0, Math.PI / 2, 0]} scale={0.9} position={placePosition} setOpened={props.setOpened} opened={props.opened} />
        </>
      )}
      {!placePosition && <PlaceIndicator />}
    </group>
  );
};

const Interface = ({ opened }) => {
  return (
    <Wrapper>
      <AnimatePresence mode="wait">
        {opened ? (
          <></>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="hint">
            Open het cadeau door er op te klikken!
          </motion.p>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

const Wrapper = styled(motion.div)`
  pointer-events: none;
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding-block: 16px;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;

  .card {
    h3 {
      font-size: 24px;
    }

    background: rgb(88, 134, 76);
    background: linear-gradient(347deg, rgba(88, 134, 76, 1) 0%, rgba(27, 72, 27, 1) 100%);
    padding: 16px;
    border-radius: 8px;
    color: #fff;
    left: 32px;
    width: calc(100% - 64px);
    font-size: 16px;
    font-weight: 400;
  }
`;

export default Coolblue;
