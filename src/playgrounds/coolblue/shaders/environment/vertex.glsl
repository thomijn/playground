varying vec3 vWorldPosition;

varying vec3 vPositionT;
varying vec3 vNormalT;

void main() {
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  vPositionT = modelPosition.xyz;
  vNormalT = modelNormal.xyz;

}