import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useStore } from "../store";
import use8thWallScripts from "./use8thWallScripts";

let renderer_ = null;
const camTexture_ = new THREE.Texture();
const renderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
  encoding: THREE.sRGBEncoding,
});
const refMat = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  color: 0xffffff,
  map: camTexture_,
});
// cubemap scene
const cubeMapScene = new THREE.Scene();
const cubeCamera = new THREE.CubeCamera(1, 1000, renderTarget);
const sphere = new THREE.SphereGeometry(100, 15, 15);
const sphereMesh = new THREE.Mesh(sphere, refMat);
sphereMesh.scale.set(-1, 1, 1);
sphereMesh.rotation.set(Math.PI, -Math.PI / 2, 0);
cubeMapScene.add(sphereMesh);

const use8thWall = (appKey, canvas) => {
  const areScriptsReady = use8thWallScripts(appKey);
  const [XR8Object, setXR8Object] = useState(null);
  const [ThreeObject, setThreeObject] = useState(null);
  const [detailStatus, setDetailStatus] = useState(null);
  const { setImageFound, imageFound } = useStore();

  useEffect(() => {
    if (!XR8Object && areScriptsReady && canvas) {
      const { XRExtras } = window;

      // Check Location Permissions at beginning of session
      const errorCallback = (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("LOCATION PERMISSIONS DENIED. PLEASE ALLOW AND TRY AGAIN.");
        }
      };
      navigator.geolocation.getCurrentPosition((pos) => {}, errorCallback);

      XRExtras.Loading.showLoading({
        onxrloaded: () => {
          const { XR8 } = window;
          window.THREE = THREE;

          XR8.XrController.configure({
            disableWorldTracking: false,

            // scale: "absolute",
          });
          XR8.addCameraPipelineModules([
            XR8.GlTextureRenderer.pipelineModule(),
            XR8.Threejs.pipelineModule(),
            XR8.XrController.pipelineModule(),
            // window.CoachingOverlay.pipelineModule(),
            // window.VpsCoachingOverlay.pipelineModule(),
            XRExtras.AlmostThere.pipelineModule(),
            XRExtras.Loading.pipelineModule(),
            XRExtras.RuntimeError.pipelineModule(),
          ]);

          const handleTrackingStatusChange = ({ detail }) => {
            if (
              detail.status === "LIMITED" &&
              detail.reason === "INITIALIZING"
            ) {
              setDetailStatus(false);
            }
            if (detail.status === "NORMAL") {
              setDetailStatus(true);
            }
          };

          const showTarget = ({ detail }) => {
            if (!imageFound) {
              setImageFound(detail);
            }
          };
          const hideTarget = ({ detail }) => {};

          const wayspotFound = ({ detail }) => {
            console.log(detail);
          };
          const wayspotLost = ({ detail }) => {
            // group.visible = false;
          };

          XR8.addCameraPipelineModule({
            name: "myawesomeapp",

            onAttach: ({ canvasWidth, canvasHeight }) => {
              setXR8Object(XR8);
              const { scene, camera, renderer } = XR8.Threejs.xrScene();
              const purple = 0xad50ff;
              renderer.shadowMap.enabled = true;
              renderer.shadowMap.type = THREE.PCFSoftShadowMap;
              renderer.outputEncoding = THREE.sRGBEncoding;

              camera.position.set(0, 2, 0);
              XR8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
              });

              setThreeObject({
                scene: XR8.Threejs.xrScene().camera,
                camera: XR8.Threejs.xrScene().scene,
              });
            },
            onUpdate: () => {
              const { scene, camera, renderer } = XR8.Threejs.xrScene();
              cubeCamera.update(renderer, cubeMapScene);
            },
            onProcessCpu: ({ frameStartResult }) => {
              const { cameraTexture } = frameStartResult;
              // force initialization
              const { scene, camera, renderer } = XR8.Threejs.xrScene(); // Get the 3js scene from XR8.Threejs
              const texProps = renderer.properties.get(camTexture_);
              texProps.__webglTexture = cameraTexture;
            },

            listeners: [
              {
                event: "reality.trackingstatus",
                process: handleTrackingStatusChange,
              },
              { event: "reality.imagefound", process: showTarget },
              { event: "reality.imagelost", process: hideTarget },
              { event: "reality.projectwayspotfound", process: wayspotFound },
              { event: "reality.projectwayspotlost", process: wayspotLost },
            ],
          });

          XR8.run({ canvas });

          setXR8Object(XR8);
        },
      });
    }
  }, [XR8Object, areScriptsReady, canvas]);

  return {
    XR8: XR8Object,
    XR8Three: ThreeObject,
    detailStatus,
    envMap: cubeCamera.renderTarget.texture,
  };
};

export default use8thWall;
