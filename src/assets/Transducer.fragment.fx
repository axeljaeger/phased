precision highp float;

varying vec2 vUV;

uniform sampler2D textureSampler;
uniform float globalPhase;
uniform float transducerDiameter;

void main(void) {
    if (length(vUV - vec2(.5,.5))>0.5) {
        discard;
    }

    gl_FragColor = vec4(0.5*(1.0 + sin(globalPhase)), 0, 0.5*(1.0 - sin(globalPhase)),1);
}