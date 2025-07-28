import { UVCoordinates } from "../store/beamforming.state";

export const azElToUV = (az: number, el: number) : UVCoordinates => ({
    u: Math.cos(el) * Math.sin(az),
    v: Math.sin(el)
})

export const uv2azel = (uv : UVCoordinates) => {
    const el = Math.asin(uv.v);
    const az = Math.atan2(uv.u, Math.sqrt(Math.max(0, 1 - uv.u**2 - uv.v**2)));
    return { az, el };
}
