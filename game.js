// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 450;

// UI
const coinDisplay = document.getElementById("coinCount");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");

// Images
const catImg = new Image();
catImg.src = "image1.png";

const monsterImg = new Image();
monsterImg.src = "image2.png";

const coinImg = new Image();
coinImg.src = "image3.png";

// Game settings
let gameTime = 90; // 1.5 minutes
let coinsRequired = 6;
let worldLength = 9000; // doubled length
let scrollSpeed = 4;

let canDash = false;
let dashActive = false;
let dashTimer = 0;

// Player
let player = {
    x: 100,
    y: 300,
    w: 70,
    h: 70,
    vy: 0,
    jumping: false,
    doubleJump: false,
    speed: 4
};

// Physics
const gravity = 0.5;

// World objects
let obstacles = [];
let monsters = [];
let platforms = [];
let coins = [];

function generateWorld() {
    obstacles = [];
    monsters = [];
    platforms = [];
    coins = [];

    // High/low obstacles every 600px
    for (let i = 500; i < worldLength; i += 600) {
        let height = Math.random() < 0.5 ? 60 : 120;
        obstacles.push({ x: i, y: 430 - height, w: 60, h: height });
    }

    // 10 platforms (standable)
    for (let i = 800; i < 800 + 10 * 700; i += 700) {
        platforms.push({ x: i, y: 220 + Math.random() * 100, w: 150, h: 20 });
    }

    // 7 monsters under platforms
    for (let i = 1200; i < 1200 + 7 * 800; i += 800) {
        monsters.push({
            x: i,
            y: 350,
            w: 70,
            h: 70,
            dir: 1
        });
    }

    // 8 coins
    for (let i = 900; i < 900 + 8 * 700; i += 700) {
        coins.push({
            x: i,
            y: 200,
            w: 40,
            h: 40,
            collected: false
        });
    }
}

generateWorld();

let coinsCollected = 0;
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Movement
function handleMovement() {
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    if (keys["w"]) {
        if (!player.jumping) {
            player.vy = -11;
            player.jumping = true;
        } else if (!player.doubleJump) {
            player.vy = -11;
            player.doubleJump = true;
        }
    }

    // Dash only if unlocked
    if (keys["Shift"] && canDash) {
        dashActive = true;
        dashTimer = 30;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleMovement();

    // Gravity
    player.vy += gravity;
    player.y += player.vy;

    // Ground
    if (player.y + player.h >= 430) {
        player.y = 430 - player.h;
        player.vy = 0;
        player.jumping = false;
        player.doubleJump = false;
    }

    // Dash logic
    if (dashActive) {
        player.speed = 10;
        dashTimer--;
        if (dashTimer <= 0) {
            dashActive = false;
            player.speed = 4;
        }
    }

    // Scroll world
    [obstacles, monsters, platforms, coins].forEach(arr => {
        arr.forEach(obj => obj.x -= scrollSpeed);
    });

    // Monster patrol
    monsters.forEach(m => {
        m.y += m.dir * 1.2;
        if (m.y < 300 || m.y > 370)
            m.dir *= -1;
    });

    // Draw obstacles
    ctx.fillStyle = "black";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    // Draw platforms
    ctx.fillStyle = "brown";
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Platform collision
    platforms.forEach(p => {
        if (player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h >= p.y &&
            player.y + player.h <= p.y + p.h + 10 &&
            player.vy >= 0
        ) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.jumping = false;
            player.doubleJump = false;
        }
    });

    // Draw monsters
    monsters.forEach(m => {
        ctx.drawImage(monsterImg, m.x, m.y, m.w, m.h);
    });

    // Monster collision → restart
    for (let m of monsters) {
        if (checkCollision(player, m))
            return resetGame("You touched a monster! Restarting...");
    }

    // Draw & collect coins
    coins.forEach(c => {
        if (!c.collected)
            ctx.drawImage(coinImg, c.x, c.y, c.w, c.h);

        if (!c.collected && checkCollision(player, c)) {
            c.collected = true;
            coinsCollected++;
            coinDisplay.textContent = `Coins: ${coinsCollected} / 8`;
        }
    });

    // Draw cat
    ctx.drawImage(catImg, player.x, player.y, player.w, player.h);

    // Timer
    if (frame % 60 === 0) {
        gameTime--;
        timerDisplay.textContent = `Time: ${gameTime}`;
        if (gameTime <= 0)
            return resetGame("Time's up!");
    }

    // Win condition
    if (player.x > worldLength - 400) {
        if (coinsCollected >= coinsRequired)
            statusDisplay.textContent = "🎉 You Win!";
        else
            statusDisplay.textContent = "Not enough coins!";
    }

    frame++;
    requestAnimationFrame(update);
}

let frame = 0;

function checkCollision(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function resetGame(msg) {
    alert(msg);
    player.x = 100;
    player.y = 200;
    coinsCollected = 0;
    coinDisplay.textContent = "Coins: 0 / 8";
    gameTime = 90;
    generateWorld();
}

function choosePower(power) {
    document.getElementById("dialogueBox").classList.add("hidden");

    if (power === "dash")
        canDash = true;

    // Power lasts 5 seconds
    setTimeout(() => {
        canDash = false;
    }, 5000);
}

update();
