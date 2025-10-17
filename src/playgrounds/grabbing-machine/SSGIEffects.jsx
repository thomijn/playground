import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { ao } from "three/examples/jsm/tsl/display/GTAONode";
import { ssr } from "three/examples/jsm/tsl/display/SSRNode";
import { smaa } from "three/examples/jsm/tsl/display/SMAANode";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode";
import { traa } from "three/examples/jsm/tsl/display/TRAANode";
import { ssgi } from "./SSGINode";

import { useRef, useReducer, useMemo, useState, useLayoutEffect } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { BallCollider, Physics, RigidBody } from "@react-three/rapier";
import { easing } from "maath";

export default function SSGIEffects() {
  const { gl, scene, camera } = useThree();
  const [postProcessing] = useState(() => new THREE.PostProcessing(gl));
  // Configure passes
  useLayoutEffect(() => {
    const scenePass = TSL.pass(scene, camera, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    scenePass.setMRT(
      TSL.mrt({ output: TSL.output, normal: TSL.directionToColor(TSL.normalView), metalrough: TSL.vec2(TSL.metalness, TSL.roughness), velocity: TSL.velocity })
    );
    const scenePassColor = scenePass.getTextureNode("output");
    const scenePassNormal = scenePass.getTextureNode("normal");
    const scenePassDepth = scenePass.getTextureNode("depth");
    const scenePassVelocity = scenePass.getTextureNode("velocity");
    const scenePassMetalRough = scenePass.getTextureNode("metalrough");
    const sceneNormal = TSL.sample((uv) => TSL.colorToDirection(scenePassNormal.sample(uv)));
    const ssrPass = ssr(scenePassColor, scenePassDepth, sceneNormal, scenePassMetalRough.r, scenePassMetalRough.g);
    ssrPass.maxDistance.value = 5;
    ssrPass.blurQuality.value = 1;
    ssrPass.thickness.value = 0.15;
    ssrPass.resolutionScale = 1;
    const bloomPass = bloom(scenePassColor, 0.1, 0.8, 0.9);
    const ssgiPass = ssgi(scenePassColor, scenePassDepth, sceneNormal, camera);
    ssgiPass.sliceCount.value = 2;
    ssgiPass.stepCount.value = 8;
    ssgiPass.radius.value = 25;
    ssgiPass.giIntensity.value = 100;
    ssgiPass.aoIntensity.value = 3;
    ssgiPass.thickness.value = 0.5;
    // Extract GI and AO from SSGI (following example)
    const _gi = ssgiPass.rgb;
    const _ao = ssgiPass.a;
    // Composite: sceneColor * AO + diffuseColor * GI (following example)
    const finalColor = TSL.vec4(TSL.add(scenePassColor.rgb.mul(_ao), scenePassColor.rgb.mul(_gi)), scenePassColor.a);
    const blendPassAO = finalColor.add(bloomPass);
    const compositePass = TSL.blendColor(blendPassAO, ssrPass);
    // Apply TRAA (Temporal Reprojection Anti-Aliasing) - following example
    const traaPass = traa(compositePass, scenePassDepth, scenePassVelocity, camera);
    postProcessing.outputNode = traaPass;
    postProcessing.needsUpdate = true;
  }, [scene, camera]);
  // Take over render queue
  useFrame(() => postProcessing.render(), 1);
}
