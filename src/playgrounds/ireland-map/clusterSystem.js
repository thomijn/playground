import * as THREE from "three";

/**
 * Calculate clusters based on camera distance and marker positions
 * @param {Array} markers - Array of marker objects with position and makerData
 * @param {number} cameraDistance - Distance from camera to target
 * @param {number} clusterThreshold - Distance threshold for clustering (default: 12)
 * @returns {Array} Array of clusters with position, count, and member IDs
 */
export function calculateClusters(markers, cameraDistance, clusterThreshold = 12) {
  // If zoomed in close enough, don't cluster
  if (cameraDistance < clusterThreshold) {
    return markers.map((marker, index) => ({
      type: "individual",
      position: marker.position,
      makerData: marker.makerData,
      index: index,
      members: [marker],
    }));
  }

  // Calculate clustering distance based on camera distance
  // Further away = larger clusters - made more aggressive
  const clusterDistance = Math.max(1.5, cameraDistance / 10);

  const clusters = [];
  const visited = new Set();

  markers.forEach((marker, index) => {
    if (visited.has(index)) return;

    const cluster = {
      type: "cluster",
      members: [marker],
      indices: [index],
      position: marker.position.clone(),
    };

    visited.add(index);

    // Find nearby markers to add to this cluster
    markers.forEach((otherMarker, otherIndex) => {
      if (visited.has(otherIndex)) return;

      const distance = marker.position.distanceTo(otherMarker.position);
      
      if (distance < clusterDistance) {
        cluster.members.push(otherMarker);
        cluster.indices.push(otherIndex);
        visited.add(otherIndex);
      }
    });

    // Calculate cluster center position (average of all members)
    if (cluster.members.length > 1) {
      const centerPos = new THREE.Vector3();
      cluster.members.forEach((member) => {
        centerPos.add(member.position);
      });
      centerPos.divideScalar(cluster.members.length);
      cluster.position = centerPos;
      cluster.count = cluster.members.length;
    } else {
      // Single marker, treat as individual
      cluster.type = "individual";
      cluster.makerData = cluster.members[0].makerData;
      cluster.index = cluster.indices[0];
    }

    clusters.push(cluster);
  });

  return clusters;
}

/**
 * Get the center position of a cluster
 * @param {Array} members - Array of marker members in the cluster
 * @returns {THREE.Vector3} Center position
 */
export function getClusterCenter(members) {
  const center = new THREE.Vector3();
  members.forEach((member) => {
    center.add(member.position);
  });
  center.divideScalar(members.length);
  return center;
}

/**
 * Determine if we should show clusters based on zoom level
 * @param {number} cameraDistance - Distance from camera to target
 * @param {number} threshold - Threshold distance for clustering
 * @returns {boolean} True if should show clusters
 */
export function shouldShowClusters(cameraDistance, threshold = 12) {
  return cameraDistance >= threshold;
}

/**
 * Get zoom level category
 * @param {number} cameraDistance - Distance from camera to target
 * @returns {string} "close", "medium", or "far"
 */
export function getZoomLevel(cameraDistance) {
  if (cameraDistance < 10) return "close";
  if (cameraDistance < 20) return "medium";
  return "far";
}

