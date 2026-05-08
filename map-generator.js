// Seeded Random Number Generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    range(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    
    chance(probability) {
        return this.next() < probability;
    }
}

// Dungeon Generation Algorithm (Room + Corridor)
function generateDungeon(ctx, width, height, tileSize, rng) {
    const wallColor = '#1a1a1a';
    const floorColor = '#4a4a4a';
    const accentColor = '#d4af37';
    
    // Initialize grid (1 = wall, 0 = floor)
    const grid = Array(height).fill().map(() => Array(width).fill(1));
    
    // Generate rooms
    const rooms = [];
    const numRooms = rng.range(6, 14);
    
    for (let i = 0; i < numRooms * 2; i++) {
        const roomWidth = rng.range(4, 11);
        const roomHeight = rng.range(4, 11);
        const x = rng.range(1, width - roomWidth - 1);
        const y = rng.range(1, height - roomHeight - 1);
        
        // Check for overlap
        let overlap = false;
        for (let room of rooms) {
            if (!(x + roomWidth + 1 < room.x || x - 1 > room.x + room.width ||
                  y + roomHeight + 1 < room.y || y - 1 > room.y + room.height)) {
                overlap = true;
                break;
            }
        }
        
        if (!overlap && rooms.length < numRooms) {
            rooms.push({x, y, width: roomWidth, height: roomHeight});
            
            // Carve out room
            for (let dy = 0; dy < roomHeight; dy++) {
                for (let dx = 0; dx < roomWidth; dx++) {
                    if (y + dy < height && x + dx < width) {
                        grid[y + dy][x + dx] = 0;
                    }
                }
            }
        }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        const room1 = rooms[i];
        const room2 = rooms[i + 1];
        
        const x1 = Math.floor(room1.x + room1.width / 2);
        const y1 = Math.floor(room1.y + room1.height / 2);
        const x2 = Math.floor(room2.x + room2.width / 2);
        const y2 = Math.floor(room2.y + room2.height / 2);
        
        // L-shaped corridor
        if (rng.chance(0.5)) {
            // Horizontal then vertical
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                if (y1 >= 0 && y1 < height && x >= 0 && x < width) {
                    grid[y1][x] = 0;
                    if (y1 > 0) grid[y1 - 1][x] = 0; // Make corridors 2 tiles wide
                }
            }
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                if (y >= 0 && y < height && x2 >= 0 && x2 < width) {
                    grid[y][x2] = 0;
                    if (x2 > 0) grid[y][x2 - 1] = 0;
                }
            }
        } else {
            // Vertical then horizontal
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                if (y >= 0 && y < height && x1 >= 0 && x1 < width) {
                    grid[y][x1] = 0;
                    if (x1 > 0) grid[y][x1 - 1] = 0;
                }
            }
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                if (y2 >= 0 && y2 < height && x >= 0 && x < width) {
                    grid[y2][x] = 0;
                    if (y2 > 0) grid[y2 - 1][x] = 0;
                }
            }
        }
    }
    
    // Render to canvas
    ctx.fillStyle = wallColor;
    ctx.fillRect(0, 0, width * tileSize, height * tileSize);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[y][x] === 0) {
                // Floor tile
                ctx.fillStyle = floorColor;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                
                // Add subtle variation
                if (rng.chance(0.15)) {
                    const variation = rng.range(-10, 10);
                    ctx.fillStyle = `rgba(${74 + variation}, ${74 + variation}, ${74 + variation}, 0.5)`;
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            } else {
                // Wall tile with texture
                ctx.fillStyle = wallColor;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                
                if (rng.chance(0.2)) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    ctx.fillRect(x * tileSize + rng.range(0, tileSize/3), 
                               y * tileSize + rng.range(0, tileSize/3), 
                               rng.range(3, 8), rng.range(3, 8));
                }
            }
        }
    }
    
    // Add room features
    rooms.forEach(room => {
        // Sometimes add a central feature
        if (rng.chance(0.35) && room.width >= 6 && room.height >= 6) {
            const cx = (room.x + Math.floor(room.width / 2)) * tileSize;
            const cy = (room.y + Math.floor(room.height / 2)) * tileSize;
            
            ctx.fillStyle = accentColor;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(cx + tileSize/2, cy + tileSize/2, tileSize * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });
    
    // Draw grid
    drawGrid(ctx, width, height, tileSize);
}

function generateWilderness(ctx, width, height, tileSize, rng) {
    // Multi-layered terrain generation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Perlin-like noise
            const noise1 = Math.sin(x * 0.08) * Math.cos(y * 0.08);
            const noise2 = Math.sin((x + y) * 0.04) * 2;
            const noise3 = Math.cos(x * 0.15) * Math.sin(y * 0.12);
            const combinedNoise = (noise1 + noise2 + noise3) / 4;
            
            // Create varied terrain
            const green = Math.floor(100 + combinedNoise * 60);
            const brown = Math.floor(70 + combinedNoise * 40);
            
            ctx.fillStyle = `rgb(${brown}, ${green}, 70)`;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            
            // Add natural features
            if (rng.chance(0.12)) {
                ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
                ctx.beginPath();
                ctx.arc(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 
                       tileSize/2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Add paths
    const numPaths = rng.range(2, 5);
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.7)';
    ctx.lineWidth = tileSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 0; i < numPaths; i++) {
        ctx.beginPath();
        let x = rng.range(0, width) * tileSize;
        let y = rng.range(0, height) * tileSize;
        ctx.moveTo(x, y);
        
        for (let j = 0; j < 25; j++) {
            x += rng.range(-tileSize * 3, tileSize * 3);
            y += rng.range(-tileSize * 3, tileSize * 3);
            x = Math.max(0, Math.min(width * tileSize, x));
            y = Math.max(0, Math.min(height * tileSize, y));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    drawGrid(ctx, width, height, tileSize);
}

function generateBattleMap(ctx, width, height, tileSize, rng) {
    const floorColor = '#5a5a5a';
    const wallColor = '#2a2a2a';
    const accentColor = '#d4af37';
    
    // Arena floor
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, 0, width * tileSize, height * tileSize);
    
    // Outer walls
    ctx.fillStyle = wallColor;
    const borderThick = 2;
    ctx.fillRect(0, 0, width * tileSize, borderThick * tileSize);
    ctx.fillRect(0, 0, borderThick * tileSize, height * tileSize);
    ctx.fillRect(0, (height - borderThick) * tileSize, width * tileSize, borderThick * tileSize);
    ctx.fillRect((width - borderThick) * tileSize, 0, borderThick * tileSize, height * tileSize);
    
    // Scatter obstacles
    const numObstacles = rng.range(8, 18);
    for (let i = 0; i < numObstacles; i++) {
        const obsWidth = rng.range(2, 5);
        const obsHeight = rng.range(2, 5);
        const x = rng.range(borderThick + 2, width - obsWidth - borderThick - 2);
        const y = rng.range(borderThick + 2, height - obsHeight - borderThick - 2);
        
        ctx.fillStyle = wallColor;
        ctx.fillRect(x * tileSize, y * tileSize, obsWidth * tileSize, obsHeight * tileSize);
        
        // Add accent
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x * tileSize, y * tileSize, obsWidth * tileSize, tileSize / 3);
        ctx.globalAlpha = 1;
    }
    
    // Tactical zones
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 4; i++) {
        const cx = rng.range(6, width - 6) * tileSize;
        const cy = rng.range(6, height - 6) * tileSize;
        const radius = rng.range(4, 8) * tileSize;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    drawGrid(ctx, width, height, tileSize);
}

function generateCity(ctx, width, height, tileSize, rng) {
    const streetColor = '#4a4a4a';
    const buildingColor = '#2a2a2a';
    const accentColor = '#d4af37';
    
    ctx.fillStyle = streetColor;
    ctx.fillRect(0, 0, width * tileSize, height * tileSize);
    
    // Street grid
    const blockSize = rng.range(7, 11);
    const streetWidth = 2;
    
    ctx.fillStyle = '#5a5a5a';
    for (let x = 0; x < width; x += blockSize) {
        ctx.fillRect(x * tileSize, 0, streetWidth * tileSize, height * tileSize);
    }
    for (let y = 0; y < height; y += blockSize) {
        ctx.fillRect(0, y * tileSize, width * tileSize, streetWidth * tileSize);
    }
    
    // Buildings in blocks
    for (let by = 0; by < height; by += blockSize) {
        for (let bx = 0; bx < width; bx += blockSize) {
            if (bx + blockSize > width || by + blockSize > height) continue;
            
            if (rng.chance(0.75)) {
                const bw = blockSize - streetWidth - 1;
                const bh = blockSize - streetWidth - 1;
                
                ctx.fillStyle = buildingColor;
                ctx.fillRect((bx + streetWidth) * tileSize, 
                           (by + streetWidth) * tileSize,
                           bw * tileSize, bh * tileSize);
                
                // Roof accent
                ctx.fillStyle = accentColor;
                ctx.globalAlpha = 0.3;
                ctx.fillRect((bx + streetWidth) * tileSize, 
                           (by + streetWidth) * tileSize,
                           bw * tileSize, tileSize * 0.5);
                ctx.globalAlpha = 1;
            }
        }
    }
    
    drawGrid(ctx, width, height, tileSize);
}

function drawGrid(ctx, width, height, tileSize) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    
    for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, height * tileSize);
        ctx.stroke();
    }
    
    for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(width * tileSize, y * tileSize);
        ctx.stroke();
    }
}

