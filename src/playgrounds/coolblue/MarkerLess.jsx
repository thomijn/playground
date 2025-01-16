import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

import use8thWall from "../../hooks/use8thWall";
import PlaceIndicator from "./PlaceIndicator";
import { useStore } from "../../store";
import { Box, CameraControls, Environment } from "@react-three/drei";
import styled from "styled-components";
import { Model } from "./Coolblue";

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
            zIndex: 99,
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
              position: "absolute",
              bottom: 60,
              color: "black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 400,
              background: "#fff",
              padding: 8,
              width: 40,
              height: 40,
              borderRadius: "50%",
              zIndex: 100,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-check"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </motion.div>
      )}

      {placed && <Interface opened={opened} />}
      <Canvas shadows>
        {/* <ExperienceSimple opened={opened} setOpened={setOpened} /> */}

        {XR8 && XR8.Threejs.xrScene() && <Experience setOpened={setOpened} envMap={envMap} detailStatus={detailStatus} XR8={XR8} />}
      </Canvas>
    </>
  );
};

const ExperienceSimple = (props) => {
  return (
    <>
      <Model scale={2} opened={props.opened} setOpened={props.setOpened} />
      <CameraControls />
      <directionalLight castShadow position={[2.5, 8, -2.5]} intensity={1} />
      <Environment files="/room.hdr" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" transparent opacity={0.25} />
      </mesh>
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

  return (
    <group ref={appRef} visible={true}>
      <directionalLight castShadow position={[2.5, 8, 2.5]} intensity={1} />
      <Environment files="/room.hdr" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeBufferGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" transparent opacity={0.25} />
      </mesh>
      {placePosition && (
        <>
          <Model scale={2} position={placePosition} setOpened={props.setOpened} opened={props.opened} />
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
