import { ArrayConfig } from "./store/store.service";

export const presets : ArrayConfig[] = [
{
    name: "URA 8x8 0.5lambda",
    environment: {
        speedOfSound: 343,
        environmentHint: 'Air',
        excitationFrequencyBase: 40,
        excitationFrequencyMultiplier: 'kHz',
    },
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
{
    name: "URA 8x8 1.1lambda",
    environment: {
        speedOfSound: 343,
        environmentHint: 'Air',
        excitationFrequencyBase: 40,
        excitationFrequencyMultiplier: 'kHz'
    },
    config: {
        type: 'ura',
        elementsX: 8,
        elementsY: 8,
        pitchX: 0.012,
        pitchY: 0.012,
    },
    citation: null,
    transducerDiameter: 0.012,
},
{
    name: "Line 6 0.5lambda",
    environment: {
        speedOfSound: 343,
        environmentHint: 'Air',
        excitationFrequencyBase: 40,
        excitationFrequencyMultiplier: 'kHz'
    },
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
{
    name: "Line 8 0.5lambda wide",
    environment: {
        speedOfSound: 343,
        environmentHint: 'Air',
        excitationFrequencyBase: 40,
        excitationFrequencyMultiplier: 'kHz'
    },
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
{
    name: "Point source",
    environment: {
        speedOfSound: 343,
        environmentHint: 'Air',
        excitationFrequencyBase: 40,
        excitationFrequencyMultiplier: 'kHz'
    },
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
    {
        name: "L11-5gH @8 MHz",
        environment: {
            speedOfSound: 1480,
            environmentHint: 'Water',
            excitationFrequencyBase: 8,
            excitationFrequencyMultiplier: 'MHz'
        },
        config: {
            type: 'ura',
            elementsX: 128,
            elementsY: 1,
            pitchX: 0.0003,
            pitchY: 0.0003,
        },
        transducerDiameter: 0.0002,
        citation: {
            kind: 'Industrial',
            url: "https://verasonics.com/general-imaging-transducers/",
            urlTitle: "Product overview",
            title: "General Imaging Transducers",
            authors: "Verasonics, Inc.",
            year: 2025,
        },
    }
]