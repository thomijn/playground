import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { dof } from "three/examples/jsm/tsl/display/DepthOfFieldNode.js";

import { 
  pass, 
  Fn, 
  vec3,
  vec4, 
  uv, 
  uniform,
  mix,
  step,
  smoothstep,
  remap,
  negate,
  color,
  mx_noise_float
} from "three/tsl";
import * as THREE from "three/webgpu";
import gsap from "gsap";
import { useCameraStore } from "./CameraController";

// Dissolve reveal effect node with layered transparency
const dissolveReveal = Fn(([textureNode, progress, size, thickness, borderColor, intensity, backgroundColor]) => {
  const uvCoords = uv();
  
  // Layer multiple noise octaves for more organic paper-like texture
  const noiseCoord1 = vec3(uvCoords.x.mul(size), uvCoords.y.mul(size), 0.0);
  const noiseCoord2 = vec3(uvCoords.x.mul(size.mul(2.3)), uvCoords.y.mul(size.mul(2.3)), 0.5);
  const noiseCoord3 = vec3(uvCoords.x.mul(size.mul(4.7)), uvCoords.y.mul(size.mul(4.7)), 1.0);
  const noiseCoord4 = vec3(uvCoords.x.mul(size.mul(8.1)), uvCoords.y.mul(size.mul(8.1)), 1.5);
  
  const noise1 = mx_noise_float(noiseCoord1);
  const noise2 = mx_noise_float(noiseCoord2);
  const noise3 = mx_noise_float(noiseCoord3);
  const noise4 = mx_noise_float(noiseCoord4);
  
  // Combine noise layers with different weights for paper-like texture
  const combinedNoise = noise1.mul(0.5).add(noise2.mul(0.25)).add(noise3.mul(0.15)).add(noise4.mul(0.1));
  
  // Remap noise from [-1, 1] to [0, 1]
  const dissolve = remap(combinedNoise, -1, 1, 0, 1);
  
  // Create multiple transparency layers with different thresholds
  const thicknessStep = thickness.div(5.0);
  const smoothness = thicknessStep.mul(0.5); // Control smoothness of transitions
  
  // Layer 1: Fully revealed (core)
  const layer1Progress = progress.remap(0, 1, negate(thickness), 1);
  const layer1 = smoothstep(layer1Progress.add(smoothness), layer1Progress.sub(smoothness), dissolve);
  
  // Layer 2: First transparency layer (90% opacity)
  const layer2Progress = layer1Progress.add(thicknessStep);
  const layer2 = smoothstep(layer2Progress.add(smoothness), layer2Progress.sub(smoothness), dissolve);
  const layer2Mask = layer2.sub(layer1).clamp(0, 1);
  
  // Layer 3: Second transparency layer (70% opacity)
  const layer3Progress = layer2Progress.add(thicknessStep);
  const layer3 = smoothstep(layer3Progress.add(smoothness), layer3Progress.sub(smoothness), dissolve);
  const layer3Mask = layer3.sub(layer2).clamp(0, 1);
  
  // Layer 4: Third transparency layer (50% opacity)
  const layer4Progress = layer3Progress.add(thicknessStep);
  const layer4 = smoothstep(layer4Progress.add(smoothness), layer4Progress.sub(smoothness), dissolve);
  const layer4Mask = layer4.sub(layer3).clamp(0, 1);
  
  // Layer 5: Fourth transparency layer (30% opacity)
  const layer5Progress = layer4Progress.add(thicknessStep);
  const layer5 = smoothstep(layer5Progress.add(smoothness), layer5Progress.sub(smoothness), dissolve);
  const layer5Mask = layer5.sub(layer4).clamp(0, 1);
  
  // Layer 6: Outer layer (10% opacity)
  const layer6Progress = layer5Progress.add(thicknessStep);
  const layer6 = smoothstep(layer6Progress.add(smoothness), layer6Progress.sub(smoothness), dissolve);
  const layer6Mask = layer6.sub(layer5).clamp(0, 1);
  
  // Define edge color
  const edgeColor = vec4(
    borderColor.r.mul(intensity),
    borderColor.g.mul(intensity),
    borderColor.b.mul(intensity),
    1.0
  );
  
  // Calculate total opacity from all layers
  const opacity = layer1.add(
    layer2Mask.mul(0.9)
  ).add(
    layer3Mask.mul(0.7)
  ).add(
    layer4Mask.mul(0.5)
  ).add(
    layer5Mask.mul(0.3)
  ).add(
    layer6Mask.mul(0.1)
  );
  
  // Calculate edge mask (all layers except fully revealed)
  const edgeMask = layer2Mask.add(layer3Mask).add(layer4Mask).add(layer5Mask).add(layer6Mask);
  
  // Mix texture with edge color only at the edges
  const finalColor = mix(textureNode, edgeColor, edgeMask.mul(0.3));
  
  // Blend with background based on opacity
  return mix(backgroundColor, finalColor, opacity);
});

