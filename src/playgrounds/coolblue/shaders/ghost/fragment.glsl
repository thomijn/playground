varying vec3 vPositionT;
varying vec3 vNormalT;
varying vec3 vWorldPosition;
uniform vec3 uCharacterPosition;
uniform float uTime;
uniform float uRevealProgress;

#include ../includes/getPerlinNoise4d.glsl;

void main() {
  vec3 normalT = normalize(vNormalT);

  vec3 viewDirection = normalize(vPositionT - cameraPosition);
  float dotProduct = dot(vNormalT, viewDirection);
  if(dotProduct > 0.0) {
    normalT *= -1.0;
  }

  float fresnel = dot(viewDirection, normalT) + 1.0;
  fresnel = pow(fresnel, 2.0);

  float distanceToCenter = length(vWorldPosition - uCharacterPosition);
  float perlinStrength = getPerlinNoise4d(vec4(vWorldPosition.xyz * 3.0, uTime)) * 1.5;
  float revealProgress = (distanceToCenter + perlinStrength * 0.5) / 6.5 - uRevealProgress;

  if(uRevealProgress < 0.01) {
    discard;
  }

  if(revealProgress > 0.0) {
    discard;
  }

  // float edgeStrength = clamp(abs(revealProgress * 10.0), 0.0, 1.0);
  // vec3 edgeColor = vec3(1.0, 1.0, 1.0);

  // vec3 endColor = mix(edgeColor, csm_DiffuseColor.rgb, edgeStrength);

  // csm_DiffuseColor = vec4(endColor, 1.0);

  csm_DiffuseColor = vec4(1., 1.0, 1.0, fresnel + 0.1);

}