// Extract wall and light data from generation
function getWallsFromGeneration(mapType, width, height, dpi, rng) {
    const walls = [];
    const lights = [];

    if (mapType === 'dungeon') {
        // Re-generate the dungeon grid to extract walls
        const grid = Array(height).fill().map(() => Array(width).fill(1));
        const rooms = [];
        const numRooms = rng.range(6, 14);
        
        for (let i = 0; i < numRooms * 2; i++) {
            const roomWidth = rng.range(4, 11);
            const roomHeight = rng.range(4, 11);
            const x = rng.range(1, width - roomWidth - 1);
            const y = rng.range(1, height - roomHeight - 1);
            
            let overlap = false;
            for (let room of rooms) {
                if (!(x + roomWidth + 1 < room.x || x - 1 > room.x + room.width ||
                      y + roomHeight + 1 < room.y || y - 1 > room.y + room.height)) {
                    overlap = true;
                    break;
                }
            }
            
            if (!overlap && rooms.length < numRooms) {
                rooms.push({x, y, width: roomWidth, height: roomHeight});
                
                for (let dy = 0; dy < roomHeight; dy++) {
                    for (let dx = 0; dx < roomWidth; dx++) {
                        if (y + dy < height && x + dx < width) {
                            grid[y + dy][x + dx] = 0;
                        }
                    }
                }
            }
        }

        // Connect rooms (same corridor logic)
        for (let i = 0; i < rooms.length - 1; i++) {
            const room1 = rooms[i];
            const room2 = rooms[i + 1];
            
            const x1 = Math.floor(room1.x + room1.width / 2);
            const y1 = Math.floor(room1.y + room1.height / 2);
            const x2 = Math.floor(room2.x + room2.width / 2);
            const y2 = Math.floor(room2.y + room2.height / 2);
            
            if (rng.chance(0.5)) {
                for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    if (y1 >= 0 && y1 < height && x >= 0 && x < width) {
                        grid[y1][x] = 0;
                        if (y1 > 0) grid[y1 - 1][x] = 0;
                    }
                }
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    if (y >= 0 && y < height && x2 >= 0 && x2 < width) {
                        grid[y][x2] = 0;
                        if (x2 > 0) grid[y][x2 - 1] = 0;
                    }
                }
            } else {
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    if (y >= 0 && y < height && x1 >= 0 && x1 < width) {
                        grid[y][x1] = 0;
                        if (x1 > 0) grid[y][x1 - 1] = 0;
                    }
                }
                for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    if (y2 >= 0 && y2 < height && x >= 0 && x < width) {
                        grid[y2][x] = 0;
                        if (y2 > 0) grid[y2 - 1][x] = 0;
                    }
                }
            }
        }

        // Extract walls from grid
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (grid[y][x] === 1) { // Wall tile
                    // Check each edge for wall segments
                    const pixelX = x * dpi;
                    const pixelY = y * dpi;
                    
                    // Top edge
                    if (y === 0 || grid[y-1][x] === 0) {
                        walls.push({
                            points: [
                                { x: pixelX, y: pixelY },
                                { x: pixelX + dpi, y: pixelY }
                            ]
                        });
                    }
                    // Bottom edge
                    if (y === height - 1 || grid[y+1][x] === 0) {
                        walls.push({
                            points: [
                                { x: pixelX, y: pixelY + dpi },
                                { x: pixelX + dpi, y: pixelY + dpi }
                            ]
                        });
                    }
                    // Left edge
                    if (x === 0 || grid[y][x-1] === 0) {
                        walls.push({
                            points: [
                                { x: pixelX, y: pixelY },
                                { x: pixelX, y: pixelY + dpi }
                            ]
                        });
                    }
                    // Right edge
                    if (x === width - 1 || grid[y][x+1] === 0) {
                        walls.push({
                            points: [
                                { x: pixelX + dpi, y: pixelY },
                                { x: pixelX + dpi, y: pixelY + dpi }
                            ]
                        });
                    }
                }
            }
        }

        // Add lights in room centers
        rooms.forEach(room => {
            if (room.width >= 5 && room.height >= 5) {
                lights.push({
                    position: {
                        x: (room.x + room.width / 2) * dpi,
                        y: (room.y + room.height / 2) * dpi
                    },
                    radius: Math.min(room.width, room.height) * dpi * 0.8
                });
            }
        });

    } else if (mapType === 'battlemap') {
        // Add perimeter walls
        const borderThick = 2;
        
        // Top wall
        walls.push({
            points: [
                { x: 0, y: 0 },
                { x: width * dpi, y: 0 }
            ]
        });
        // Bottom wall
        walls.push({
            points: [
                { x: 0, y: height * dpi },
                { x: width * dpi, y: height * dpi }
            ]
        });
        // Left wall
        walls.push({
            points: [
                { x: 0, y: 0 },
                { x: 0, y: height * dpi }
            ]
        });
        // Right wall
        walls.push({
            points: [
                { x: width * dpi, y: 0 },
                { x: width * dpi, y: height * dpi }
            ]
        });

        // Add lights at corners for dramatic lighting
        lights.push(
            { position: { x: dpi * 5, y: dpi * 5 }, radius: dpi * 15 },
            { position: { x: width * dpi - dpi * 5, y: dpi * 5 }, radius: dpi * 15 },
            { position: { x: dpi * 5, y: height * dpi - dpi * 5 }, radius: dpi * 15 },
            { position: { x: width * dpi - dpi * 5, y: height * dpi - dpi * 5 }, radius: dpi * 15 }
        );
    }

    // Wilderness and city don't need walls typically
    
    return { walls, lights };
}
