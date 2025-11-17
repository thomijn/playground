import React, { useMemo, useRef, useEffect, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useCameraStore } from "./CameraController";
import { makers } from "./makerData";
import { useMakerStore } from "./makerStore";
import { calculateClusters } from "./clusterSystem";

// Track which markers have been animated (persists across re-renders)
const animatedMarkers = new Set();
const initialLoadComplete = { value: false };

const MarkerIcon = ({ marker, bokehScale, index, makerData, isVisible }) => {
  const iconRef = useRef(null);
  const wrapperRef = useRef(null);
  const avatarRef = useRef(null);
  const centerDotRef = useRef(null);
  const animateToPosition = useCameraStore((state) => state.animateToPosition);
  const setSelectedMaker = useMakerStore((state) => state.setSelectedMaker);
  
  // Use maker data if available, otherwise use default
  const avatarSrc = makerData?.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;

  // Animate marker in ONLY on initial load
  useEffect(() => {
    const markerKey = `marker-${index}`;
    
    if (wrapperRef.current && !animatedMarkers.has(markerKey)) {
      animatedMarkers.add(markerKey);
      gsap.fromTo(
        wrapperRef.current,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
        //   delay: 2.5 + index * 0.05,
          ease: "back.out(1.7)",
        }
      );
    } else if (wrapperRef.current) {
      // Already animated before, show immediately
      gsap.set(wrapperRef.current, { scale: 1, opacity: 1 });
    }
  }, [index]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (animateToPosition) {
      animateToPosition(marker.position, bokehScale);
    }
    if (makerData) {
      setSelectedMaker(makerData);
    }
  };

  const handleMouseEnter = () => {
    // Expand the circle
    gsap.to(iconRef.current, {
      scale: 3,
      duration: 0.3,
      ease: "back.out(1.7)",
    });

    // Fade in avatar
    gsap.to(avatarRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });

    // Fade out center dot
    gsap.to(centerDotRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleMouseLeave = () => {
    // Reset circle
    gsap.to(iconRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
      delay: 0.2
    });

    // Fade out avatar
    gsap.to(avatarRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "back.out(1.7)",
      delay: 0.2
    });

    // Fade in center dot
    gsap.to(centerDotRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
      delay: 0.2
    });
  };

  return (
    <div 
      ref={wrapperRef} 
      className="relative flex items-center" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      {/* Marker Icon */}
      <div ref={iconRef} className="cursor-pointer flex items-center justify-center relative z-10" onClick={handleClick}>
        {/* Circle dot with border - smaller size */}
        <div className="relative w-5 h-5 rounded-full border-[1px] border-white bg-[#BA902E] shadow-lg overflow-hidden">
          {/* Avatar image - fades in on hover */}
          <img 
            ref={avatarRef}
            src={avatarSrc}
            alt="Avatar"
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            style={{ 
              clipPath: 'circle(50% at 50% 50%)',
            }}
          />
          {/* Center dot that fades out on hover */}
          <div ref={centerDotRef} className="absolute inset-[4px] rounded-full bg-[#BA902E]" />
        </div>
      </div>

    </div>
  );
};

