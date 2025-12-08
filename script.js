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
    }
};

// ============================================
// MAIN GAME CODE (DON'T EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING)
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

    // Game variables
    let placingMode = "soldier";
    let gameRunning = false;
    let circles = [];
    let mouseX = 0, mouseY = 0, showGhost = true;
    let attackEffects = [];
    let musketEffects = [];
    let healingEffects = [];
    let damageTexts = [];
    let gameSpeed = 1.0;
    let baseUnitSize = 20;
    let battleStartTime = 0;
    let battleDuration = 0;
    let originalCircles = [];
    let totalKills = 0;
    let highestSingleDamage = 0;

    const mapPadding = 20;

    // Initialize canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        const header = document.querySelector('.header');
        const sidebar = document.querySelector('.sidebar');
        
        if (window.innerWidth >= 768) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        } else {
            const availableHeight = window.innerHeight - header.offsetHeight - sidebar.offsetHeight;
            canvas.width = container.clientWidth;
            canvas.height = Math.max(300, availableHeight);
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Update active button styling
    function updateActiveButton() {
        document.querySelectorAll('.unit-controls button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === placingMode) {
                btn.classList.add('active');
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
        
        setTimeout(() => notification.classList.remove('show'), 2000);
    }

    function drawMap() {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const redGradient = ctx.createLinearGradient(0, 0, canvas.width/2, 0);
        redGradient.addColorStop(0, 'rgba(231, 76, 60, 0.1)');
        redGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');
        ctx.fillStyle = redGradient;
        ctx.fillRect(0, 0, canvas.width/2, canvas.height);
        
        const blueGradient = ctx.createLinearGradient(canvas.width, 0, canvas.width/2, 0);
        blueGradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
        blueGradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)');
        ctx.fillStyle = blueGradient;
        ctx.fillRect(canvas.width/2, 0, canvas.width/2, canvas.height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctx.font = 'bold 18px "Segoe UI", system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔴 RED', canvas.width/4, 25);
        
        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.fillText('🔵 BLUE', canvas.width*3/4, 25);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.rect(mapPadding, mapPadding, canvas.width - mapPadding*2, canvas.height - mapPadding*2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawGhost() {
        if (!showGhost || placingMode === "delete") return;
        
        const settings = UNIT_SETTINGS[placingMode];
        let radius = baseUnitSize * settings.radiusMultiplier * (Math.min(canvas.width, canvas.height) / 800);
        let team = mouseX < canvas.width/2 ? "red" : "blue";
        let type = placingMode;
        
        let color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)";
            
        const withinBounds = mouseX > mapPadding + radius && mouseX < canvas.width - mapPadding - radius && mouseY > mapPadding + radius && mouseY < canvas.height - mapPadding - radius;
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
        if (absAngleDiff < Math.PI / 6) return 1.0;
        else if (absAngleDiff > (5 * Math.PI) / 6) return 2.0;
        else return 1.25;
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

    class Circle {
        constructor(x, y, team, type = 'soldier') {
            this.x = x; this.y = y; this.team = team; this.type = type;
            const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
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
            }
            
            this.lastAttack = 0; this.lastHeal = 0; this.velX = 0; this.velY = 0;
            this.id = Math.random().toString(36).substr(2, 9); this.facingAngle = team === 'blue' ? Math.PI : 0;
            this.lastHealth = this.health; this.totalDamageDealt = 0; this.kills = 0;
        }

        draw() {
            if (Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1) this.facingAngle = Math.atan2(this.velY, this.velX);
            const gradient = ctx.createRadialGradient(this.x - 3, this.y - 3, 3, this.x, this.y, this.radius);
            
            const settings = UNIT_SETTINGS[this.type];
            const colors = this.team === 'red' ? settings.colorRed : settings.colorBlue;
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
            
            if (this.type === 'healer') {
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
            
            if (this.type === 'musketeer' && !this.isCharging) {
                const now = performance.now(); 
                const reloadProgress = Math.min(1, (now - this.lastShot) / this.attackCooldown);
                if (reloadProgress < 1) { 
                    ctx.beginPath(); 
                    ctx.arc(this.x, this.y, this.radius + 8, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * reloadProgress)); 
                    ctx.strokeStyle = 'rgba(52, 152, 219, 0.7)'; 
                    ctx.lineWidth = 3; 
                    ctx.stroke(); 
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
            this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
            this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
        }

        updateAI(enemies, allies) {
            if (!gameRunning) return;
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
                                damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius, finalDamage, false, isCritical));
                                attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, isCritical));
                                
                                if (closestEnemy.health <= 0) {
                                    this.kills++;
                                    totalKills++;
                                }
                            }
                        }
                        return;
                    }
                }
                
                // Normal movement when not charging
                const safeDistance = this.radius * 3;
                if (distToEnemy > safeDistance) {
                    let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > 0) {
                        const desiredX = dx / dist; const desiredY = dy / dist;
                        this.velX = this.velX * 0.9 + desiredX * this.turnSpeed;
                        this.velY = this.velY * 0.9 + desiredY * this.turnSpeed;
                        const speed = Math.hypot(this.velX, this.velY);
                        if (speed > this.baseSpeed) {
                            this.velX = this.velX / speed * this.baseSpeed;
                            this.velY = this.velY / speed * this.baseSpeed;
                        }
                    }
                } else {
                    this.velX *= 0.95;
                    this.velY *= 0.95;
                }
                
                this.x += this.velX;
                this.y += this.velY;
                this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
                this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
                
                // Attack when close enough
                if (distToEnemy <= this.radius + closestEnemy.radius + 5) {
                    if (now - this.lastAttack >= this.attackCooldown) {
                        const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                        const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                        const isCritical = damageMultiplier > 1.5;
                        closestEnemy.health -= actualDamage;
                        this.lastAttack = now;
                        this.totalDamageDealt += actualDamage;
                        if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                        damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius, actualDamage, false, isCritical));
                        attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, isCritical));
                        
                        if (closestEnemy.health <= 0) {
                            this.kills++;
                            totalKills++;
                        }
                    }
                }
                return;
            }
            
            // MUSKETEER AI
            if (this.type === 'musketeer') {
                if (enemies.length === 0) return;
                let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
                let distToEnemy = this.distanceTo(closestEnemy);
                let now = performance.now();
                
                // Handle bayonet charging
                if (distToEnemy <= this.bayonetRange) {
                    this.isCharging = true;
                    if (distToEnemy <= this.radius + closestEnemy.radius + 5) {
                        if (now - this.lastAttack >= this.attackCooldown) {
                            const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                            const actualDamage = Math.floor(this.attackPower * 0.6 * damageMultiplier);
                            const isCritical = damageMultiplier > 1.5;
                            closestEnemy.health -= actualDamage;
                            this.lastAttack = now;
                            this.totalDamageDealt += actualDamage;
                            if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                            damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius, actualDamage, false, isCritical));
                            attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, isCritical));
                            
                            if (closestEnemy.health <= 0) {
                                this.kills++;
                                totalKills++;
                            }
                        }
                    }
                    
                    // Move towards enemy for bayonet charge
                    if (distToEnemy > this.radius + closestEnemy.radius + 2) {
                        let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                            this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                            const speed = Math.hypot(this.velX, this.velY);
                            if (speed > this.maxSpeed) {
                                this.velX = this.velX / speed * this.maxSpeed;
                                this.velY = this.velY / speed * this.maxSpeed;
                            }
                        }
                    } else {
                        this.velX *= 0.95;
                        this.velY *= 0.95;
                    }
                } else {
                    this.isCharging = false;
                    
                    // Handle shooting
                    if (distToEnemy <= this.shootingRange) {
                        if (now - this.lastShot >= this.attackCooldown) {
                            this.lastShot = now;
                            
                            // Check for miss
                            const miss = Math.random() < this.missChance;
                            let actualHitX = closestEnemy.x;
                            let actualHitY = closestEnemy.y;
                            
                            if (miss) {
                                actualHitX = closestEnemy.x + (Math.random() - 0.5) * 40;
                                actualHitY = closestEnemy.y + (Math.random() - 0.5) * 40;
                                damageTexts.push(new DamageText(actualHitX, actualHitY, 0, false, false, true));
                            } else {
                                const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                                const isCritical = damageMultiplier > 1.5;
                                closestEnemy.health -= actualDamage;
                                this.totalDamageDealt += actualDamage;
                                if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                                damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius, actualDamage, false, isCritical));
                                
                                if (closestEnemy.health <= 0) {
                                    this.kills++;
                                    totalKills++;
                                }
                            }
                            
                            musketEffects.push(new MusketEffect(this.x, this.y, actualHitX, actualHitY, !miss));
                        }
                        
                        // Back away while reloading
                        const dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 0 && dist < this.shootingRange * 0.7) {
                            this.velX = this.velX * 0.9 - (dx / dist) * this.turnSpeed;
                            this.velY = this.velY * 0.9 - (dy / dist) * this.turnSpeed;
                            const speed = Math.hypot(this.velX, this.velY);
                            if (speed > this.maxSpeed * 0.8) {
                                this.velX = this.velX / speed * (this.maxSpeed * 0.8);
                                this.velY = this.velY / speed * (this.maxSpeed * 0.8);
                            }
                        } else {
                            this.velX *= 0.95;
                            this.velY *= 0.95;
                        }
                    } else {
                        // Move towards enemy
                        let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                            this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                            const speed = Math.hypot(this.velX, this.velY);
                            if (speed > this.maxSpeed) {
                                this.velX = this.velX / speed * this.maxSpeed;
                                this.velY = this.velY / speed * this.maxSpeed;
                            }
                        }
                    }
                }
                
                this.x += this.velX;
                this.y += this.velY;
                this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
                this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
                return;
            }
            
            // HEALER AI
            if (this.type === 'healer') {
                let now = performance.now();
                
                // Find injured ally to heal
                if (!this.currentHealTarget || this.currentHealTarget.health <= 0 || 
                    this.distanceTo(this.currentHealTarget) > this.healRange || 
                    this.currentHealTarget.health >= this.currentHealTarget.maxHealth) {
                    
                    this.currentHealTarget = null;
                    let injuredAllies = allies.filter(a => a !== this && a.health < a.maxHealth);
                    if (injuredAllies.length > 0) {
                        // Find most injured ally
                        this.currentHealTarget = injuredAllies.reduce((a, b) => 
                            (a.health / a.maxHealth) < (b.health / b.maxHealth) ? a : b
                        );
                    }
                }
                
                if (this.currentHealTarget) {
                    let distToTarget = this.distanceTo(this.currentHealTarget);
                    
                    if (distToTarget <= this.healRange) {
                        // Heal the target
                        if (now - this.lastHeal >= this.healCooldown) {
                            const healAmount = Math.min(this.healPower, this.currentHealTarget.maxHealth - this.currentHealTarget.health);
                            this.currentHealTarget.health += healAmount;
                            this.lastHeal = now;
                            healingEffects.push(new HealingEffect(this.x, this.y, this.currentHealTarget.x, this.currentHealTarget.y, healAmount));
                            damageTexts.push(new DamageText(this.currentHealTarget.x, this.currentHealTarget.y - this.currentHealTarget.radius, healAmount, true));
                        }
                        
                        // Maintain distance
                        if (distToTarget < this.healRange * 0.3) {
                            let dx = this.x - this.currentHealTarget.x, dy = this.y - this.currentHealTarget.y;
                            let dist = Math.hypot(dx, dy);
                            if (dist > 0) {
                                this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                                this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                            }
                        } else {
                            this.velX *= 0.95;
                            this.velY *= 0.95;
                        }
                    } else {
                        // Move towards target
                        let dx = this.currentHealTarget.x - this.x, dy = this.currentHealTarget.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                            this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                            const speed = Math.hypot(this.velX, this.velY);
                            if (speed > this.maxSpeed) {
                                this.velX = this.velX / speed * this.maxSpeed;
                                this.velY = this.velY / speed * this.maxSpeed;
                            }
                        }
                    }
                } else {
                    // No one to heal, follow closest ally
                    if (allies.length > 1) {
                        let closestAlly = allies.filter(a => a !== this).reduce((a, b) => 
                            this.distanceTo(a) < this.distanceTo(b) ? a : b
                        );
                        
                        let dx = closestAlly.x - this.x, dy = closestAlly.y - this.y;
                        let dist = Math.hypot(dx, dy);
                        
                        if (dist > this.healRange * 0.5) {
                            this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                            this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                            const speed = Math.hypot(this.velX, this.velY);
                            if (speed > this.maxSpeed) {
                                this.velX = this.velX / speed * this.maxSpeed;
                                this.velY = this.velY / speed * this.maxSpeed;
                            }
                        } else {
                            this.velX *= 0.95;
                            this.velY *= 0.95;
                        }
                    } else {
                        this.velX *= 0.95;
                        this.velY *= 0.95;
                    }
                }
                
                this.x += this.velX;
                this.y += this.velY;
                this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
                this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
                return;
            }
            
            // SOLDIER & TANK AI (DEFAULT)
            if (enemies.length === 0) return;
            let closestEnemy = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
            let distToEnemy = this.distanceTo(closestEnemy);
            
            const safeDistance = this.radius * 3;
            if (distToEnemy > safeDistance) {
                let dx = closestEnemy.x - this.x, dy = closestEnemy.y - this.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    this.velX = this.velX * 0.9 + (dx / dist) * this.turnSpeed;
                    this.velY = this.velY * 0.9 + (dy / dist) * this.turnSpeed;
                    const speed = Math.hypot(this.velX, this.velY);
                    if (speed > this.maxSpeed) {
                        this.velX = this.velX / speed * this.maxSpeed;
                        this.velY = this.velY / speed * this.maxSpeed;
                    }
                }
            } else {
                this.velX *= 0.95;
                this.velY *= 0.95;
            }
            
            this.x += this.velX;
            this.y += this.velY;
            this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
            this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
            
            if (distToEnemy <= this.radius + closestEnemy.radius + 5) {
                let now = performance.now();
                if (now - this.lastAttack >= this.attackCooldown) {
                    const damageMultiplier = getDirectionalDamageMultiplier(this, closestEnemy);
                    const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                    const isCritical = damageMultiplier > 1.5;
                    closestEnemy.health -= actualDamage;
                    this.lastAttack = now;
                    this.totalDamageDealt += actualDamage;
                    if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                    damageTexts.push(new DamageText(closestEnemy.x, closestEnemy.y - closestEnemy.radius, actualDamage, false, isCritical));
                    attackEffects.push(new AttackEffect(closestEnemy.x, closestEnemy.y, this.team, isCritical));
                    
                    if (closestEnemy.health <= 0) {
                        this.kills++;
                        totalKills++;
                    }
                }
            }
        }
    }

    // Event Listeners
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseleave", () => {
        showGhost = false;
    });

    canvas.addEventListener("mouseenter", () => {
        showGhost = true;
    });

    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if click is within map bounds
        if (x < mapPadding || x > canvas.width - mapPadding || y < mapPadding || y > canvas.height - mapPadding) {
            showNotification("Click inside the battlefield!", "error");
            return;
        }

        // Delete mode
        if (placingMode === "delete") {
            let deleted = false;
            circles = circles.filter(circle => {
                const dist = Math.hypot(circle.x - x, circle.y - y);
                if (dist <= circle.radius) {
                    deleted = true;
                    return false;
                }
                return true;
            });
            if (deleted) {
                showNotification("Unit deleted", "warning");
                updateCounts();
            }
            return;
        }

        // Determine team based on click position
        const team = x < canvas.width / 2 ? "red" : "blue";
        const settings = UNIT_SETTINGS[placingMode];
        const radius = baseUnitSize * settings.radiusMultiplier * (Math.min(canvas.width, canvas.height) / 800);

        // Check for overlapping units
        const overlapping = circles.some(c => Math.hypot(c.x - x, c.y - y) < (c.radius + radius) * 0.8);
        if (overlapping) {
            showNotification("Units cannot overlap!", "error");
            return;
        }

        // Add the new unit
        circles.push(new Circle(x, y, team, placingMode));
        showNotification(`${team.toUpperCase()} ${placingMode} deployed!`, "info");
        updateCounts();
    });

    // Unit selection buttons
    document.querySelectorAll('.unit-controls button').forEach(btn => {
        btn.addEventListener('click', () => {
            placingMode = btn.dataset.type;
            updateActiveButton();
            
            let message = `Selected: ${placingMode}`;
            if (placingMode === 'delete') message = "Click units to delete them";
            showNotification(message, 'info');
        });
    });

    // Game controls
    startPauseBtn.addEventListener('click', () => {
        if (circles.length < 2) {
            showNotification("Place at least 2 units to start!", "error");
            return;
        }

        if (!gameRunning) {
            // Save original state if this is the first start
            if (originalCircles.length === 0) {
                originalCircles = JSON.parse(JSON.stringify(circles));
                circles.forEach(c => {
                    c.originalHealth = c.health;
                    c.totalDamageDealt = 0;
                    c.kills = 0;
                });
                battleStartTime = performance.now();
            }
            
            gameRunning = true;
            startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Battle';
            startPauseBtn.classList.add('paused');
            gameStatusEl.textContent = "Battle in Progress";
            showNotification("Battle started!", "info");
        } else {
            gameRunning = false;
            startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume Battle';
            startPauseBtn.classList.remove('paused');
            gameStatusEl.textContent = "Battle Paused";
            showNotification("Battle paused", "warning");
        }
    });

    playAgainHeaderBtn.addEventListener('click', () => {
        resetGame();
    });

    playAgainBtn.addEventListener('click', () => {
        resetGame();
        gameOverModal.classList.remove('show');
    });

    // Speed controls
    document.querySelectorAll('.speed-controls button').forEach(btn => {
        btn.addEventListener('click', () => {
            gameSpeed = parseFloat(btn.dataset.speed);
            document.querySelectorAll('.speed-controls button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showNotification(`Game speed: ${gameSpeed}x`, 'info');
        });
    });

    // Update statistics
    function updateCounts() {
        const redCount = circles.filter(c => c.team === 'red').length;
        const blueCount = circles.filter(c => c.team === 'blue').length;
        
        redCountEl.textContent = redCount;
        blueCountEl.textContent = blueCount;
        totalCountEl.textContent = circles.length;
    }

    function updateBattleTime() {
        if (gameRunning && battleStartTime > 0) {
            battleDuration = (performance.now() - battleStartTime) / 1000;
            const minutes = Math.floor(battleDuration / 60);
            const seconds = Math.floor(battleDuration % 60);
            battleTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function resetGame() {
        circles = [];
        attackEffects = [];
        musketEffects = [];
        healingEffects = [];
        damageTexts = [];
        gameRunning = false;
        battleStartTime = 0;
        battleDuration = 0;
        originalCircles = [];
        totalKills = 0;
        highestSingleDamage = 0;
        
        // Restore from original if exists
        if (originalCircles.length > 0) {
            circles = JSON.parse(JSON.stringify(originalCircles));
            circles.forEach(c => {
                c.health = c.originalHealth || c.maxHealth;
                c.totalDamageDealt = 0;
                c.kills = 0;
            });
        }
        
        startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start Battle';
        startPauseBtn.classList.remove('paused');
        gameStatusEl.textContent = "Ready for Battle";
        
        updateCounts();
        battleTimeEl.textContent = "00:00";
        showNotification("Game reset", "info");
    }

    function checkGameOver() {
        const redUnits = circles.filter(c => c.team === 'red' && c.health > 0);
        const blueUnits = circles.filter(c => c.team === 'blue' && c.health > 0);
        
        if (redUnits.length === 0 || blueUnits.length === 0) {
            gameRunning = false;
            startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start Battle';
            startPauseBtn.classList.remove('paused');
            gameStatusEl.textContent = "Battle Ended";
            
            let winner = redUnits.length > 0 ? 'Red' : 'Blue';
            let winnerColor = redUnits.length > 0 ? '#e74c3c' : '#3498db';
            let remainingUnits = Math.max(redUnits.length, blueUnits.length);
            
            // Update modal content
            winnerTextEl.textContent = `${winner} Team Wins!`;
            winnerTextEl.style.color = winnerColor;
            
            const minutes = Math.floor(battleDuration / 60);
            const seconds = Math.floor(battleDuration % 60);
            finalTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            remainingUnitsEl.textContent = remainingUnits;
            totalKillsEl.textContent = totalKills;
            highestDamageEl.textContent = highestSingleDamage;
            
            // Show modal after a brief delay
            setTimeout(() => {
                gameOverModal.classList.add('show');
            }, 1000);
            
            return true;
        }
        return false;
    }

    // Main game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw map
        drawMap();
        
        // Draw ghost unit
        drawGhost();
        
        // Update and draw circles
        if (gameRunning) {
            const redUnits = circles.filter(c => c.team === 'red' && c.health > 0);
            const blueUnits = circles.filter(c => c.team === 'blue' && c.health > 0);
            
            // Update each unit
            circles.forEach(circle => {
                if (circle.health <= 0) return;
                
                const enemies = circle.team === 'red' ? blueUnits : redUnits;
                const allies = circle.team === 'red' ? redUnits : blueUnits;
                
                circle.updateAI(enemies, allies);
            });
            
            // Remove dead units
            circles = circles.filter(circle => circle.health > 0);
            
            // Update battle time
            updateBattleTime();
            
            // Check for game over
            checkGameOver();
        }
        
        // Draw all circles
        circles.forEach(circle => {
            if (circle.health > 0) {
                circle.draw();
            }
        });
        
        // Update and draw effects
        attackEffects = attackEffects.filter(effect => effect.draw());
        musketEffects = musketEffects.filter(effect => {
            effect.update();
            effect.draw();
            return effect.progress <= 1.0 && effect.life > 0;
        });
        healingEffects = healingEffects.filter(effect => {
            effect.update();
            effect.draw();
            return effect.progress <= 1.0 && effect.life > 0;
        });
        damageTexts = damageTexts.filter(text => {
            text.update();
            text.draw();
            return text.life > 0;
        });
        
        // Update counts
        updateCounts();
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    }

    // Initialize active button
    updateActiveButton();
    
    // Start the game loop
    gameLoop();
}
