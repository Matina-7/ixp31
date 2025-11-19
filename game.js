// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let level = 1;

// Update score display
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

// Update level display
function updateLevel(newLevel) {
    level = newLevel;
    document.getElementById('level').textContent = level;
}

// Show dialogue box
function showDialogue(text) {
    const dialogueBox = document.getElementById('dialogueBox');
    const dialogueText = document.getElementById('dialogueText');
    dialogueText.textContent = text;
    dialogueBox.classList.remove('hidden');
}

// Hide dialogue box
function hideDialogue() {
    const dialogueBox = document.getElementById('dialogueBox');
    dialogueBox.classList.add('hidden');
}

// Handle dialogue options
function handleOption(option) {
    console.log('Option selected:', option);
    hideDialogue();
    // Add your game logic here based on the selected option
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add your game rendering logic here

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    console.log('Game initialized');
    // Start game loop
    gameLoop();
}

// Start the game when page loads
window.addEventListener('load', init);
