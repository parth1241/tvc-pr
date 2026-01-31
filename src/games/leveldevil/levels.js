export const levels = [
    {
        id: 1,
        name: "Trust Issues",
        spawn: { x: 50, y: 450 },
        goal: { x: 700, y: 450, width: 40, height: 60 },
        platforms: [
            { x: 0, y: 560, width: 300, height: 40 }, // Start floor
            { x: 500, y: 560, width: 300, height: 40 }, // End floor
            { x: 0, y: 0, width: 50, height: 600 },   // Walls
            { x: 750, y: 0, width: 50, height: 600 },
        ],
        hazards: [
            // Spikes on the ceiling?
        ],
        traps: [
            // The Middle "Bridge" that falls
            {
                x: 300, y: 560, width: 200, height: 40,
                startX: 300, startY: 560, endX: 300, endY: 800, // Falls down
                speed: 0.08, type: 'move', category: 'platform'
            },
            // A spike wall that moves across the screen from left to right?
            // Or just a simple "Ceiling crush" at the end
            {
                x: 600, y: -100, width: 50, height: 600,
                startX: 600, startY: -600, endX: 600, endY: 0,
                speed: 0.15, type: 'move', category: 'hazard' // Big crusher
            }
        ]
    }
];
