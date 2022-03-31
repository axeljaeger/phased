precision highp float;

// Attributes
attribute vec3 position;
attribute vec2 uv;

#include<instancesDeclaration>

// Uniforms
uniform mat4 worldViewProjection;

// Varying
varying vec2 vUV;

void main(void) {
#include<instancesVertex>
    gl_Position = worldViewProjection * finalWorld* vec4(position, 1.0);
    vUV = uv;
}