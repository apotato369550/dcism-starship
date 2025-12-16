/**
 * Tile/Unit Type Definitions
 *
 * Each unit has:
 * - name: Display name
 * - type: 'prod' (production/income) or 'mil' (military/defense)
 * - cost: Energy cost to build
 * - val: Production value (energy/sec) or defense bonus
 * - symbol: Emoji icon displayed on tile
 * - upgrade: Key of next tier unit (null if max tier)
 */

const TILE_TYPES = {
    // ===== PRODUCTION UNITS =====
    solar_siphon: {
        name: 'Solar Siphon',
        description:
            'Harnesses stellar radiation to generate energy. A modest foundation for any colony.',
        type: 'prod',
        cost: 20,
        val: 1,
        symbol: '⚡',
        upgrade: 'flux_reactor',
    },
    flux_reactor: {
        name: 'Flux Reactor',
        description:
            'A sophisticated reactor core that channels exotic matter for potent energy production.',
        type: 'prod',
        cost: 150,
        val: 5,
        symbol: '💠',
        upgrade: 'void_harvester',
    },
    void_harvester: {
        name: 'Void Harvester',
        description:
            'Taps directly into the void itself, extracting energy from the fundamental fabric of reality.',
        type: 'prod',
        cost: 600,
        val: 25,
        symbol: '🌌',
        upgrade: null,
    },

    // ===== MILITARY UNITS =====
    orbital_wall: {
        name: 'Orbital Wall',
        description:
            "A defensive barrier that hardens your territory. Strengthens your colony's defenses.",
        type: 'mil',
        cost: 50,
        val: 50,
        symbol: '🛡️',
        upgrade: 'laser_battery',
    },
    laser_battery: {
        name: 'Laser Battery',
        description:
            'Advanced directed energy weapon. Devastates opposing forces with precision firepower.',
        type: 'mil',
        cost: 300,
        val: 150,
        symbol: '🔭',
        upgrade: null,
    },
};

module.exports = TILE_TYPES;
