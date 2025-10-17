import * as THREE from 'three/webgpu'
import { pass, mrt, output, normalView, velocity } from 'three/tsl'
import { ao } from 'three/examples/jsm/tsl/display/GTAONode.js'

import { useState, useLayoutEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

export default function Effects() {
    const { gl, scene, camera } = useThree()
    const [postProcessing] = useState(() => new THREE.PostProcessing(gl))
    
    // Leva controls for ambient occlusion
    const { 
      aoEnabled,
      aoResolutionScale,
      aoRadius,
      aoScale,
      aoIntensity
    } = useControls("Ambient Occlusion", {
      aoEnabled: { value: true, label: "Enable AO" },
      aoResolutionScale: { value: 1, min: 0.1, max: 1.0, step: 0.1, label: "Resolution Scale" },
      aoRadius: { value: 0.25, min: 0.01, max: 1.0, step: 0.01, label: "Radius" },
      aoScale: { value: 0.4, min: 0.1, max: 3.0, step: 0.1, label: "Scale" },
      aoIntensity: { value: 1.0, min: 0.0, max: 2.0, step: 0.1, label: "Intensity" }
    });
    
    // Configure AO pass following WebGPU example
    useLayoutEffect(() => {
      const scenePass = pass(scene, camera)
      scenePass.setMRT(mrt({
        output: output,
        normal: normalView,
        velocity: velocity
      }))
      
      const scenePassColor = scenePass.getTextureNode('output')
      const scenePassNormal = scenePass.getTextureNode('normal')
      const scenePassDepth = scenePass.getTextureNode('depth')
      
      if (aoEnabled) {
        // AO pass - note the parameter order: depth, normal, camera
        const aoPass = ao(scenePassDepth, scenePassNormal, camera)
        aoPass.resolutionScale = aoResolutionScale
        
        // Set AO parameters if available
        if (aoPass.radius) aoPass.radius.value = aoRadius
        if (aoPass.scale) aoPass.scale.value = aoScale
        
        // Blend AO with scene color with intensity control
        const aoTexture = aoPass.getTextureNode()
        const blendPassAO = aoTexture.mul(aoIntensity).mul(scenePassColor)
        
        postProcessing.outputNode = blendPassAO
      } else {
        // No AO, just pass through scene color
        postProcessing.outputNode = scenePassColor
      }
      
      postProcessing.needsUpdate = true
    }, [scene, camera, aoEnabled, aoResolutionScale, aoRadius, aoScale, aoIntensity])
    
    // Take over render queue
    useFrame(() => postProcessing.render(), 1)
    
    return null
  }