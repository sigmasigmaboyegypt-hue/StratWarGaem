// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize game
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
    const MUSKET_RANGE = 150;
    const BAYONET_RANGE = 60;

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
        
        let color, radius = baseUnitSize * (Math.min(canvas.width, canvas.height) / 800);
        let team = mouseX < canvas.width/2 ? "red" : "blue";
        let type = placingMode;
        
        if (placingMode === "soldier") { type = "soldier"; color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; }
        else if (placingMode === "tank") { type = "tank"; color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; radius = baseUnitSize * 1.3 * (Math.min(canvas.width, canvas.height) / 800); }
        else if (placingMode === "healer") { type = "healer"; color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; }
        else if (placingMode === "musketeer") { type = "musketeer"; color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; radius = baseUnitSize * 0.9 * (Math.min(canvas.width, canvas.height) / 800); }
        else if (placingMode === "cavalry") { type = "cavalry"; color = team === "red" ? "rgba(231, 76, 60, 0.6)" : "rgba(52, 152, 219, 0.6)"; radius = baseUnitSize * 1.1 * (Math.min(canvas.width, canvas.height) / 800); }
            
        const withinBounds = mouseX > mapPadding + radius && mouseX < canvas.width - mapPadding - radius && mouseY > mapPadding + radius && mouseY < canvas.height - mapPadding - radius;
        let blocked = circles.some(c => Math.hypot(c.x - mouseX, c.y - mouseY) < (c.radius + radius) * 0.8);
        
        if (blocked || !withinBounds) color = "rgba(231, 76, 60, 0.8)";
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Blue team ghost faces toward enemy (left side)
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
            // BLUE TEAM FACES LEFT, RED TEAM FACES RIGHT
            if (isBlueTeam) {
                ctx.rotate(Math.PI); // 180 degrees - faces LEFT
            } else {
                ctx.rotate(0); // 0 degrees - faces RIGHT
            }
            ctx.beginPath();
            // Musket orientation
            if (isBlueTeam) {
                // Blue: musket points LEFT (front is left)
                ctx.moveTo(radius * 0.6, 0);  // Start at right (back)
                ctx.lineTo(-radius * 0.8, 0); // End at left (front)
            } else {
                // Red: musket points RIGHT (front is right)
                ctx.moveTo(-radius * 0.6, 0); // Start at left (back)
                ctx.lineTo(radius * 0.8, 0);  // End at right (front)
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 3;
            ctx.stroke();
            // Barrel tip at the FRONT
            let barrelX = isBlueTeam ? -radius * 0.8 : radius * 0.8;
            ctx.beginPath();
            ctx.arc(barrelX, 0, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();
            ctx.restore();
        } else if (type === "cavalry") {
            ctx.save();
            ctx.translate(mouseX, mouseY);
            // BLUE TEAM FACES LEFT, RED TEAM FACES RIGHT
            if (isBlueTeam) {
                ctx.rotate(Math.PI); // 180 degrees - faces LEFT
            } else {
                ctx.rotate(0); // 0 degrees - faces RIGHT
            }
            // Horse head at the FRONT
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

    function saveOriginalPlacements() {
        originalCircles = circles.map(circle => ({
            x: circle.x, y: circle.y, team: circle.team, type: circle.type,
            health: circle.maxHealth, maxHealth: circle.maxHealth, radius: circle.radius,
            hasUsedFirstCharge: circle.type === 'cavalry' ? circle.hasUsedFirstCharge : undefined
        }));
        totalKills = 0; highestSingleDamage = 0;
    }

    function restoreOriginalPlacements() {
        circles = []; attackEffects = []; musketEffects = []; healingEffects = []; damageTexts = [];
        originalCircles.forEach(original => {
            let circle;
            if (original.type === 'soldier') {
                circle = new Soldier(original.x, original.y, original.team, canvas, baseUnitSize);
            } else if (original.type === 'tank') {
                circle = new Tank(original.x, original.y, original.team, canvas, baseUnitSize);
            } else if (original.type === 'healer') {
                circle = new Healer(original.x, original.y, original.team, canvas, baseUnitSize);
            } else if (original.type === 'musketeer') {
                circle = new Musketeer(original.x, original.y, original.team, canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE);
            } else if (original.type === 'cavalry') {
                circle = new Cavalry(original.x, original.y, original.team, canvas, baseUnitSize);
            }
            if (circle) {
                circle.health = original.maxHealth;
                circle.maxHealth = original.maxHealth;
                if (original.type === 'cavalry' && original.hasUsedFirstCharge === false) {
                    circle.hasUsedFirstCharge = false;
                    circle.lastCharge = performance.now() - circle.chargeCooldown - 10000;
                }
                circles.push(circle);
            }
        });
        gameRunning = false; showGhost = true; battleStartTime = 0; battleDuration = 0;
        totalKills = 0; highestSingleDamage = 0; playAgainHeaderBtn.style.display = 'none';
        updateStartPauseButton();
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
        } else {
            startPauseBtn.innerHTML = '▶️ Start';
            startPauseBtn.classList.remove('pause');
        }
    }

    function getCanvasMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if (event.type.includes('touch')) { clientX = event.touches[0].clientX; clientY = event.touches[0].clientY; }
        else { clientX = event.clientX; clientY = event.clientY; }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    function handleCanvasClick(x, y) {
        if (gameRunning) return;
        const radius = baseUnitSize * (Math.min(canvas.width, canvas.height) / 800);
        const withinBounds = x > mapPadding + radius && x < canvas.width - mapPadding - radius && y > mapPadding + radius && y < canvas.height - mapPadding - radius;
        if (!withinBounds) { showNotification('Cannot place outside battlefield', 'warning'); return; }

        if (placingMode === "soldier" || placingMode === "tank" || placingMode === "healer" || placingMode === "musketeer" || placingMode === "cavalry") {
            let type = placingMode; 
            let team = x < canvas.width/2 ? 'red' : 'blue';
            let blocked = circles.some(c => Math.hypot(c.x - x, c.y - y) < (c.radius + radius) * 0.8);
            
            if (!blocked) {
                let newUnit;
                if (type === "soldier") {
                    newUnit = new Soldier(x, y, team, canvas, baseUnitSize);
                } else if (type === "tank") {
                    newUnit = new Tank(x, y, team, canvas, baseUnitSize);
                } else if (type === "healer") {
                    newUnit = new Healer(x, y, team, canvas, baseUnitSize);
                } else if (type === "musketeer") {
                    newUnit = new Musketeer(x, y, team, canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE);
                } else if (type === "cavalry") {
                    newUnit = new Cavalry(x, y, team, canvas, baseUnitSize);
                }
                
                if (newUnit) {
                    circles.push(newUnit);
                    showNotification(`${type} placed`, 'info');
                }
            } else {
                showNotification('Space occupied', 'warning');
            }
        } else if (placingMode === "delete") {
            const beforeCount = circles.length;
            circles = circles.filter(c => Math.hypot(c.x - x, c.y - y) > c.radius);
            if (circles.length < beforeCount) showNotification('Unit deleted', 'warning');
        }
    }

    // Event Listeners setup
    function setupEventListeners() {
        canvas.addEventListener("mousemove", e => { const pos = getCanvasMousePos(e); mouseX = pos.x; mouseY = pos.y; });
        canvas.addEventListener("click", e => { const pos = getCanvasMousePos(e); handleCanvasClick(pos.x, pos.y); });
        canvas.addEventListener("touchmove", e => { e.preventDefault(); const pos = getCanvasMousePos(e); mouseX = pos.x; mouseY = pos.y; }, { passive: false });
        canvas.addEventListener("touchstart", e => { e.preventDefault(); const pos = getCanvasMousePos(e); handleCanvasClick(pos.x, pos.y); }, { passive: false });

        // Unit buttons
        document.querySelectorAll('.unit-controls button').forEach(btn => {
            if (btn.dataset.type) {
                btn.onclick = () => { 
                    placingMode = btn.dataset.type; 
                    showNotification(`Placing: ${btn.textContent.replace(/[^a-zA-Z]/g, '')}`, 'info'); 
                    showGhost = true; 
                    updateActiveButton();
                };
            }
        });

        // Control buttons
        document.getElementById("deleteTool").onclick = () => { 
            placingMode = "delete"; 
            showNotification("Delete Tool", 'warning'); 
            showGhost = false; 
            updateActiveButton();
        };
        
        document.getElementById("deleteAllBtn").onclick = () => {
            if (circles.length > 0) {
                circles = [];
                showNotification('All units deleted', 'warning');
            } else {
                showNotification('No units to delete', 'info');
            }
        };
        
        document.getElementById("startPauseBtn").onclick = () => {
            if (circles.length === 0) { 
                showNotification('Place units first', 'warning'); 
                return; 
            }
            
            if (!gameRunning) {
                // Start game
                if (battleStartTime === 0) saveOriginalPlacements();
                gameRunning = true; 
                showGhost = false;
                if (battleStartTime === 0) battleStartTime = performance.now();
                showNotification("Battle started", 'info');
                gameStatusEl.textContent = "Running";
            } else {
                // Pause game
                gameRunning = false; 
                showGhost = true; 
                showNotification("Battle paused", 'warning');
                gameStatusEl.textContent = "Paused";
            }
            
            updateStartPauseButton();
        };
        
        document.getElementById("autoPlaceBtn").onclick = () => {
            circles = []; 
            const padding = mapPadding + 30;
            
            // Red Team - Balanced composition
            for (let i = 0; i < 4; i++) {
                circles.push(new Soldier(
                    padding + Math.random() * (canvas.width/2 - padding*2), 
                    padding + Math.random() * (canvas.height - padding*2), 
                    'red', canvas, baseUnitSize
                ));
            }
            circles.push(new Tank(padding + 40, canvas.height/2 - 60, 'red', canvas, baseUnitSize));
            circles.push(new Tank(padding + 80, canvas.height/2 + 60, 'red', canvas, baseUnitSize));
            circles.push(new Healer(padding + 60, canvas.height/3, 'red', canvas, baseUnitSize));
            circles.push(new Healer(padding + 100, canvas.height*2/3, 'red', canvas, baseUnitSize));
            circles.push(new Musketeer(padding + 120, canvas.height/4, 'red', canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE));
            circles.push(new Musketeer(padding + 140, canvas.height*3/4, 'red', canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE));
            circles.push(new Cavalry(padding + 160, canvas.height/5, 'red', canvas, baseUnitSize));
            circles.push(new Cavalry(padding + 180, canvas.height*4/5, 'red', canvas, baseUnitSize));
            
            // Blue Team - Balanced composition
            for (let i = 0; i < 4; i++) {
                circles.push(new Soldier(
                    canvas.width/2 + padding + Math.random() * (canvas.width/2 - padding*2), 
                    padding + Math.random() * (canvas.height - padding*2), 
                    'blue', canvas, baseUnitSize
                ));
            }
            circles.push(new Tank(canvas.width - padding - 40, canvas.height/2 - 60, 'blue', canvas, baseUnitSize));
            circles.push(new Tank(canvas.width - padding - 80, canvas.height/2 + 60, 'blue', canvas, baseUnitSize));
            circles.push(new Healer(canvas.width - padding - 60, canvas.height/3, 'blue', canvas, baseUnitSize));
            circles.push(new Healer(canvas.width - padding - 100, canvas.height*2/3, 'blue', canvas, baseUnitSize));
            circles.push(new Musketeer(canvas.width - padding - 120, canvas.height/4, 'blue', canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE));
            circles.push(new Musketeer(canvas.width - padding - 140, canvas.height*3/4, 'blue', canvas, baseUnitSize, MUSKET_RANGE, BAYONET_RANGE));
            circles.push(new Cavalry(canvas.width - padding - 160, canvas.height/5, 'blue', canvas, baseUnitSize));
            circles.push(new Cavalry(canvas.width - padding - 180, canvas.height*4/5, 'blue', canvas, baseUnitSize));
            
            showNotification('Auto-placed armies', 'info');
        };
        
        playAgainHeaderBtn.onclick = () => { playAgain(); };
        playAgainBtn.onclick = () => { playAgain(); };
    }

    function gameLoop() {
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

        for (let c of circles) {
            let allies = circles.filter(x => x.team === c.team && x.health > 0);
            let enemies = circles.filter(x => x.team !== c.team && x.health > 0);
            
            // Apply separation (collision avoidance)
            c.applySeparation([...enemies, ...allies], mapPadding, canvas);
            
            // Update AI based on unit type
            if (c.type === 'healer') {
                c.updateAI(enemies, allies, gameRunning, healingEffects, damageTexts);
            } else if (c.type === 'musketeer') {
                c.updateAI(enemies, allies, gameRunning, getDirectionalDamageMultiplier, attackEffects, damageTexts, musketEffects, {value: highestSingleDamage});
            } else if (c.type === 'cavalry') {
                c.updateAI(enemies, allies, gameRunning, getDirectionalDamageMultiplier, attackEffects, damageTexts, {value: highestSingleDamage});
            } else {
                // Soldier and Tank use default combat AI
                if (enemies.length === 0) continue;
                let target = enemies.reduce((a, b) => c.distanceTo(a) < c.distanceTo(b) ? a : b);
                let dx = target.x - c.x, dy = target.y - c.y;
                let dist = Math.hypot(dx, dy);
                let desiredX = dx / dist, desiredY = dy / dist;
                let touchDistance = c.radius + target.radius + 1;
                
                if (dist > touchDistance) {
                    let speed = c.maxSpeed;
                    c.velX += (desiredX * speed - c.velX) * c.turnSpeed;
                    c.velY += (desiredY * speed - c.velY) * c.turnSpeed;
                    c.x += c.velX; c.y += c.velY;
                } else { c.velX *= 0.7; c.velY *= 0.7; }

                if (dist <= touchDistance && c.type !== 'healer') {
                    let now = performance.now();
                    if (now - c.lastAttack >= c.attackCooldown) {
                        const damageMultiplier = getDirectionalDamageMultiplier(c, target);
                        const actualDamage = Math.floor(c.attackPower * damageMultiplier);
                        const isCritical = damageMultiplier > 1.5;
                        target.health -= actualDamage; c.lastAttack = now; c.totalDamageDealt += actualDamage;
                        if (actualDamage > highestSingleDamage) highestSingleDamage = actualDamage;
                        damageTexts.push(new DamageText(target.x, target.y - target.radius - 8, actualDamage, false, isCritical));
                        attackEffects.push(new AttackEffect(target.x + (Math.random() - 0.5) * 8, target.y + (Math.random() - 0.5) * 8, c.team, isCritical));
                    }
                }
            }
            
            c.draw(ctx);
            if (c.health <= 0 && c.lastHealth > 0) totalKills++;
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
            }
        }
        requestAnimationFrame(gameLoop);
    }

    // Initialize
    function init() {
        showNotification('Click to place units', 'info');
        setupEventListeners();
        updateActiveButton();
        updateStartPauseButton();
        gameLoop();
    }

    // Start the game
    init();
}
