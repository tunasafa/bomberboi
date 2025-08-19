function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sprites = {
    player: { color: '#3498db' },    // Blue
    enemy: { color: '#e74c3c' },     // Red
    bomb: { color: '#2c3e50' },      // Dark gray
    explosion: { color: '#f39c12' }, // Orange
    wall: { color: '#7f8c8d' },      // Gray
    block: { color: '#27ae60' },     // Green
    ground: { color: '#ecf0f1' }     // Light gray
};