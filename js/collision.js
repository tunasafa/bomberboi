function checkCollision(obj1, obj2, buffer = 0) {
    return (
        obj1.x + buffer < obj2.x + obj2.width - buffer &&
        obj1.x + obj1.width - buffer > obj2.x + buffer &&
        obj1.y + buffer < obj2.y + obj2.height - buffer &&
        obj1.y + obj1.height - buffer > obj2.y + buffer
    );
}

function checkTileCollision(x, y, map) {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    if (tileX < 0 || tileX >= map[0].length || tileY < 0 || tileY >= map.length) {
        return true;
    }
    
    return map[tileY][tileX] === 1 || map[tileY][tileX] === 2;
}

function canMove(x, y, width, height, map) {
    const minTileX = Math.floor(x / 32);
    const maxTileX = Math.floor((x + width - 1) / 32);
    const minTileY = Math.floor(y / 32);
    const maxTileY = Math.floor((y + height - 1) / 32);

    if (minTileX < 0 || maxTileX >= map[0].length || minTileY < 0 || maxTileY >= map.length) {
        return false;
    }

    for (let ty = minTileY; ty <= maxTileY; ty++) {
        const row = map[ty];
        for (let tx = minTileX; tx <= maxTileX; tx++) {
            if (row[tx] !== 0) return false;
        }
    }
    return true;
}