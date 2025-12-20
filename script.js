// ============================================
// UNIT SETTINGS - EASY TO EDIT!
// ============================================

const UNIT_SETTINGS = {
    soldier: {
        health: 100,
        attackPower: 11,
        attackCooldown: 600,
        radiusMultiplier: 1.0,
        speedMultiplier: 1.8,
        turnSpeed: 0.15,
        colorRed: ['#ff6b6b', '#e74c3c'],
        colorBlue: ['#74b9ff', '#3498db']
    },
    tank: {
        health: 200,
        attackPower: 19,
        attackCooldown: 800,
        radiusMultiplier: 1.4,
        speedMultiplier: 1.0,
        turnSpeed: 0.1,
        colorRed: ['#ff7979', '#c0392b'],
        colorBlue: ['#7ed6df', '#2980b9']
    },
    healer: {
        health: 80,
        healPower: 6,
        healCooldown: 300,
        healRange: 60,
        radiusMultiplier: 1.0,
        speedMultiplier: 1.5,
        turnSpeed: 0.12,
        colorRed: ['#f8c471', '#e67e22'],
        colorBlue: ['#81ecec', '#00cec9']
    },
    musketeer: {
        health: 60,
        attackPower: 25,
        attackCooldown: 1200,
        radiusMultiplier: 0.9,
        speedMultiplier: 1.6,
        turnSpeed: 0.13,
        missChance: 0.35,
        shootingRange: 150,
        bayonetRange: 60,
        colorRed: ['#ff9f80', '#d35400'],
        colorBlue: ['#80bfff', '#1a5276']
    },
    cavalry: {
        health: 120,
        attackPower: 16,
        attackCooldown: 500,
        radiusMultiplier: 1.1,
        speedMultiplier: 2.8,
        baseSpeedMultiplier: 1.2,
        turnSpeed: 0.08,
        chargeCooldown: 25000,
        chargeDuration: 2000,
        minChargeDistance: 50,
        colorRed: ['#e74c3c', '#c0392b'],
        colorBlue: ['#3498db', '#1a5276']
    },
    general: {
        health: 210,
        attackPower: 22,
        attackCooldown: 1000,
        radiusMultiplier: 1.2,
        speedMultiplier: 1.5,
        turnSpeed: 0.12,
        abilityCooldown: 45000, // 45 seconds
        commandRange: 150,
        auraRange: 100,
        auraDamageBoost: 1.1, // +10% damage for nearby allies
        colorRed: ['#f39c12', '#d35400'],
        colorBlue: ['#3498db', '#1a5276'],
        formations: ['square', 'circle', 'line', 'wedge', 'phalanx']
    }
};

// ============================================
// AUDIO SYSTEM (Built-in, no MP3 files needed)
// ============================================

class GameAudio {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        this.audioContext = null;
        this.masterGain = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
        } catch (e) {
            console.log("Audio not supported, continuing without sound");
            this.enabled = false;
        }
    }

    // Soldier slash sound
    playSlash(isCritical = false) {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isCritical ? 200 : 150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(isCritical ? 0.4 : 0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Tank explosion
    playExplosion() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Musketeer gunshot
    playGunshot() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Healer sound
    playHeal() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Cavalry charge
    playCharge() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Death sound
    playDeath() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // UI placement sound
    playPlace() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // UI delete sound
    playDelete() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Victory sound
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        // Play a chord
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.0);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 1.0);
        });
    }

    // Button click
    playButton() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // General's voice command
    playGeneralVoice(formationType) {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Trumpet fanfare
        const trumpetOsc = this.audioContext.createOscillator();
        const trumpetGain = this.audioContext.createGain();
        
        trumpetOsc.connect(trumpetGain);
        trumpetGain.connect(this.masterGain);
        
        trumpetOsc.type = 'square';
        // Play a heroic fanfare: C-E-G
        trumpetOsc.frequency.setValueAtTime(523.25, now); // C5
        trumpetOsc.frequency.setValueAtTime(659.25, now + 0.3); // E5
        trumpetOsc.frequency.setValueAtTime(783.99, now + 0.6); // G5
        
        trumpetGain.gain.setValueAtTime(0, now);
        trumpetGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        trumpetGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        trumpetOsc.start(now);
        trumpetOsc.stop(now + 1.0);
        
        // Deep command voice (simulated with low frequency)
        const voiceOsc = this.audioContext.createOscillator();
        const voiceGain = this.audioContext.createGain();
        
        voiceOsc.connect(voiceGain);
        voiceGain.connect(this.masterGain);
        
        voiceOsc.type = 'sine';
        voiceOsc.frequency.setValueAtTime(120, now + 0.2);
        voiceOsc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        
        voiceGain.gain.setValueAtTime(0, now + 0.2);
        voiceGain.gain.linearRampToValueAtTime(0.15, now + 0.25);
        voiceGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        voiceOsc.start(now + 0.2);
        voiceOsc.stop(now + 1.0);
    }

    // General's death sound
    playGeneralDeath() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Sad horn sound
        const hornOsc = this.audioContext.createOscillator();
        const hornGain = this.audioContext.createGain();
        
        hornOsc.connect(hornGain);
        hornGain.connect(this.masterGain);
        
        hornOsc.type = 'sawtooth';
        hornOsc.frequency.setValueAtTime(220, now);
        hornOsc.frequency.exponentialRampToValueAtTime(110, now + 1.0);
        
        hornGain.gain.setValueAtTime(0, now);
        hornGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        hornOsc.start(now);
        hornOsc.stop(now + 1.5);
    }

    unlock() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// ============================================
// MAIN GAME CODE WITH GENERAL UNIT
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

