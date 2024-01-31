export const presets = [
    {
        name: "URA 8x8 0.5lambda",
        config: {
            arrayType: 'ura',
            uraConfig: {
                elementsX: 8,
                elementsY: 8,
                pitchX: 0.0043,
                pitchY: 0.0043,
            },
            roundConfig: {
                diameter: 0.05,
                elementCount: 5,
            },
        }
    },
    {
        name: "URA 8x8 1.1lambda",
        config: {
            arrayType: 'ura',
            uraConfig: {
                elementsX: 8,
                elementsY: 8,
                pitchX: 0.01,
                pitchY: 0.01,
            },
            roundConfig: {
                diameter: 0.05,
                elementCount: 5,
            },
        }
    },
    {
        name: "Line 8 0.5lambda",
        config: {
            arrayType: 'ura',
            uraConfig: {
                elementsX: 8,
                elementsY: 1,
                pitchX: 0.0043,
                pitchY: 0.0043,
            },
            roundConfig: {
                diameter: 0.05,
                elementCount: 5,
            },
        }
    },
    {
        name: "Point source",
        config: {
            arrayType: 'ura',
            uraConfig: {
                elementsX: 1,
                elementsY: 1,
                pitchX: 0.01,
                pitchY: 0.01,
            },
            roundConfig: {
                diameter: 0.05,
                elementCount: 5,
            },
        }
    }






]