export const PostProcessing = ({
  focusDistance = 15,
  focalLength = 10,
  bokehScale = 5,
  dissolveSize = 8,
  dissolveThickness = 0.15,
  dissolveColor = "#ff6b35",
  dissolveIntensity = 3,
  dissolveBackgroundColor = "#000000",
  animateDissove = true,
  dissolveDuration = 2,
}) => {
  const { gl: renderer, scene, camera } = useThree();
  const animatedBokehScale = useCameraStore((state) => state.animatedBokehScale);
  const postProcessingRef = useRef(null);
  const focusDistanceUniformRef = useRef(null);
  const focalLengthUniformRef = useRef(null);
  const bokehScaleUniformRef = useRef(null);
  const dissolveProgressRef = useRef(null);
  const dissolveSizeRef = useRef(null);
  const dissolveThicknessRef = useRef(null);
  const dissolveColorRef = useRef(null);
  const dissolveIntensityRef = useRef(null);
  const dissolveBackgroundColorRef = useRef(null);
  const dissolveProgressValue = useRef({ value: 0 });

  useEffect(() => {
    if (!renderer || !scene || !camera) {
      return;
    }

    const scenePass = pass(scene, camera);
    const outputPass = scenePass.getTextureNode();
    const viewZNode = scenePass.getViewZNode();

    // Create uniform nodes for DoF parameters
    const focusDistanceUniform = uniform(focusDistance);
    const focalLengthUniform = uniform(focalLength);
    const bokehScaleUniform = uniform(bokehScale);
    
    focusDistanceUniformRef.current = focusDistanceUniform;
    focalLengthUniformRef.current = focalLengthUniform;
    bokehScaleUniformRef.current = bokehScaleUniform;

    // Create depth of field pass with uniform nodes
    const dofPass = dof(outputPass, viewZNode, focusDistanceUniform, focalLengthUniform, bokehScaleUniform);
    
    // Create uniform nodes for dissolve effect
    const dissolveProgressUniform = uniform(dissolveProgressValue.current.value);
    const dissolveSizeUniform = uniform(dissolveSize);
    const dissolveThicknessUniform = uniform(dissolveThickness);
    const dissolveColorUniform = uniform(color(dissolveColor));
    const dissolveIntensityUniform = uniform(dissolveIntensity);
    const dissolveBackgroundColorUniform = uniform(color(dissolveBackgroundColor));
    
    dissolveProgressRef.current = dissolveProgressUniform;
    dissolveSizeRef.current = dissolveSizeUniform;
    dissolveThicknessRef.current = dissolveThicknessUniform;
    dissolveColorRef.current = dissolveColorUniform;
    dissolveIntensityRef.current = dissolveIntensityUniform;
    dissolveBackgroundColorRef.current = dissolveBackgroundColorUniform;

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = dofPass;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera]);

  // GSAP animation for dissolve effect
  useEffect(() => {
    if (animateDissove) {
      gsap.fromTo(
        dissolveProgressValue.current,
        { value: 0 },
        { 
          value: 1, 
          duration: dissolveDuration,
          ease: "power2.inOut"
        }
      );
    }
  }, [animateDissove, dissolveDuration]);

  useFrame(() => {
    if (focusDistanceUniformRef.current) {
      focusDistanceUniformRef.current.value = focusDistance;
    }
    if (focalLengthUniformRef.current) {
      focalLengthUniformRef.current.value = focalLength;
    }
    if (bokehScaleUniformRef.current) {
      // Use animated bokeh scale if available, otherwise use the prop value
      bokehScaleUniformRef.current.value = animatedBokehScale !== null ? animatedBokehScale : bokehScale;
    }
    if (dissolveProgressRef.current) {
      dissolveProgressRef.current.value = dissolveProgressValue.current.value;
    }
    if (dissolveSizeRef.current) {
      dissolveSizeRef.current.value = dissolveSize;
    }
    if (dissolveThicknessRef.current) {
      dissolveThicknessRef.current.value = dissolveThickness;
    }
    if (dissolveColorRef.current) {
      dissolveColorRef.current.value.set(dissolveColor);
    }
    if (dissolveIntensityRef.current) {
      dissolveIntensityRef.current.value = dissolveIntensity;
    }
    if (dissolveBackgroundColorRef.current) {
      dissolveBackgroundColorRef.current.value.set(dissolveBackgroundColor);
    }
    
    if (postProcessingRef.current) {
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
};

