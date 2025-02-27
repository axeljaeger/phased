import { ArrayConfig, Kind } from "./store/arrayConfig.state";
import { EnvironmentHint, EnvironmentState, Multiplier } from "./store/environment.state";

export const presets : { config: ArrayConfig, environment: EnvironmentState}[] = [
    {
        config: {
            name: "URA 8x8 0.5lambda",
            config: {
                type: 'ura',
                elementsX: 8,
                elementsY: 8,
                pitchX: 0.0043,
                pitchY: 0.0043,
            },
            citation: {
                urlTitle: 'ULTSYM.2017.8091892',
                title: 'Air-coupled 40-KHZ ultrasonic 2D-phased array based on a 3D-printed waveguide structure',
                kind: 'Academic',
                url: 'https://doi.org/10.1109/ULTSYM.2017.8091892',
                authors: "A. Jäger et. al.",
                year: 2017,
            },
            transducerDiameter: 0.0034,
        },
        environment: {
            speedOfSound: 343,
            environmentHint: EnvironmentHint.Air,
            excitationFrequencyBase: 40,
            multiplier: Multiplier.kHz
        }
    },
    {
        config: {
            name: "URA 8x8 1.1lambda",
            citation: null,
            config: {
                type: 'ura',
                elementsX: 8,
                elementsY: 8,
                pitchX: 0.012,
                pitchY: 0.012,
            },
            transducerDiameter: 0.012,
        },
        environment: {
            speedOfSound: 0,
            environmentHint: EnvironmentHint.Air,
            excitationFrequencyBase: 0,
            multiplier: Multiplier.Hz
        }
    },
    {
        config: {
            name: "Line 6 0.5lambda",
            citation: {
                kind: 'Academic',
                url: "https://doi.org/10.1117/12.783988",
                urlTitle: "10.1117/12.783988",
                title: "Ultrasonic phased array sensor for electric travel aids for visually impaired people",
                authors: "T. Takahashi et. al.",
                year: 2008
            },
            config: {
                type: 'ura',
                elementsX: 6,
                elementsY: 1,
                pitchX: 0.0043,
                pitchY: 0.0043,
            },
            transducerDiameter: 0.0034,
        },
        environment: {
            speedOfSound: 434,
            environmentHint: EnvironmentHint.Air,
            excitationFrequencyBase: 40,
            multiplier: Multiplier.Hz
        }
    },
    {
        config: {
            name: "Line 8 0.5lambda wide",
            citation: {
                kind: 'Academic',
                url: "https://doi.org/10.1109/ICSENS.2015.7370187",
                urlTitle: "ICSENS.2015.7370187",
                title: "Versatile air-coupled phased array transducer for sensor applications",
                authors: "A. Unger et. al.",
                year: 2015,
            },
            transducerDiameter: 0.0034,
            config: {
                type: 'ura',
                elementsX: 8,
                elementsY: 12,
                pitchX: 0.0043,
                pitchY: 0.006,
            },
        },
        environment: {
            speedOfSound: 434,
            environmentHint: EnvironmentHint.Air,
            excitationFrequencyBase: 40,
            multiplier: Multiplier.Hz
        }
    },
    {
        config: {
            name: "Point source",
            config: {
                type: 'ura',
                elementsX: 1,
                elementsY: 1,
                pitchX: 0.01,
                pitchY: 0.01,
            },
            transducerDiameter: 0.001,
            citation: null,

        },
        environment: {
            speedOfSound: 0,
            environmentHint: EnvironmentHint.Air,
            excitationFrequencyBase: 0,
            multiplier: Multiplier.Hz
        }
    }
]