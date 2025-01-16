varying vec3 vNormalT;
varying vec3 vPositionT;

uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

uniform float uBottomY;  // The Y position where the wobble effect should start
uniform float uTopY;     // The Y position where the wobble effect should fade out

attribute vec4 tangent;

varying float vWobble;
varying vec3 vPosition;
varying vec3 vNormals;

varying vec3 vWorldPosition;
varying float heightFactor;

#include ../includes/simplexNoise4d.glsl

float getWobbleStrengthByHeight(float yPos) {
  float factor = clamp((yPos - uBottomY) / (uTopY - uBottomY), 0.0, 1.0);

  return pow(1.0 - factor, 2.0);
}

float getWobble(vec3 position, float wobbleStrength) {
  vec3 warpedPosition = position;
  warpedPosition += simplexNoise4d(vec4(position * uWarpPositionFrequency, uTime * uWarpTimeFrequency)) * uWarpStrength;

  return simplexNoise4d(vec4(warpedPosition * uPositionFrequency, uTime * uTimeFrequency)) * uStrength * wobbleStrength;  // Apply the strength based on height
}

void main() {
  vec3 biTangent = cross(normal, tangent.xyz);
  float shift = 0.001 * length(normal);  // Smaller shift for more delicate perturbations

  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // // Get the wobble strength based on the Y-coordinate
  float wobbleStrength = getWobbleStrengthByHeight(csm_Position.y);

  float factor = clamp((csm_Position.y - uBottomY) / (uTopY - uBottomY), 0.0, 1.0);
  heightFactor = factor;

  // Neighbours positions (perturb slightly in tangent space)
  vec3 positionA = csm_Position + tangent.xyz * shift;
  vec3 positionB = csm_Position + biTangent * shift;

  // Wobble effect on the current position and neighbours
  float wobble = getWobble(csm_Position, wobbleStrength);
  csm_Position += wobble * normal * 0.5;  // Reduce the wobble effect on vertex displacement

  // Apply wobble to the neighboring positions
  positionA += getWobble(positionA, wobbleStrength) * normal * 0.5;
  positionB += getWobble(positionB, wobbleStrength) * normal * 0.5;

  // Compute new normal using cross product of the perturbed neighbors
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);

  // Ensure the normal is unit length and safe from degenerate cases
  if(length(toA) > 0.0 && length(toB) > 0.0) {
    csm_Normal = normalize(cross(toA, toB));  // Cross product of two neighboring directions
  }

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  vPositionT = modelPosition.xyz;
  vNormalT = modelNormal.xyz;

}