function initGame() {
    // Canvas setup
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const notification = document.getElementById("notification");
    const gameOverModal = document.getElementById("gameOverModal");
    const winnerTextEl = document.getElementById("winnerText");
    const playAgainHeaderBtn = document.getElementById("playAgainHeaderBtn");
    const startPauseBtn = document.getElementById("startPauseBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");

    // Statistics elements
    const redCountEl = document.getElementById("redCount");
    const blueCountEl = document.getElementById("blueCount");
    const totalCountEl = document.getElementById("totalCount");
    const battleTimeEl = document.getElementById("battleTime");
    const gameStatusEl = document.getElementById("gameStatus");
    const finalTimeEl = document.getElementById("finalTime");
    const remainingUnitsEl = document.getElementById("remainingUnits");
    const totalKillsEl = document.getElementById("totalKills");
    const highestDamageEl = document.getElementById("highestDamage");

    // General status displays
    const redGeneralStatus = document.getElementById("redGeneralStatus");
    const blueGeneralStatus = document.getElementById("blueGeneralStatus");
    const redGeneralCooldown = document.getElementById("redGeneralCooldown");
    const blueGeneralCooldown = document.getElementById("blueGeneralCooldown");

    // Game variables
    let placingMode = "soldier";
    let gameRunning = false;
    let circles = [];
    let mouseX = 0, mouseY = 0, showGhost = true;
    let attackEffects = [];
    let musketEffects = [];
    let healingEffects = [];
    let damageTexts = [];
    let bloodSplatters = [];
    let gameSpeed = 1.0;
    let baseUnitSize = 20;
    let battleStartTime = 0;
    let battleDuration = 0;
    let originalCircles = [];
    let totalKills = 0;
    let highestSingleDamage = 0;
    let formationEffects = [];

    // Mobile detection and performance
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let lastFrameTime = 0;
    const MOBILE_FPS_LIMIT = isMobile ? 30 : 60;
    const MAX_UNITS_MOBILE = isMobile ? 30 : 100;
    let currentDpr = 1;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Audio system
    const audio = new GameAudio();
    
    // Unlock audio on first interaction
    document.addEventListener('click', () => audio.unlock(), { once: true });
    document.addEventListener('touchstart', () => audio.unlock(), { once: true });

    const mapPadding = 20;

    // Initialize canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set CSS size
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        // Set actual canvas size
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        canvasWidth = rect.width;
        canvasHeight = rect.height;
    }

    // Initial resize and event listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', function() {
        setTimeout(resizeCanvas, 100);
    });

    // Update active button styling
    function updateActiveButton() {
        document.querySelectorAll('.unit-controls button, .game-controls button').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('active-red');
            
            if (btn.dataset.type === placingMode) {
                btn.classList.add('active');
                btn.classList.add('active-red');
            }
            
            if (placingMode === "delete" && btn.id === "deleteTool") {
                btn.classList.add('active');
                btn.classList.add('active-red');
            }
        });
        
        // Update sidebar unit info to match selected unit
        const unitTabs = document.querySelectorAll('.unit-tab');
        unitTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.unit === placingMode) {
                tab.classList.add('active');
            }
        });
        
        const unitDetails = document.querySelectorAll('.unit-detail');
        unitDetails.forEach(detail => {
            detail.classList.remove('active');
            if (detail.dataset.unit === placingMode) {
                detail.classList.add('active');
            }
        });
    }

    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') notification.classList.add('error');
        else if (type === 'warning') notification.classList.add('warning');
        else if (type === 'info') notification.classList.add('info');
        
        notification.classList.add('show');
        
        setTimeout(() => notification.classList.remove('show'), isMobile ? 3000 : 2000);
    }

    function drawMap() {
        // Clear with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Red team gradient
        const redGradient = ctx.createLinearGradient(0, 0, canvasWidth / 2, 0);
        redGradient.addColorStop(0, 'rgba(231, 76, 60, 0.1)');
        redGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');
        ctx.fillStyle = redGradient;
        ctx.fillRect(0, 0, canvasWidth / 2, canvasHeight);
        
        // Blue team gradient
        const blueGradient = ctx.createLinearGradient(canvasWidth, 0, canvasWidth / 2, 0);
        blueGradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
        blueGradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)');
        ctx.fillStyle = blueGradient;
        ctx.fillRect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
        
        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Team labels
        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctx.font = `bold ${isMobile ? '14px' : '18px'} "Segoe UI", system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔴 RED', canvasWidth / 4, 25);
        
        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.fillText('🔵 BLUE', canvasWidth * 3 / 4, 25);
        
        // Battlefield border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.rect(mapPadding, mapPadding, canvasWidth - mapPadding * 2, canvasHeight - mapPadding * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawGhost() {
        if (!showGhost || placingMode === "delete") return;
        
        const settings = UNIT_SETTINGS[placingMode];
        let radius = baseUnitSize * settings.radiusMultiplier;
        let team = mouseX < canvasWidth / 2 ? "red" : "blue";
        let type = placingMode;
        
        let color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)";
            
        const withinBounds = mouseX > mapPadding + radius && 
                            mouseX < canvasWidth - mapPadding - radius && 
                            mouseY > mapPadding + radius && 
                            mouseY < canvasHeight - mapPadding - radius;
        let blocked = circles.some(c => Math.hypot(c.x - mouseX, c.y - mouseY) < (c.radius + radius) * 0.8);
        
        if (blocked || !withinBounds) color = "rgba(231, 76, 60, 0.8)";
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        const isBlueTeam = team === "blue";
        
        if (type === "healer") {
            ctx.beginPath();
            ctx.moveTo(mouseX - radius/2, mouseY);
            ctx.lineTo(mouseX + radius/2, mouseY);
            ctx.moveTo(mouseX, mouseY - radius/2);
            ctx.lineTo(mouseX, mouseY + radius/2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (type === "musketeer") {
            ctx.save();
            ctx.translate(mouseX, mouseY);
            if (isBlueTeam) {
                ctx.rotate(Math.PI);
            }
            ctx.beginPath();
            if (isBlueTeam) {
                ctx.moveTo(radius * 0.6, 0);
                ctx.lineTo(-radius * 0.8, 0);
            } else {
                ctx.moveTo(-radius * 0.6, 0);
                ctx.lineTo(radius * 0.8, 0);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 3;
            ctx.stroke();
            let barrelX = isBlueTeam ? -radius * 0.8 : radius * 0.8;
            ctx.beginPath();
            ctx.arc(barrelX, 0, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();
            ctx.restore();
        } else if (type === "cavalry") {
            ctx.save();
            ctx.translate(mouseX, mouseY);
            if (isBlueTeam) {
                ctx.rotate(Math.PI);
            }
            let headX = isBlueTeam ? -radius * 0.8 : radius * 0.8;
            ctx.beginPath();
            ctx.arc(headX, 0, radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();
            ctx.restore();
        } else if (type === "general") {
            // Draw General crown for ghost
            ctx.save();
            ctx.translate(mouseX, mouseY);
            
            // Draw crown
            ctx.beginPath();
            ctx.moveTo(-radius * 0.8, -radius * 0.5);
            ctx.lineTo(0, -radius * 1.2);
            ctx.lineTo(radius * 0.8, -radius * 0.5);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
            ctx.fill();
            
            ctx.restore();
        }
    }

    function getDirectionalDamageMultiplier(attacker, target) {
        const dx = target.x - attacker.x;
        const dy = target.y - attacker.y;
        const attackAngle = Math.atan2(dy, dx);
        const targetAngle = Math.atan2(target.velY, target.velX);
        
        let angleDiff = attackAngle - targetAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        const absAngleDiff = Math.abs(angleDiff);
        let multiplier = 1.0;
        
        if (absAngleDiff < Math.PI / 6) multiplier = 1.0;
        else if (absAngleDiff > (5 * Math.PI) / 6) multiplier = 2.0;
        else multiplier = 1.25;
        
        // Add morale boost if near General
        if (attacker.moraleBoosted) {
            multiplier *= UNIT_SETTINGS.general.auraDamageBoost;
        }
        
        // Formation defense bonus
        if (target.inFormation && target.formationBonus && 
            performance.now() < target.formationBonus.time) {
            multiplier /= target.formationBonus.defense;
        }
        
        // Demoralized penalty
        if (target.demoralized && target.demoralizedUntil && 
            performance.now() < target.demoralizedUntil) {
            multiplier *= 1.2; // Take 20% more damage when demoralized
        }
        
        return multiplier;
    }

    class DamageText {
        constructor(x, y, damage, isHeal = false, isCritical = false, isMiss = false) {
            this.x = x; this.y = y; this.damage = damage; this.isHeal = isHeal; this.isCritical = isCritical; this.isMiss = isMiss;
            this.life = 1.0; this.velocityY = -1;
        }
        update() { this.y += this.velocityY; this.life -= 0.02; return this.life > 0; }
        draw() {
            ctx.font = this.isCritical ? 'bold 16px Arial' : 'bold 13px Arial';
            let color;
            if (this.isMiss) { color = `rgba(155, 155, 155, ${this.life})`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText("MISS", this.x, this.y); }
            else if (this.isHeal) { color = `rgba(46, 204, 113, ${this.life})`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText('+' + this.damage, this.x, this.y); }
            else if (this.isCritical) { color = `rgba(231, 76, 60, ${this.life})`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText('-' + this.damage, this.x, this.y); }
            else { color = `rgba(245, 125, 128, ${this.life})`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText('-' + this.damage, this.x, this.y); }
        }
    }

    class BloodSplatter {
        constructor(x, y, size = 1.0) {
            this.x = x;
            this.y = y;
            this.particles = [];
            this.createParticles(size);
        }
        
        createParticles(size) {
            const count = isMobile ? (2 + Math.floor(size * 3)) : (3 + Math.floor(size * 5));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    size: 1 + Math.random() * 3 * size,
                    speedX: (Math.random() - 0.5) * 6 * size,
                    speedY: (Math.random() - 0.5) * 6 * size,
                    color: `rgba(231, 76, 60, ${0.5 + Math.random() * 0.3})`,
                    life: 1.0
                });
            }
        }
        
        update() {
            this.particles = this.particles.filter(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedX *= 0.9;
                p.speedY *= 0.9;
                p.life -= 0.03;
                return p.life > 0;
            });
            return this.particles.length > 0;
        }
        
        draw() {
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba');
                ctx.fill();
            });
        }
    }

    class MusketEffect {
        constructor(startX, startY, targetX, targetY, hit = true) {
            this.startX = startX; this.startY = startY; this.targetX = targetX; this.targetY = targetY; this.hit = hit;
            this.progress = 0; this.speed = 0.12; this.life = 1.0; this.color = hit ? '#f39c12' : '#95a5a6';
        }
        update() { this.progress += this.speed; this.life -= 0.015; return this.progress <= 1.0 && this.life > 0; }
        draw() {
            const currentX = this.startX + (this.targetX - this.startX) * this.progress;
            const currentY = this.startY + (this.targetY - this.startY) * this.progress;
            ctx.beginPath(); ctx.arc(currentX, currentY, this.hit ? 4 : 3, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill();
            ctx.beginPath(); ctx.arc(currentX, currentY, this.hit ? 8 : 6, 0, Math.PI * 2); ctx.fillStyle = this.hit ? `rgba(243, 156, 18, ${0.3 * this.life})` : `rgba(149, 165, 166, ${0.3 * this.life})`; ctx.fill();
            if (this.progress < 0.1) { ctx.beginPath(); ctx.arc(this.startX, this.startY, 10 * (1 - this.progress * 10), 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 200, 100, ${0.7 * this.life})`; ctx.fill(); }
        }
    }

    class HealingEffect {
        constructor(startX, startY, targetX, targetY, amount) {
            this.startX = startX; this.startY = startY; this.targetX = targetX; this.targetY = targetY; this.amount = amount;
            this.progress = 0; this.speed = 0.08; this.life = 1.0; this.color = '#2ecc71'; this.healingUnitId = null;
        }
        update() { this.progress += this.speed; this.life -= 0.01; return this.progress <= 1.0 && this.life > 0; }
        draw() {
            const currentX = this.startX + (this.targetX - this.startX) * this.progress;
            const currentY = this.startY + (this.targetY - this.startY) * this.progress;
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            ctx.beginPath(); ctx.moveTo(this.startX, this.startY); ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = `rgba(46, 204, 113, ${0.7 * this.life})`; ctx.lineWidth = 4 + pulse; ctx.lineCap = 'round'; ctx.stroke();
            ctx.strokeStyle = `rgba(46, 204, 113, ${0.3 * this.life})`; ctx.lineWidth = 10; ctx.stroke();
            ctx.beginPath(); ctx.arc(currentX, currentY, 6, 0, Math.PI * 2); ctx.fillStyle = `rgba(46, 204, 113, ${this.life})`; ctx.fill();
            if (this.healingUnitId && this.progress > 0.8) {
                const healingUnit = circles.find(c => c.id === this.healingUnitId);
                if (healingUnit) { ctx.beginPath(); ctx.arc(healingUnit.x, healingUnit.y, healingUnit.radius + 3, 0, Math.PI * 2); ctx.strokeStyle = `rgba(46, 204, 113, ${0.5 * this.life})`; ctx.lineWidth = 3; ctx.stroke(); }
            }
        }
    }

    class AttackEffect {
        constructor(x, y, team, isCritical = false) {
            this.x = x; this.y = y; this.team = team; this.isCritical = isCritical;
            this.radius = isCritical ? 6 : 4; this.maxRadius = isCritical ? 20 : 15; this.duration = isCritical ? 300 : 200; this.startTime = performance.now();
        }
        draw() {
            const elapsed = performance.now() - this.startTime;
            const progress = elapsed / this.duration;
            if (progress >= 1) return false;
            const currentRadius = this.radius + (this.maxRadius - this.radius) * progress;
            const alpha = 1 - progress;
            ctx.beginPath(); ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            if (this.isCritical) { ctx.fillStyle = this.team === 'red' ? `rgba(231, 76, 60, ${alpha})` : `rgba(52, 152, 219, ${alpha})`; }
            else { ctx.fillStyle = this.team === 'red' ? `rgba(192, 57, 43, ${alpha})` : `rgba(41, 128, 185, ${alpha})`; }
            ctx.fill(); return true;
        }
    }

    class FormationEffect {
        constructor(x, y, formationType, team) {
            this.x = x;
            this.y = y;
            this.type = formationType;
            this.team = team;
            this.life = 1.0;
            this.symbols = {
                'square': '■',
                'circle': '●',
                'line': '─',
                'wedge': '▶',
                'phalanx': '🛡️'
            };
        }
        
        update() {
            this.life -= 0.01;
            return this.life > 0;
        }
        
        draw() {
            const alpha = this.life;
            const size = 30 + (1 - this.life) * 50;
            const yOffset = -20 - (1 - this.life) * 40;
            
            ctx.save();
            ctx.translate(this.x, this.y + yOffset);
            
            // Draw symbol
            ctx.font = `bold ${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this.team === 'red' ? 
                `rgba(231, 76, 60, ${alpha})` : 
                `rgba(52, 152, 219, ${alpha})`;
            ctx.fillText(this.symbols[this.type] || '■', 0, 0);
            
            // Draw glow
            ctx.font = `bold ${size * 1.5}px Arial`;
            ctx.fillStyle = this.team === 'red' ? 
                `rgba(231, 76, 60, ${alpha * 0.3})` : 
                `rgba(52, 152, 219, ${alpha * 0.3})`;
            ctx.fillText(this.symbols[this.type] || '■', 0, 0);
            
            ctx.restore();
        }
    }

    class Circle {
        constructor(x, y, team, type = 'soldier') {
            this.x = x; this.y = y; this.team = team; this.type = type;
            const sizeMultiplier = Math.min(canvasWidth, canvasHeight) / 800;
            const settings = UNIT_SETTINGS[type];
            
            this.radius = baseUnitSize * settings.radiusMultiplier * sizeMultiplier;
            this.health = settings.health;
            this.maxHealth = settings.health;
            this.attackPower = settings.attackPower || 0;
            this.attackCooldown = settings.attackCooldown || 0;
            this.maxSpeed = settings.speedMultiplier * sizeMultiplier;
            this.turnSpeed = settings.turnSpeed;
            
            if (type === 'healer') {
                this.healPower = settings.healPower;
                this.healCooldown = settings.healCooldown;
                this.healRange = settings.healRange;
                this.currentHealTarget = null;
            } else if (type === 'musketeer') {
                this.shootingRange = settings.shootingRange * sizeMultiplier;
                this.bayonetRange = settings.bayonetRange * sizeMultiplier;
                this.isCharging = false;
                this.missChance = settings.missChance;
                this.lastShot = 0;
            } else if (type === 'cavalry') {
                this.baseSpeed = settings.baseSpeedMultiplier * sizeMultiplier;
                this.currentSpeed = this.baseSpeed;
                this.isCharging = false;
                this.chargeSpeed = this.maxSpeed;
                this.chargeDamageMultiplier = 1.0;
                this.chargeCooldown = settings.chargeCooldown;
                this.lastCharge = 0;
                this.chargeDuration = settings.chargeDuration;
                this.chargeStartTime = 0;
                this.chargeTarget = null;
                this.minChargeDistance = settings.minChargeDistance;
                this.currentVelocity = 0;
                this.chargeBoost = 0;
                this.hasUsedFirstCharge = false;
                this.lastCharge = performance.now() - this.chargeCooldown - 10000;
            } else if (type === 'general') {
                this.abilityCooldown = settings.abilityCooldown;
                this.commandRange = settings.commandRange * sizeMultiplier;
                this.auraRange = settings.auraRange * sizeMultiplier;
                this.auraDamageBoost = settings.auraDamageBoost;
                this.lastAbilityUse = 0;
                this.formationCommand = null;
                this.isHero = true;
                this.hasUsedAbility = false;
                this.moraleBoostActive = false;
                this.demoralized = false;
                this.demoralizedUntil = 0;
            }
            
            this.lastAttack = 0; this.lastHeal = 0; this.velX = 0; this.velY = 0;
            this.id = Math.random().toString(36).substr(2, 9); this.facingAngle = team === 'blue' ? Math.PI : 0;
            this.lastHealth = this.health; this.totalDamageDealt = 0; this.kills = 0;
            this.inFormation = false;
            this.formationBonus = null;
            this.moraleBoosted = false;
            this.targetPosition = null;
        }

        // GENERAL SPECIFIC METHODS
        analyzeBattleSituation(enemies, allies) {
            const situation = {
                enemyCount: enemies.length,
                allyCount: allies.length - 1,
                enemyCavalryCount: enemies.filter(e => e.type === 'cavalry').length,
                enemyRangedCount: enemies.filter(e => e.type === 'musketeer').length,
                enemyGeneral: enemies.find(e => e.type === 'general'),
                allyHealthRatio: allies.reduce((sum, a) => sum + (a.health / a.maxHealth), 0) / Math.max(1, allies.length),
                isSurrounded: this.checkIfSurrounded(enemies),
                enemyFormation: this.detectEnemyFormation(enemies),
                distanceToEnemyGeneral: 0
            };
            
            if (situation.enemyGeneral) {
                situation.distanceToEnemyGeneral = this.distanceTo(situation.enemyGeneral);
            }
            
            return situation;
        }
        
        checkIfSurrounded(enemies) {
            if (enemies.length < 3) return false;
            
            const closeEnemies = enemies.filter(e => this.distanceTo(e) < 150);
            if (closeEnemies.length < 3) return false;
            
            // Check if enemies are around us in multiple directions
            const angles = closeEnemies.map(e => Math.atan2(e.y - this.y, e.x - this.x));
            angles.sort((a, b) => a - b);
            
            let maxGap = 0;
            for (let i = 0; i < angles.length; i++) {
                const nextAngle = angles[(i + 1) % angles.length];
                const gap = (nextAngle - angles[i] + 2 * Math.PI) % (2 * Math.PI);
                maxGap = Math.max(maxGap, gap);
            }
            
            return maxGap < Math.PI; // If largest gap is less than 180 degrees, we're surrounded
        }
        
        detectEnemyFormation(enemies) {
            if (enemies.length < 3) return 'scattered';
            
            const positions = enemies.map(e => ({x: e.x, y: e.y}));
            const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
            const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
            
            const avgDistance = positions.reduce((sum, p) => 
                sum + Math.hypot(p.x - centerX, p.y - centerY), 0) / positions.length;
            
            if (avgDistance < 50) return 'tight';
            if (avgDistance > 150) return 'spread';
            return 'normal';
        }
        
        selectPriorityTarget(enemies) {
            // Priority: 1. Enemy General, 2. Healers, 3. High DPS, 4. Tanks
            const enemyGeneral = enemies.find(e => e.type === 'general');
            if (enemyGeneral) {
                const distance = this.distanceTo(enemyGeneral);
                if (distance < this.commandRange * 1.5) {
                    return enemyGeneral;
                }
            }
            
            const enemyHealers = enemies.filter(e => e.type === 'healer');
            if (enemyHealers.length > 0) {
                return enemyHealers.reduce((a, b) => 
                    this.distanceTo(a) < this.distanceTo(b) ? a : b);
            }
            
            const highDPS = enemies.filter(e => 
                e.type === 'musketeer' || e.type === 'cavalry');
            if (highDPS.length > 0) {
                return highDPS.reduce((a, b) => 
                    (b.attackPower / b.attackCooldown) > (a.attackPower / a.attackCooldown) ? b : a);
            }
            
            return null;
        }
        
        useFormationAbility(situation, allies) {
            let formationType = 'square'; // Default
            
            if (situation.enemyCavalryCount > 2) {
                formationType = 'square'; // Best against cavalry charges
            } else if (situation.enemyRangedCount > situation.enemyCount * 0.5) {
                formationType = 'line'; // Spread out against ranged
            } else if (situation.isSurrounded) {
                formationType = 'circle'; // Defense from all sides
            } else if (situation.allyCount > enemies.length * 1.5) {
                formationType = 'wedge'; // Attack formation when superior numbers
            } else if (situation.allyHealthRatio < 0.5) {
                formationType = 'phalanx'; // Defensive turtle
            } else if (situation.enemyFormation === 'tight') {
                formationType = 'wedge'; // Break tight formations
            } else {
                formationType = 'line'; // Standard battle line
            }
            
            // Apply formation to allies
            this.applyFormationToAllies(formationType, allies);
            
            // Play General's voice command
            audio.playGeneralVoice(formationType);
            
            // Create visual effect
            formationEffects.push(new FormationEffect(this.x, this.y, formationType, this.team));
            
            // Show notification
            const teamName = this.team === 'red' ? 'Red' : 'Blue';
            const formationNames = {
                'square': 'SQUARE',
                'circle': 'CIRCLE', 
                'line': 'BATTLE LINE',
                'wedge': 'ATTACK WEDGE',
                'phalanx': 'PHALANX'
            };
            showNotification(`${teamName} General: ${formationNames[formationType]} FORMATION!`, 'info');
            
            // Update UI cooldown display
            this.updateGeneralCooldownUI();
        }
        
        applyFormationToAllies(formationType, allies) {
            const combatAllies = allies.filter(a => a !== this && a.type !== 'healer');
            
            switch(formationType) {
                case 'square':
                    this.createSquareFormation(combatAllies);
                    break;
                case 'circle':
                    this.createCircleFormation(combatAllies);
                    break;
                case 'line':
                    this.createLineFormation(combatAllies);
                    break;
                case 'wedge':
                    this.createWedgeFormation(combatAllies);
                    break;
                case 'phalanx':
                    this.createPhalanxFormation(combatAllies);
                    break;
            }
            
            // Add formation buff to allies
            const now = performance.now();
            combatAllies.forEach(ally => {
                ally.inFormation = true;
                ally.formationBonus = {
                    defense: 1.2, // +20% defense
                    time: now + 10000 // Lasts 10 seconds
                };
                ally.targetPosition = null; // Clear any previous target
            });
        }
        
        createSquareFormation(allies) {
            const gridSize = Math.ceil(Math.sqrt(allies.length));
            const spacing = this.radius * 3;
            const startX = this.x - (gridSize * spacing) / 2;
            const startY = this.y - (gridSize * spacing) / 2;
            
            allies.forEach((ally, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                
                ally.targetPosition = {
                    x: startX + col * spacing,
                    y: startY + row * spacing
                };
                ally.formationType = 'square';
            });
        }
        
        createLineFormation(allies) {
            const lineLength = allies.length * this.radius * 2.5;
            const startX = this.x - lineLength / 2;
            const yPos = this.y;
            
            allies.forEach((ally, index) => {
                ally.targetPosition = {
                    x: startX + index * this.radius * 2.5,
                    y: yPos
                };
                ally.formationType = 'line';
                ally.faceEnemyDirection = true;
            });
        }
        
        createCircleFormation(allies) {
            const radius = Math.max(80, allies.length * 10);
            allies.forEach((ally, index) => {
                const angle = (index / allies.length) * Math.PI * 2;
                ally.targetPosition = {
                    x: this.x + Math.cos(angle) * radius,
                    y: this.y + Math.sin(angle) * radius
                };
                ally.formationType = 'circle';
            });
        }
        
        createWedgeFormation(allies) {
            const wedgeAngle = Math.PI / 4; // 45 degree wedge
            const spacing = this.radius * 2.5;
            
            // Place General at tip of wedge
            const generalIndex = Math.floor(allies.length / 2);
            
            allies.forEach((ally, index) => {
                const offset = (index - generalIndex) * spacing;
                const angle = this.facingAngle + (offset > 0 ? wedgeAngle/2 : -wedgeAngle/2);
                const distance = Math.abs(offset) * 0.5;
                
                ally.targetPosition = {
                    x: this.x + Math.cos(angle) * distance,
                    y: this.y + Math.sin(angle) * distance
                };
                ally.formationType = 'wedge';
                ally.faceEnemyDirection = true;
            });
        }
        
        createPhalanxFormation(allies) {
            // Tight packed formation (2 rows)
            const rows = 2;
            const cols = Math.ceil(allies.length / rows);
            const spacing = this.radius * 2;
            
            allies.forEach((ally, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                ally.targetPosition = {
                    x: this.x + (col - cols/2) * spacing,
                    y: this.y + (row - rows/2) * spacing
                };
                ally.formationType = 'phalanx';
            });
        }
        
        moveToTargetPosition() {
            if (!this.targetPosition) return;
            
            const dx = this.targetPosition.x - this.x;
            const dy = this.targetPosition.y - this.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < 5) {
                this.targetPosition = null;
                return;
            }
            
            const speed = Math.min(this.maxSpeed * 0.7, distance * 0.1);
            this.velX += (dx / distance * speed - this.velX) * this.turnSpeed;
            this.velY += (dy / distance * speed - this.velY) * this.turnSpeed;
            this.x += this.velX;
            this.y += this.velY;
        }
        
        updateGeneralCooldownUI() {
            const statusElement = this.team === 'red' ? 
                redGeneralCooldown : blueGeneralCooldown;
            const statusDisplay = this.team === 'red' ? 
                redGeneralStatus : blueGeneralStatus;
                
            if (statusElement && statusDisplay) {
                statusDisplay.style.display = 'block';
                let secondsLeft = Math.ceil(this.abilityCooldown / 1000);
                
                const updateCooldown = () => {
                    if (secondsLeft <= 0) {
                        statusElement.textContent = 'READY!';
                        statusElement.style.color = '#2ecc71';
                        statusElement.style.fontWeight = 'bold';
                        this.hasUsedAbility = false;
                    } else {
                        statusElement.textContent = `${secondsLeft}s`;
                        statusElement.style.color = secondsLeft > 10 ? '#f39c12' : '#e74c3c';
                        statusElement.style.fontWeight = '600';
                        secondsLeft--;
                        setTimeout(updateCooldown, 1000);
                    }
                };
                
                updateCooldown();
            }
        }
        
        moveToTarget(target, enemies) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > this.radius + target.radius + 5) {
                const desiredX = dx / dist;
                const desiredY = dy / dist;
                this.velX += (desiredX * this.maxSpeed - this.velX) * this.turnSpeed;
                this.velY += (desiredY * this.maxSpeed - this.velY) * this.turnSpeed;
                this.x += this.velX;
                this.y += this.velY;
            } else {
                this.velX *= 0.8;
                this.velY *= 0.8;
            }
        }
        
        attackTarget(target, now) {
            const dist = this.distanceTo(target);
            if (dist <= this.radius + target.radius + 5) {
                if (now - this.lastAttack >= this.attackCooldown) {
                    const damageMultiplier = getDirectionalDamageMultiplier(this, target);
                    const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                    const isCritical = damageMultiplier > 1.5;
                    target.health -= actualDamage;
                    this.lastAttack = now;
                    this.totalDamageDealt += actualDamage;
                    
                    if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                    
                    // Play attack sound
                    audio.playSlash(isCritical);
                    
                    damageTexts.push(new DamageText(
                        target.x, 
                        target.y - target.radius - 8, 
                        actualDamage, 
                        false, 
                        isCritical
                    ));
                    
                    attackEffects.push(new AttackEffect(
                        target.x + (Math.random() - 0.5) * 8,
                        target.y + (Math.random() - 0.5) * 8,
                        this.team,
                        isCritical
                    ));
                }
            }
        }
        
        updateGeneralAI(enemies, allies) {
            if (!gameRunning) return;
            
            const now = performance.now();
            const canUseAbility = now - this.lastAbilityUse >= this.abilityCooldown;
            
            // Update demoralized status
            if (this.demoralized && now > this.demoralizedUntil) {
                this.demoralized = false;
            }
            
            // Aura effect - boost nearby allies
            this.moraleBoostActive = false;
            allies.forEach(ally => {
                if (ally !== this && this.distanceTo(ally) < this.auraRange) {
                    ally.moraleBoosted = true;
                    this.moraleBoostActive = true;
                } else if (ally.moraleBoosted) {
                    ally.moraleBoosted = false;
                }
            });
            
            // Smart ability usage decision
            if (canUseAbility && !this.hasUsedAbility && enemies.length > 0) {
                const situation = this.analyzeBattleSituation(enemies, allies);
                
                // Only use ability in meaningful situations
                const shouldUseAbility = 
                    situation.enemyCount >= 3 || 
                    situation.enemyGeneral !== null ||
                    situation.isSurrounded ||
                    situation.allyHealthRatio < 0.7;
                
                if (shouldUseAbility) {
                    this.useFormationAbility(situation, allies);
                    this.lastAbilityUse = now;
                    this.hasUsedAbility = true;
                }
            }
            
            // Move to formation position if set
            if (this.targetPosition) {
                this.moveToTargetPosition();
            } else {
                // Basic combat AI
                if (enemies.length === 0) return;
                
                let target = this.selectPriorityTarget(enemies);
                if (!target) target = enemies.reduce((a, b) => 
                    this.distanceTo(a) < this.distanceTo(b) ? a : b);
                
                this.moveToTarget(target, enemies);
                this.attackTarget(target, now);
            }
        }

        updateAI(enemies, allies) {
            // GENERAL SPECIFIC AI
            if (this.type === 'general') {
                this.updateGeneralAI(enemies, allies);
                return;
            }
            
            if (!gameRunning) return;
            
            // Update demoralized status
            const now = performance.now();
            if (this.demoralized && now > this.demoralizedUntil) {
                this.demoralized = false;
            }
            
            // Update formation status
            if (this.inFormation && this.formationBonus && now > this.formationBonus.time) {
                this.inFormation = false;
                this.formationBonus = null;
                this.targetPosition = null;
            }
            
            // Move to formation position if set
            if (this.targetPosition && this.inFormation) {
                this.moveToTargetPosition();
                this.applySeparation([...enemies, ...allies]);
                return;
            }
            
            this.applySeparation([...enemies, ...allies]);

            // CAVALRY AI
            if (this.type === 'cavalry') {
                if (enemies.length === 0) return;
                let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
                let distToEnemy = this.distanceTo(closestEnemy);
                let now = performance.now();
                const speed = Math.hypot(this.velX, this.velY); this.currentVelocity = speed;
                const canCharge = (now - this.lastCharge >= this.chargeCooldown) && (distToEnemy >= this.minChargeDistance);
                
                if (canCharge && !this.isCharging) {
                    this.isCharging = true; this.chargeStartTime = now; this.chargeTarget = closestEnemy; this.lastCharge = now;
                    this.chargeBoost = 1.0;
                }
                
                if (this.isCharging) {
                    const chargeElapsed = now - this.chargeStartTime;
                    if (chargeElapsed >= this.chargeDuration || closestEnemy.health <= 0) {
                        this.isCharging = false; this.chargeBoost = 0; this.chargeTarget = null;
                        if (!this.hasUsedFirstCharge) this.hasUsedFirstCharge = true;
                    } else {
                        const chargeProgress = chargeElapsed / this.chargeDuration;
                        this.chargeBoost = 1.0 + (chargeProgress * 1.8);
                        let dx = this.chargeTarget.x - this.x, dy = this.chargeTarget.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            const desiredX = dx / dist; const desiredY = dy / dist;
                            this.velX = desiredX * this.baseSpeed * this.chargeBoost; this.velY = desiredY * this.baseSpeed * this.chargeBoost;
                            this.x += this.velX; this.y += this.velY;
                        }
                        let touchDistance = this.radius + closestEnemy.radius + 5;
                        if (distToEnemy <= touchDistance) {
                            let speedDamageMultiplier = 1.0;
                            const chargeSpeed = this.currentVelocity * this.chargeBoost;
                            if (chargeSpeed >= 17 && chargeSpeed <= 18) speedDamageMultiplier = 1.45;
                            else if (chargeSpeed >= 13 && chargeSpeed <= 16) speedDamageMultiplier = 1.15;
                            if (now - this.lastAttack >= this.attackCooldown * 0.3) {
                                const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy) * speedDamageMultiplier;
                                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                                const isCritical = damageMultiplier > 1.5 || speedDamageMultiplier > 1.3;
                                const finalDamage = !this.hasUsedFirstCharge ? Math.floor(actualDamage * 1.5) : actualDamage;
                                closestEnemy.health -= finalDamage; this.lastAttack = now; this.totalDamageDealt += finalDamage;
                                if (finalDamage > highestSingleDamage) highestSingleDamage = finalDamage;
                                
                                audio.playCharge();
                                
                                damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, finalDamage, false, isCritical || !this.hasUsedFirstCharge));
                                attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, true));
                                if (!this.hasUsedFirstCharge) this.hasUsedFirstCharge = true;
                                this.isCharging = false; this.chargeBoost = 0; this.chargeTarget = null;
                            }
                        }
                    }
                    return;
                }
                
                let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                let dist = Math.hypot(dx, dy);
                let desiredX = dx / dist, desiredY = dy / dist;
                let touchDistance = this.radius + closestEnemy.radius + 1;
                if (dist > touchDistance) {
                    let speed = this.baseSpeed;
                    this.velX += (desiredX * speed - this.velX) * this.turnSpeed;
                    this.velY += (desiredY * speed - this.velY) * this.turnSpeed;
                    this.x += this.velX; this.y += this.velY;
                } else { this.velX *= 0.7; this.velY *= 0.7; }
                if (dist <= touchDistance) {
                    let now = performance.now();
                    if (now - this.lastAttack >= this.attackCooldown) {
                        const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                        const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                        const isCritical = damageMultiplier > 1.5;
                        closestEnemy.health -= actualDamage; this.lastAttack = now; this.totalDamageDealt += actualDamage;
                        if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                        
                        audio.playCharge();
                        
                        damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                        attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                    }
                }
                return;
            }

            // MUSKETEER AI
            if (this.type === 'musketeer') {
                if (enemies.length === 0) return;
                let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
                let distToEnemy = this.distanceTo(closestEnemy);
                if (distToEnemy < this.bayonetRange) {
                    this.isCharging = true;
                    let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > 0) {
                        const desiredX = dx / dist; const desiredY = dy / dist;
                        const chargeSpeed = this.maxSpeed * 1.1;
                        this.velX += (desiredX * chargeSpeed - this.velX) * this.turnSpeed;
                        this.velY += (desiredY * chargeSpeed - this.velY) * this.turnSpeed;
                        this.x += this.velX; this.y += this.velY;
                    }
                    let touchDistance = this.radius + closestEnemy.radius + 1;
                    if (distToEnemy <= touchDistance) {
                        let now = performance.now();
                        if (now - this.lastAttack >= this.attackCooldown * 0.5) {
                            const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                            const actualDamage = Math.floor(this.attackPower * 0.7 * damageMultiplier);
                            const isCritical = damageMultiplier > 1.5;
                            closestEnemy.health -= actualDamage; this.lastAttack = now; this.totalDamageDealt += actualDamage;
                            if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                            
                            audio.playSlash(isCritical);
                            
                            damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                            attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                        }
                    }
                } else {
                    if (this.isCharging) { this.isCharging = false; this.lastShot = performance.now(); }
                    this.velX *= 0.9; this.velY *= 0.9;
                    let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                    this.facingAngle = Math.atan2(dy, dx);
                    if (distToEnemy <= this.shootingRange) {
                        let now = performance.now();
                        if (now - this.lastShot >= this.attackCooldown) {
                            const miss = Math.random() < this.missChance;
                            if (!miss) {
                                const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                                const isCritical = damageMultiplier > 1.5;
                                closestEnemy.health -= actualDamage; this.totalDamageDealt += actualDamage; this.lastShot = now;
                                if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                                
                                audio.playGunshot();
                                
                                damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, actualDamage, false, isCritical));
                                attackEffects.push(new AttackEffect(closestEnemy.x + (Math.random() - 0.5) * 8, closestEnemy.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                            } else { 
                                damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 8, 0, false, false, true)); 
                            }
                            musketEffects.push(new MusketEffect(this.x, this.y, closestEnemy.x, closestEnemy.y, !miss));
                            this.lastShot = now;
                        }
                    } else {
                        if (distToEnemy > 0) {
                            const desiredX = dx / distToEnemy; const desiredY = dy / distToEnemy;
                            this.velX += (desiredX * this.maxSpeed * 0.7 - this.velX) * this.turnSpeed;
                            this.velY += (desiredY * this.maxSpeed * 0.7 - this.velY) * this.turnSpeed;
                            this.x += this.velX; this.y += this.velY;
                        }
                    }
                }
                return;
            }

            // HEALER AI
            if (this.type === 'healer') {
                let healingCandidates = [];
                
                for (let ally of allies) {
                    if (ally === this || ally.health <= 0) continue;
                    
                    let priority = 0;
                    const healthPercent = ally.health / ally.maxHealth;
                    
                    priority += (1 - healthPercent) * 100;
                    
                    if (ally.type !== 'healer') {
                        priority += 50;
                        
                        if (ally.type === 'tank') priority += 30;
                        if (ally.type === 'cavalry') priority += 20;
                        if (ally.type === 'general') priority += 100; // Prioritize General!
                        
                        const closeEnemies = enemies.filter(e => this.distanceTo(e) < 100);
                        if (closeEnemies.length > 0) {
                            priority += 40;
                        }
                    } else {
                        priority -= 80;
                    }
                    
                    const distance = this.distanceTo(ally);
                    priority -= distance * 0.5;
                    
                    if (healthPercent < 0.9) {
                        healingCandidates.push({
                            ally: ally,
                            priority: priority,
                            healthPercent: healthPercent,
                            distance: distance
                        });
                    }
                }
                
                healingCandidates.sort((a, b) => b.priority - a.priority);
                
                if (healingCandidates.length > 0) {
                    let target = healingCandidates[0].ally;
                    let distToTarget = this.distanceTo(target);
                    
                    if (distToTarget > this.healRange + 5) {
                        let dx = target.x - this.x, dy = target.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            const desiredX = dx / dist; const desiredY = dy / dist;
                            const moveSpeed = Math.min(this.maxSpeed, distToTarget - this.healRange) * 0.7;
                            this.velX += (desiredX * moveSpeed - this.velX) * this.turnSpeed;
                            this.velY += (desiredY * moveSpeed - this.velY) * this.turnSpeed;
                            this.x += this.velX; this.y += this.velY;
                        }
                    } else {
                        this.velX *= 0.8; this.velY *= 0.8;
                        let now = performance.now();
                        if (now - this.lastHeal >= this.healCooldown) {
                            const healAmount = Math.min(this.healPower, target.maxHealth - target.health);
                            if (healAmount > 0) {
                                target.health += healAmount; this.lastHeal = now;
                                
                                audio.playHeal();
                                
                                const healEffect = new HealingEffect(this.x, this.y, target.x, target.y, healAmount);
                                healEffect.healingUnitId = target.id; healingEffects.push(healEffect);
                                damageTexts.push(new DamageText(target.x, target.y - target.radius - 10, healAmount, true));
                            }
                        }
                    }
                } else {
                    if (allies.length > 1) {
                        let combatAllies = allies.filter(a => a !== this && a.type !== 'healer');
                        if (combatAllies.length > 0) {
                            let avgX = 0, avgY = 0;
                            combatAllies.forEach(ally => { avgX += ally.x; avgY += ally.y; });
                            avgX /= combatAllies.length; avgY /= combatAllies.length;
                            
                            let dx = avgX - this.x, dy = avgY - this.y;
                            let dist = Math.hypot(dx, dy);
                            if (dist > this.healRange * 0.7) {
                                const desiredX = dx / dist; const desiredY = dy / dist;
                                this.velX += (desiredX * this.maxSpeed * 0.4 - this.velX) * this.turnSpeed;
                                this.velY += (desiredY * this.maxSpeed * 0.4 - this.velY) * this.turnSpeed;
                            }
                            this.x += this.velX; this.y += this.velY;
                        }
                    }
                }
                return;
            }

            // DEFAULT COMBAT AI for soldiers and tanks
            if (enemies.length === 0) return;
            let target = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
            let dx = target.x - this.x, dy = target.y - this.y;
            let dist = Math.hypot(dx, dy);
            let desiredX = dx / dist, desiredY = dy / dist;
            let touchDistance = this.radius + target.radius + 1;
            
            if (dist > touchDistance) {
                let speed = this.maxSpeed;
                this.velX += (desiredX * speed - this.velX) * this.turnSpeed;
                this.velY += (desiredY * speed - this.velY) * this.turnSpeed;
                this.x += this.velX; this.y += this.velY;
            } else { this.velX *= 0.7; this.velY *= 0.7; }

            if (dist <= touchDistance) {
                let now = performance.now();
                if (now - this.lastAttack >= this.attackCooldown) {
                    const damageMultiplier = getDirectionalDamageMultiplier(this, target);
                    const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                    const isCritical = damageMultiplier > 1.5;
                    target.health -= actualDamage; this.lastAttack = now; this.totalDamageDealt += actualDamage;
                    if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                    
                    if (this.type === 'soldier') {
                        audio.playSlash(isCritical);
                    } else if (this.type === 'tank') {
                        audio.playExplosion();
                    }
                    
                    damageTexts.push(new DamageText(target.x, target.y - target.radius - 8, actualDamage, false, isCritical));
                    attackEffects.push(new AttackEffect(target.x + (Math.random() - 0.5) * 8, target.y + (Math.random() - 0.5) * 8, this.team, isCritical));
                }
            }
        }

        distanceTo(other) { return Math.hypot(this.x - other.x, this.y - other.y); }

        applySeparation(alliesAndEnemies) {
            let pushX = 0, pushY = 0;
            for (let other of alliesAndEnemies) {
                if (other === this) continue;
                let dx = this.x - other.x, dy = this.y - other.y;
                let dist = Math.hypot(dx, dy);
                let minDist = this.radius + other.radius + 2;
                if (dist < minDist && dist > 0) {
                    let force = (minDist - dist) / minDist;
                    pushX += dx / dist * force * 1.5;
                    pushY += dy / dist * force * 1.5;
                }
            }
            this.x += pushX; this.y += pushY;
            this.x = Math.max(mapPadding + this.radius, Math.min(canvasWidth - mapPadding - this.radius, this.x));
            this.y = Math.max(mapPadding + this.radius, Math.min(canvasHeight - mapPadding - this.radius, this.y));
        }

        draw() {
            if (Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1) this.facingAngle = Math.atan2(this.velY, this.velX);
            const gradient = ctx.createRadialGradient(this.x - 3, this.y - 3, 3, this.x, this.y, this.radius);
            
            const settings = UNIT_SETTINGS[this.type];
            const colors = this.team === 'red' ? settings.colorRed : settings.colorBlue;
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
            
            // GENERAL SPECIFIC DRAWING
            if (this.type === 'general') {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                // Draw crown
                ctx.beginPath();
                ctx.moveTo(-this.radius * 0.8, -this.radius * 0.5);
                ctx.lineTo(0, -this.radius * 1.2);
                ctx.lineTo(this.radius * 0.8, -this.radius * 0.5);
                ctx.closePath();
                
                // Crown gradient
                const crownGradient = ctx.createLinearGradient(0, -this.radius * 1.2, 0, -this.radius * 0.5);
                crownGradient.addColorStop(0, '#FFD700');
                crownGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = crownGradient;
                ctx.fill();
                
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Crown jewels
                ctx.fillStyle = '#FF69B4';
                ctx.beginPath();
                ctx.arc(0, -this.radius * 0.9, this.radius * 0.15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#00BFFF';
                ctx.beginPath();
                ctx.arc(-this.radius * 0.4, -this.radius * 0.7, this.radius * 0.12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#32CD32';
                ctx.beginPath();
                ctx.arc(this.radius * 0.4, -this.radius * 0.7, this.radius * 0.12, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw ability ready indicator
                const now = performance.now();
                if (now - this.lastAbilityUse >= this.abilityCooldown) {
                    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.7})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                
                ctx.restore();
                
                // Draw aura effect if active
                if (this.moraleBoostActive) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.auraRange, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(46, 204, 113, 0.2)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Draw +10% icon
                    ctx.fillStyle = '#2ecc71';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('+10%', this.x, this.y + this.radius + 20);
                }
                
                // Draw command range
                if (gameRunning && this.hasUsedAbility) {
                    const progress = Math.min(1, (now - this.lastAbilityUse) / this.abilityCooldown);
                    if (progress < 0.1) {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.commandRange, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(155, 89, 182, ${0.5 * (1 - progress * 10)})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            } else if (this.type === 'healer') {
                ctx.beginPath();
                ctx.moveTo(this.x - this.radius/2, this.y);
                ctx.lineTo(this.x + this.radius/2, this.y);
                ctx.moveTo(this.x, this.y - this.radius/2);
                ctx.lineTo(this.x, this.y + this.radius/2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (this.type === 'musketeer') {
                ctx.save(); 
                ctx.translate(this.x, this.y); 
                if (this.team === 'blue') {
                    ctx.rotate(this.facingAngle + Math.PI);
                } else {
                    ctx.rotate(this.facingAngle);
                }
                
                let musketStart = this.team === 'blue' ? this.radius : -this.radius;
                let musketEnd = this.team === 'blue' ? -this.radius : this.radius;
                let barrelPos = this.team === 'blue' ? -this.radius : this.radius;
                
                ctx.beginPath(); 
                ctx.moveTo(musketStart, 0); 
                ctx.lineTo(musketEnd, 0);
                ctx.strokeStyle = this.isCharging ? '#2c3e50' : '#34495e'; 
                ctx.lineWidth = this.isCharging ? 4 : 3; 
                ctx.stroke();
                
                if (this.isCharging) {
                    ctx.beginPath(); 
                    ctx.moveTo(barrelPos, 0); 
                    ctx.lineTo(barrelPos + (this.team === 'blue' ? -8 : 8), 0);
                    ctx.strokeStyle = '#7f8c8d'; 
                    ctx.lineWidth = 2; 
                    ctx.stroke();
                    ctx.beginPath(); 
                    ctx.moveTo(barrelPos + (this.team === 'blue' ? -8 : 8), 0); 
                    ctx.lineTo(barrelPos + (this.team === 'blue' ? -4 : 4), -3); 
                    ctx.lineTo(barrelPos + (this.team === 'blue' ? -4 : 4), 3); 
                    ctx.closePath();
                    ctx.fillStyle = '#bdc3c7'; 
                    ctx.fill();
                } else { 
                    ctx.beginPath(); 
                    ctx.arc(barrelPos, 0, 3, 0, Math.PI * 2); 
                    ctx.fillStyle = '#34495e'; 
                    ctx.fill(); 
                }
                ctx.restore();
                
                if (this.isCharging) { 
                    ctx.beginPath(); 
                    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2); 
                    ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)'; 
                    ctx.lineWidth = 2; 
                    ctx.stroke(); 
                }
            } else if (this.type === 'cavalry') {
                ctx.save(); 
                ctx.translate(this.x, this.y); 
                if (this.team === 'blue') {
                    ctx.rotate(this.facingAngle + Math.PI);
                } else {
                    ctx.rotate(this.facingAngle);
                }
                
                let bodyWidth = this.radius * 1.2;
                let bodyHeight = this.radius * 0.8;
                let headX = this.team === 'blue' ? -bodyWidth : bodyWidth;
                
                ctx.beginPath(); 
                ctx.ellipse(0, 0, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.team === 'red' ? '#e74c3c' : '#3498db'; 
                ctx.fill();
                
                ctx.beginPath(); 
                ctx.arc(headX, 0, this.radius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = this.team === 'red' ? '#c0392b' : '#2980b9'; 
                ctx.fill();
                
                if (this.isCharging) {
                    let dustX = this.team === 'blue' ? bodyWidth : -bodyWidth;
                    for (let i = 0; i < 3; i++) { 
                        let dustOffset = this.team === 'blue' ? bodyWidth + i * 5 : -bodyWidth - i * 5;
                        ctx.beginPath(); 
                        ctx.arc(dustOffset, 0, this.radius * 0.3 * (1 - i * 0.3), 0, Math.PI * 2); 
                        ctx.fillStyle = `rgba(149, 165, 166, ${0.7 - i * 0.2})`; 
                        ctx.fill(); 
                    }
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`; 
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 3; i++) {
                        let startX = this.team === 'blue' ? bodyWidth + i * 8 : -bodyWidth - i * 8;
                        let endX = this.team === 'blue' ? bodyWidth * 1.5 + i * 15 : -bodyWidth * 1.5 - i * 15;
                        ctx.beginPath(); 
                        ctx.moveTo(startX, -this.radius * 0.5); 
                        ctx.lineTo(endX, -this.radius * 0.5 - i * 2); 
                        ctx.stroke();
                        ctx.beginPath(); 
                        ctx.moveTo(startX, this.radius * 0.5); 
                        ctx.lineTo(endX, this.radius * 0.5 + i * 2); 
                        ctx.stroke();
                    }
                    if (!this.hasUsedFirstCharge) { 
                        ctx.beginPath(); 
                        ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2); 
                        ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)'; 
                        ctx.lineWidth = 3; 
                        ctx.stroke(); 
                    }
                }
                ctx.restore();
                
                if (!this.isCharging && this.hasUsedFirstCharge) {
                    const now = performance.now(); 
                    const chargeProgress = Math.min(1, (now - this.lastCharge) / this.chargeCooldown);
                    if (chargeProgress < 1) { 
                        ctx.beginPath(); 
                        ctx.arc(this.x, this.y, this.radius + 10, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * chargeProgress)); 
                        ctx.strokeStyle = 'rgba(155, 89, 182, 0.7)'; 
                        ctx.lineWidth = 3; 
                        ctx.stroke(); 
                    }
                }
            }
            
            // Health bar
            const barWidth = this.radius * 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; 
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, 4);
            let healthColor; 
            const healthPercent = this.health / this.maxHealth;
            if (healthPercent > 0.6) healthColor = '#2ecc71'; 
            else if (healthPercent > 0.3) healthColor = '#f39c12'; 
            else healthColor = '#e74c3c';
            ctx.fillStyle = healthColor; 
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * healthPercent, 4);
            
            // Formation indicator
            if (this.inFormation && this.formationBonus) {
                const remaining = (this.formationBonus.time - performance.now()) / 1000;
                if (remaining > 0) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius + 5, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * (remaining / 10)));
                    ctx.strokeStyle = 'rgba(52, 152, 219, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
            // Demoralized indicator
            if (this.demoralized) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(149, 165, 166, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }

    function saveOriginalPlacements() {
        originalCircles = circles.map(circle => ({
            x: circle.x, y: circle.y, team: circle.team, type: circle.type,
            health: circle.maxHealth, maxHealth: circle.maxHealth, radius: circle.radius,
            hasUsedFirstCharge: circle.type === 'cavalry' ? circle.hasUsedFirstCharge : undefined,
            hasUsedAbility: circle.type === 'general' ? circle.hasUsedAbility : undefined
        }));
        totalKills = 0; highestSingleDamage = 0;
    }

    function restoreOriginalPlacements() {
        circles = []; attackEffects = []; musketEffects = []; healingEffects = []; damageTexts = []; bloodSplatters = []; formationEffects = [];
        originalCircles.forEach(original => {
            const circle = new Circle(original.x, original.y, original.team, original.type);
            circle.health = original.maxHealth; circle.maxHealth = original.maxHealth;
            if (original.type === 'cavalry' && original.hasUsedFirstCharge === false) {
                circle.hasUsedFirstCharge = false;
                circle.lastCharge = performance.now() - circle.chargeCooldown - 10000;
            }
            if (original.type === 'general' && original.hasUsedAbility === false) {
                circle.hasUsedAbility = false;
                circle.lastAbilityUse = 0;
            }
            circles.push(circle);
        });
        gameRunning = false; showGhost = true; battleStartTime = 0; battleDuration = 0;
        totalKills = 0; highestSingleDamage = 0; playAgainHeaderBtn.style.display = 'none';
        updateStartPauseButton();
        
        // Reset General status displays
        redGeneralStatus.style.display = 'none';
        blueGeneralStatus.style.display = 'none';
    }

    function playAgain() { 
        gameOverModal.style.display = 'none'; 
        restoreOriginalPlacements(); 
        placingMode = "soldier"; 
        updateActiveButton(); 
        showNotification('Game reset', 'info'); 
    }

    function updateStartPauseButton() {
        if (gameRunning) {
            startPauseBtn.innerHTML = '⏸️ Pause';
            startPauseBtn.classList.add('pause');
            startPauseBtn.classList.add('active-red');
        } else {
            startPauseBtn.innerHTML = '▶️ Start';
            startPauseBtn.classList.remove('pause');
            startPauseBtn.classList.remove('active-red');
        }
    }

    function getCanvasMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (event.type.includes('touch')) {
            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if (event.changedTouches && event.changedTouches.length > 0) {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            } else {
                return { x: 0, y: 0 };
            }
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return { 
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function canPlaceUnit(x, y, type) {
        if (isMobile && circles.length >= MAX_UNITS_MOBILE) {
            showNotification(`Mobile limit: ${MAX_UNITS_MOBILE} units max`, 'warning');
            return false;
        }
        
        // Check if space is occupied
        const settings = UNIT_SETTINGS[type];
        const radius = baseUnitSize * settings.radiusMultiplier;
        let blocked = circles.some(c => Math.hypot(c.x - x, c.y - y) < (c.radius + radius) * 0.8);
        
        if (blocked) {
            showNotification('Space occupied', 'warning');
            return false;
        }
        
        return true;
    }

    function handleCanvasClick(x, y) {
        if (gameRunning) return;
        
        if (placingMode === "delete") {
            let closestUnit = null;
            let closestDistance = Infinity;
            let deleteIndex = -1;
            
            for (let i = 0; i < circles.length; i++) {
                const c = circles[i];
                const dist = Math.hypot(c.x - x, c.y - y);
                
                if (dist < c.radius * 1.5 && dist < closestDistance) {
                    closestDistance = dist;
                    closestUnit = c;
                    deleteIndex = i;
                }
            }
            
            if (closestUnit) {
                circles.splice(deleteIndex, 1);
                audio.playDelete();
                bloodSplatters.push(new BloodSplatter(closestUnit.x, closestUnit.y, 0.5));
                showNotification(`${closestUnit.type} deleted`, 'warning');
                return;
            } else {
                showNotification('No unit to delete here', 'info');
                return;
            }
        }
        
        // PLACEMENT MODE
        const settings = UNIT_SETTINGS[placingMode];
        const radius = baseUnitSize * settings.radiusMultiplier;
        const withinBounds = x > mapPadding + radius && 
                           x < canvasWidth - mapPadding - radius && 
                           y > mapPadding + radius && 
                           y < canvasHeight - mapPadding - radius;
        
        if (!withinBounds) { 
            showNotification('Cannot place outside battlefield', 'warning'); 
            return; 
        }

        if (placingMode === "general") {
            const team = x < canvasWidth / 2 ? 'red' : 'blue';
            
            // Check if team already has a General
            const existingGeneral = circles.find(c => c.team === team && c.type === 'general');
            if (existingGeneral) {
                showNotification(`Only one General per team!`, 'warning');
                return;
            }
            
            if (!canPlaceUnit(x, y, 'general')) return;
            
            circles.push(new Circle(x, y, team, 'general'));
            audio.playPlace();
            
            // Show General status display
            if (team === 'red') {
                redGeneralStatus.style.display = 'block';
                redGeneralCooldown.textContent = 'READY!';
                redGeneralCooldown.style.color = '#2ecc71';
            } else {
                blueGeneralStatus.style.display = 'block';
                blueGeneralCooldown.textContent = 'READY!';
                blueGeneralCooldown.style.color = '#2ecc71';
            }
            
            showNotification('General placed - Limit: 1 per team', 'info');
            return;
        }

        if (placingMode === "soldier" || placingMode === "tank" || placingMode === "healer" || placingMode === "musketeer" || placingMode === "cavalry") {
            let type = placingMode; 
            let team = x < canvasWidth / 2 ? 'red' : 'blue';
            
            if (!canPlaceUnit(x, y, type)) return;
            
            circles.push(new Circle(x, y, team, type)); 
            audio.playPlace();
            showNotification(`${type} placed`, 'info'); 
        }
    }

    // Event Listeners setup
    function setupEventListeners() {
        // Mouse events for desktop
        canvas.addEventListener("mousemove", e => { 
            const pos = getCanvasMousePos(e); 
            mouseX = pos.x; 
            mouseY = pos.y; 
        });
        
        canvas.addEventListener("click", e => { 
            const pos = getCanvasMousePos(e); 
            handleCanvasClick(pos.x, pos.y); 
        });
        
        // Touch events for mobile
        canvas.addEventListener("touchstart", function(e) {
            e.preventDefault();
            const pos = getCanvasMousePos(e);
            mouseX = pos.x;
            mouseY = pos.y;
            
            handleCanvasClick(pos.x, pos.y);
        }, { passive: false });
        
        canvas.addEventListener("touchmove", function(e) {
            e.preventDefault();
            const pos = getCanvasMousePos(e);
            mouseX = pos.x;
            mouseY = pos.y;
        }, { passive: false });
        
        canvas.addEventListener("touchend", function(e) {
            e.preventDefault();
        }, { passive: false });
        
        // Prevent context menu on canvas
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Unit buttons
        document.querySelectorAll('.unit-controls button').forEach(btn => {
            if (btn.dataset.type) {
                btn.onclick = () => { 
                    placingMode = btn.dataset.type; 
                    const displayName = btn.textContent.replace(/[^a-zA-Z\s]/g, '').trim();
                    showNotification(`Placing: ${displayName}`, 'info'); 
                    showGhost = true; 
                    updateActiveButton();
                    
                    audio.playButton();
                };
            }
        });

        // Control buttons
        document.getElementById("deleteTool").onclick = () => { 
            placingMode = "delete"; 
            showNotification("Delete Tool - Click units to remove", 'warning'); 
            showGhost = false; 
            updateActiveButton();
            
            audio.playButton();
        };
        
        document.getElementById("deleteAllBtn").onclick = () => {
            if (circles.length > 0) {
                circles = [];
                audio.playDelete();
                showNotification('All units deleted', 'warning');
                
                // Hide General status displays
                redGeneralStatus.style.display = 'none';
                blueGeneralStatus.style.display = 'none';
            } else {
                showNotification('No units to delete', 'info');
            }
            
            audio.playButton();
        };
        
        document.getElementById("startPauseBtn").onclick = () => {
            if (circles.length === 0) { 
                showNotification('Place units first', 'warning'); 
                return; 
            }
            
            if (!gameRunning) {
                if (battleStartTime === 0) saveOriginalPlacements();
                gameRunning = true; 
                showGhost = false;
                if (battleStartTime === 0) battleStartTime = performance.now();
                showNotification("Battle started", 'info');
                gameStatusEl.textContent = "Running";
                
                // Reset General ability cooldowns for new battle
                circles.forEach(circle => {
                    if (circle.type === 'general') {
                        circle.hasUsedAbility = false;
                        circle.lastAbilityUse = 0;
                        if (circle.team === 'red') {
                            redGeneralCooldown.textContent = 'READY!';
                            redGeneralCooldown.style.color = '#2ecc71';
                        } else {
                            blueGeneralCooldown.textContent = 'READY!';
                            blueGeneralCooldown.style.color = '#2ecc71';
                        }
                    }
                });
            } else {
                gameRunning = false; 
                showGhost = true; 
                showNotification("Battle paused", 'warning');
                gameStatusEl.textContent = "Paused";
            }
            
            updateStartPauseButton();
            audio.playButton();
        };
        
        document.getElementById("autoPlaceBtn").onclick = () => {
            circles = []; 
            const padding = mapPadding + 30;
            
            // Adjust unit counts for mobile
            const soldierCount = isMobile ? 3 : 4;
            const specialCount = isMobile ? 1 : 2;
            
            // Red Team
            for (let i = 0; i < soldierCount; i++) {
                circles.push(new Circle(
                    padding + Math.random() * (canvasWidth / 2 - padding * 2), 
                    padding + Math.random() * (canvasHeight - padding * 2), 
                    'red', 'soldier'
                ));
            }
            
            if (specialCount > 0) {
                circles.push(new Circle(padding + 40, canvasHeight / 2 - 60, 'red', 'tank'));
                circles.push(new Circle(padding + 60, canvasHeight / 3, 'red', 'healer'));
                circles.push(new Circle(padding + 120, canvasHeight / 4, 'red', 'musketeer'));
                circles.push(new Circle(padding + 160, canvasHeight / 5, 'red', 'cavalry'));
                circles.push(new Circle(padding + 100, canvasHeight / 2, 'red', 'general'));
            }
            
            // Blue Team
            for (let i = 0; i < soldierCount; i++) {
                circles.push(new Circle(
                    canvasWidth / 2 + padding + Math.random() * (canvasWidth / 2 - padding * 2), 
                    padding + Math.random() * (canvasHeight - padding * 2), 
                    'blue', 'soldier'
                ));
            }
            
            if (specialCount > 0) {
                circles.push(new Circle(canvasWidth - padding - 40, canvasHeight / 2 - 60, 'blue', 'tank'));
                circles.push(new Circle(canvasWidth - padding - 60, canvasHeight / 3, 'blue', 'healer'));
                circles.push(new Circle(canvasWidth - padding - 120, canvasHeight / 4, 'blue', 'musketeer'));
                circles.push(new Circle(canvasWidth - padding - 160, canvasHeight / 5, 'blue', 'cavalry'));
                circles.push(new Circle(canvasWidth - padding - 100, canvasHeight / 2, 'blue', 'general'));
            }
            
            // Show General status displays
            redGeneralStatus.style.display = 'block';
            blueGeneralStatus.style.display = 'block';
            redGeneralCooldown.textContent = 'READY!';
            blueGeneralCooldown.textContent = 'READY!';
            redGeneralCooldown.style.color = '#2ecc71';
            blueGeneralCooldown.style.color = '#2ecc71';
            
            setTimeout(() => {
                audio.playPlace();
            }, 100);
            
            showNotification('Auto-placed armies with Generals', 'info');
            audio.playButton();
        };
        
        playAgainHeaderBtn.onclick = () => { 
            playAgain(); 
            audio.playButton();
        };
        playAgainBtn.onclick = () => { 
            playAgain(); 
            audio.playButton();
        };
        
        // Add button sounds to other buttons
        document.querySelectorAll('.sidebar-tab, .unit-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                audio.playButton();
            });
        });
        
        // Mobile help button
        const mobileHelpBtn = document.getElementById('mobileHelpBtn');
        if (mobileHelpBtn && isMobile) {
            mobileHelpBtn.addEventListener('click', function() {
                const message = '🕹️ MOBILE CONTROLS:\n\n• Tap unit buttons to select\n• Tap battlefield to place\n• "Auto Place" for quick setup\n• "Start" begins the battle\n• Rotate device for landscape\n\n🎖️ GENERAL UNIT:\n• Only 1 per team\n• Commands formations (45s cooldown)\n• +10% damage aura to nearby allies\n• Death demoralizes your army';
                alert(message);
                audio.playButton();
            });
        }
    }

    function checkGeneralDeath(general) {
        if (general.health <= 0 && general.lastHealth > 0) {
            audio.playGeneralDeath();
            
            bloodSplatters.push(new BloodSplatter(general.x, general.y, general.radius / 10));
            
            // Morale penalty for allies
            const allies = circles.filter(c => c.team === general.team && c !== general);
            const now = performance.now();
            allies.forEach(ally => {
                ally.demoralized = true;
                ally.demoralizedUntil = now + 15000; // 15 seconds
            });
            
            const teamName = general.team === 'red' ? 'Red' : 'Blue';
            showNotification(`${teamName} General has fallen! Morale broken!`, 'warning');
            
            totalKills++;
            
            // Hide General status display
            if (general.team === 'red') {
                redGeneralStatus.style.display = 'none';
            } else {
                blueGeneralStatus.style.display = 'none';
            }
        }
    }

    function gameLoop(currentTime) {
        if (isMobile && currentTime - lastFrameTime < 1000 / MOBILE_FPS_LIMIT) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastFrameTime = currentTime;
        
        drawMap(); 
        drawGhost();
        
        const redTeam = circles.filter(c => c.team === "red");
        const blueTeam = circles.filter(c => c.team === "blue");
        attackEffects = attackEffects.filter(effect => effect.draw());
        musketEffects = musketEffects.filter(effect => effect.update()); 
        musketEffects.forEach(effect => effect.draw());
        healingEffects = healingEffects.filter(effect => effect.update()); 
        healingEffects.forEach(effect => effect.draw());
        damageTexts = damageTexts.filter(text => text.update()); 
        damageTexts.forEach(text => text.draw());
        bloodSplatters = bloodSplatters.filter(splatter => splatter.update());
        bloodSplatters.forEach(splatter => splatter.draw());
        formationEffects = formationEffects.filter(effect => effect.update());
        formationEffects.forEach(effect => effect.draw());

        for (let c of circles) {
            let allies = circles.filter(x => x.team === c.team && x.health > 0);
            let enemies = circles.filter(x => x.team !== c.team && x.health > 0);
            for (let i = 0; i < gameSpeed; i++) c.updateAI(enemies, allies);
            c.draw();
            
            // Check for General death
            if (c.type === 'general') {
                checkGeneralDeath(c);
            } else if (c.health <= 0 && c.lastHealth > 0) {
                audio.playDeath();
                bloodSplatters.push(new BloodSplatter(c.x, c.y, c.radius / 20));
                totalKills++;
            }
            c.lastHealth = c.health;
        }

        circles = circles.filter(c => c.health > 0);
        const redAlive = circles.filter(c => c.team === "red" && c.health > 0);
        const blueAlive = circles.filter(c => c.team === "blue" && c.health > 0);
        redCountEl.textContent = redAlive.length; 
        blueCountEl.textContent = blueAlive.length;
        totalCountEl.textContent = circles.length; 
        
        if (gameRunning) {
            battleDuration = Math.floor((performance.now() - battleStartTime) / 1000);
            battleTimeEl.textContent = battleDuration + 's';
            if (redAlive.length === 0 || blueAlive.length === 0) {
                gameRunning = false; 
                const winner = redAlive.length > 0 ? 'red' : 'blue';
                winnerTextEl.textContent = `${winner === 'red' ? '🔴 Red' : '🔵 Blue'} Team Victory!`;
                winnerTextEl.className = `winner-text ${winner === 'red' ? 'winner-red' : 'winner-blue'}`;
                finalTimeEl.textContent = battleDuration; 
                remainingUnitsEl.textContent = winner === 'red' ? redAlive.length : blueAlive.length;
                totalKillsEl.textContent = totalKills; 
                highestDamageEl.textContent = highestSingleDamage;
                gameOverModal.style.display = 'flex'; 
                playAgainHeaderBtn.style.display = 'flex';
                showNotification(`${winner === 'red' ? 'Red' : 'Blue'} wins!`, 'info');
                updateStartPauseButton();
                
                audio.playVictory();
            }
        }
        requestAnimationFrame(gameLoop);
    }

    // Initialize
    function init() {
        showNotification(isMobile ? 'Tap to place units' : 'Click to place units', 'info');
        setupEventListeners();
        updateActiveButton();
        updateStartPauseButton();
        
        // Hide mobile loading screen
        setTimeout(() => {
            const loading = document.getElementById('mobileLoading');
            if (loading) loading.style.display = 'none';
        }, 500);
        
        gameLoop();
    }

    // Start the game
    init();
}
