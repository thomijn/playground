uniform float uTime;
uniform float uScale;
uniform float uCameraNear;
uniform float uCameraFar;
uniform float uParticleSize;
varying float vFade;

#include ../includes/simplexNoise3d.glsl;

void main() {
  vec3 p = position;
  p.x += snoise(position.xyz + uTime * 0.02);
  p.y += snoise(position.yyz + uTime * 0.02);
  p.z += snoise(position.zxy + uTime * 0.02);


  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uScale * (uParticleSize / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vec3 worldPosition = (modelMatrix * vec4(p, 1.0)).xyz;
  float linearDepth = 1.0 / (uCameraFar - uCameraNear);
  float linearPos = length(cameraPosition - worldPosition) * linearDepth;
  vFade = 1.0 - linearPos * 0.75;
  vFade *= smoothstep(0.09, 0.13, linearPos);
}