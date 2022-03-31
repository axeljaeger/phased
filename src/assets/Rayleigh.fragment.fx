precision highp float;

varying vec2 vUV;
varying vec3 globalPos;

uniform sampler2D coolwarmSampler;
uniform float globalPhase;

void main(void) {
    float phase = globalPos.x / 0.086;
    float amplitude = sin(phase + globalPhase);
    float u = 0.5*(1.0+amplitude);
    gl_FragColor = texture2D(coolwarmSampler, vec2(u, 0.5));
}