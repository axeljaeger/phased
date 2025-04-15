export const azElToUV = (az: number, el: number) => ({
    u: Math.cos(el) * Math.sin(az),
    v: Math.sin(el)
})
