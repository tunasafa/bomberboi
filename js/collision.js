function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
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
    
    const corners = [
        { x: x, y: y },                    
        { x: x + width - 1, y: y },        
        { x: x, y: y + height - 1 },       
        { x: x + width - 1, y: y + height - 1 } 
    ];
    
    
    const centerPoints = [
        { x: x + width/2, y: y },          
        { x: x + width/2, y: y + height - 1 }, 
        { x: x, y: y + height/2 },         
        { x: x + width - 1, y: y + height/2 }  
    ];
    
    const allPoints = [...corners, ...centerPoints];
    
    return allPoints.every(point => {
        const tileX = Math.floor(point.x / 32);
        const tileY = Math.floor(point.y / 32);
        
        if (tileX < 0 || tileX >= map[0].length || tileY < 0 || tileY >= map.length) {
            return false;
        }
        const tileValue = map[tileY][tileX];
        return tileValue === 0;
    });
}