// Cluster Icon Component
const ClusterIcon = ({ cluster, bokehScale, index }) => {
  const wrapperRef = useRef(null);
  const iconRef = useRef(null);
  const animateToPosition = useCameraStore((state) => state.animateToPosition);

  // Animate cluster in ONLY on initial load
  useEffect(() => {
    const clusterKey = `cluster-${index}`;
    
    if (wrapperRef.current && !animatedMarkers.has(clusterKey)) {
      animatedMarkers.add(clusterKey);
      gsap.fromTo(
        wrapperRef.current,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          delay: 2.5,
          stagger: 0.05,
          ease: "back.out(1.7)",
        }
      );
    } else if (wrapperRef.current) {
      // Already animated before, show immediately
      gsap.set(wrapperRef.current, { scale: 1, opacity: 1 });
    }
  }, [index]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (animateToPosition) {
      // Zoom to cluster center
      animateToPosition(cluster.position, bokehScale);
    }
  };

  const handleMouseEnter = () => {
    gsap.to(iconRef.current, {
      scale: 1.2,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(iconRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={iconRef}
        className="cursor-pointer flex items-center justify-center"
        onClick={handleClick}
      >
        {/* Cluster circle with count */}
        <div className="relative w-10 h-10 rounded-full border-2 border-white bg-[#BA902E] shadow-xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">{cluster.count}</span>
        </div>
      </div>
    </div>
  );
};

export const Markers = ({ bokehScale }) => {
  const { nodes } = useGLTF("/inis-stor/ireland.glb");
  const getFilteredMakers = useMakerStore((state) => state.getFilteredMakers);
  const clusterThreshold = useMakerStore((state) => state.clusterThreshold);
  const cameraDistance = useCameraStore((state) => state.cameraDistance);
  const filteredMakers = getFilteredMakers();

  // Find the dots node and extract positions of all its children
  const markerPositions = useMemo(() => {
    if (!nodes.dots) {
      console.warn("No 'dots' node found in ireland.glb");
      return [];
    }

    const positions = [];

    // Traverse the dots node to find all children
    nodes.dots.traverse((child) => {
      // Skip the parent node itself
      if (child === nodes.dots) return;

      // Get world position of each child
      const worldPosition = new THREE.Vector3();
      child.getWorldPosition(worldPosition);

      positions.push({
        position: worldPosition,
        name: child.name || "Marker",
        object: child,
      });
    });

    return positions;
  }, [nodes]);

  // Create marker data with positions - assign ALL makers to city positions
  const markersWithPositions = useMemo(() => {
    const result = [];
    
    // For each maker, assign them to a city position
    makers.forEach((makerData, makerIndex) => {
      const isVisible = filteredMakers.some((m) => m.id === makerData.id);
      if (!isVisible) return;
      
      // Assign makers to city positions based on their index
      // This ensures multiple makers per city
      const cityIndex = makerIndex % markerPositions.length;
      const cityPosition = markerPositions[cityIndex];
      
      if (cityPosition) {
        // Add deterministic offset based on maker ID so positions are stable
        const seed = makerData.id * 12.9898;
        const offsetX = (Math.sin(seed) * 0.5) * 0.4;
        const offsetZ = (Math.cos(seed) * 0.5) * 0.4;
        const position = new THREE.Vector3(
          cityPosition.position.x + offsetX,
          cityPosition.position.y,
          cityPosition.position.z + offsetZ
        );
        
        result.push({
          position: position,
          name: cityPosition.name,
          object: cityPosition.object,
          makerData,
          isVisible: true,
          index: makerIndex,
        });
      }
    });
    
    console.log(`Total markers with positions: ${result.length}, Cities: ${markerPositions.length}`);
    return result;
  }, [markerPositions, filteredMakers]);

  // Calculate clusters based on camera distance
  const clusters = useMemo(() => {
    const result = calculateClusters(markersWithPositions, cameraDistance, clusterThreshold);
    const clusterCount = result.filter(c => c.type === "cluster").length;
    const individualCount = result.filter(c => c.type === "individual").length;
    console.log(`Camera distance: ${cameraDistance.toFixed(2)}, Clusters: ${clusterCount}, Individuals: ${individualCount}`);
    return result;
  }, [markersWithPositions, cameraDistance, clusterThreshold]);

  if (markerPositions.length === 0) {
    return null;
  }

  return (
    <>
      {clusters.map((cluster, clusterIndex) => {
        if (cluster.type === "cluster") {
          // Render cluster
          return (
            <Html
              key={`cluster-${clusterIndex}`}
              position={[cluster.position.x, cluster.position.y, cluster.position.z]}
              center
              className="pointer-events-auto"
            >
              <ClusterIcon cluster={cluster} bokehScale={bokehScale} index={clusterIndex} />
            </Html>
          );
        } else {
          // Render individual marker
          const marker = cluster.members[0];
          return (
            <Html
              key={`marker-${marker.index}`}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              center
              className="pointer-events-auto"
            >
              <MarkerIcon
                marker={marker}
                bokehScale={bokehScale}
                index={marker.index}
                makerData={marker.makerData}
                isVisible={true}
              />
            </Html>
          );
        }
      })}
    </>
  );
};
