uniform float uTime;
uniform float uRevealProgress;

varying vec2 vUv;

#include ../includes/getPerlinNoise2d.glsl;

void main() {

  // Define the center of the UV space
  vec2 center = vec2(0.5, 0.5);

  // Calculate the distance from the UV coordinate to the center
  float distanceToCenter = length(vUv - center);

  // Apply perlin noise based on UV coordinates and time for animated effect
  float perlinStrength = getPerlinNoise2d(vUv * 20.0 + uTime) * 0.5;

  // Calculate reveal progress using distance and noise
  float revealProgress = (distanceToCenter + perlinStrength * 0.1) / 0.5 - uRevealProgress;

  // Discard fragments outside of a specified radius to create the circular shape
  if (revealProgress > 0.0 || distanceToCenter > 0.5) {
    discard;
  }

  // Calculate the edge strength for a gradient reveal effect
  float edgeStrength = clamp(abs(revealProgress * 20.0), 0.0, 1.0);

  // Define the edge and background colors
  vec3 edgeColor = vec3(1.0, 1.0, 1.0); // white edge color
  vec3 backgroundColor = vec3(0.0, 0.0, 0.0); // black background color

  // Blend colors based on the edge strength
  vec3 finalColor = mix(backgroundColor, edgeColor, edgeStrength);

  // Output the final color with an alpha based on edge strength for smooth blending
  gl_FragColor = vec4(finalColor, edgeStrength);
}
