varying vec3 vPositionT;
varying vec3 vNormalT;

varying vec3 vWorldPosition;
uniform vec3 uCharacterPosition;
uniform float uTime;
uniform float uRevealProgress;

#include ../includes/getPerlinNoise4d.glsl;

void main() {

  float distanceToCenter = length(vWorldPosition - uCharacterPosition);
  float perlinStrength = getPerlinNoise4d(vec4(vWorldPosition.xyz * 3.0, uTime)) * 1.5;
  float revealProgress = (distanceToCenter + perlinStrength * 0.5) / 6.5 - uRevealProgress;

  if(revealProgress > 0.0) {
    discard;
  }

  float edgeStrength = clamp(abs(revealProgress * 10.0), 0.0, 1.0);
  vec3 edgeColor = vec3(1.0, 1.0, 1.0);

  vec3 endColor = mix(edgeColor, csm_DiffuseColor.rgb, edgeStrength);

  csm_DiffuseColor = vec4(endColor, 1.0);

}