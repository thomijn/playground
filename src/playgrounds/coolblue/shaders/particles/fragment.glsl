precision highp float;
uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform float uAlpha;
uniform float uCameraNear;
uniform float uCameraFar;
uniform vec2 uResolution;
uniform float uRevealProgress;
varying float vFade;
varying vec3 vWorldPosition;
uniform float uTime;

float fadeEdge(float particleDepth, float sceneDepth) {
  float extraMargin = 0.015;
  float a = (sceneDepth + extraMargin - particleDepth) * 120.0;
  if(a <= 0.0)
    return 0.0;
  if(a >= 1.0)
    return 1.0;
  if(a < 0.5)
    a = 2.0 * a * a;
  else
    a = -2.0 * pow(a - 1.0, 2.0) + 1.0;
  return a;
}

#include ../includes/getPerlinNoise4d.glsl;

void main() {

  vec4 color = texture2D(tMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));

  color.rgb *= 0.8;
  color.rg *= 4.5;
  color.a *= uRevealProgress * 0.8;
  gl_FragColor = color;
}