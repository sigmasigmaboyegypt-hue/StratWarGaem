// characters/tank.js
class Tank {
    constructor(x, y, team, canvas, baseUnitSize) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.type = 'tank';
        
        const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
        
        // STATS
        this.radius = baseUnitSize * 1.4 * sizeMultiplier;
        this.health = 200;
        this.maxHealth = 200;
        this.attackPower = 19;
        this.attackCooldown = 800;
        this.maxSpeed = 1.0 * sizeMultiplier;
        this.turnSpeed = 0.1;
        
        // Common properties
        this.lastAttack = 0;
        this.velX = 0;
        this.velY = 0;
        this.id = Math.random().toString(36).substr(2, 9);
        this.facingAngle = team === 'blue' ? Math.PI : 0;
        this.lastHealth = this.health;
        this.totalDamageDealt = 0;
        this.kills = 0;
    }
    
    draw(ctx) {
        if (Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1) {
            this.facingAngle = Math.atan2(this.velY, this.velX);
        }
        
        const gradient = ctx.createRadialGradient(
            this.x - 3, this.y - 3, 3, 
            this.x, this.y, this.radius
        );
        
        if (this.team === 'red') {
            gradient.addColorStop(0, '#ff7979');
            gradient.addColorStop(1, '#c0392b');
        } else {
            gradient.addColorStop(0, '#7ed6df');
            gradient.addColorStop(1, '#2980b9');
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw tank turret
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.facingAngle);
        ctx.fillStyle = this.team === 'red' ? '#e74c3c' : '#3498db';
        ctx.fillRect(-this.radius * 0.3, -this.radius * 0.2, this.radius * 0.6, this.radius * 0.4);
        ctx.restore();
        
        // Health bar
        const barWidth = this.radius * 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, 4);
        
        const healthPercent = this.health / this.maxHealth;
        let healthColor;
        if (healthPercent > 0.6) healthColor = '#2ecc71';
        else if (healthPercent > 0.3) healthColor = '#f39c12';
        else healthColor = '#e74c3c';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * healthPercent, 4);
    }
    
    distanceTo(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }
    
    applySeparation(alliesAndEnemies, mapPadding, canvas) {
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
        this.x += pushX;
        this.y += pushY;
        this.x = Math.max(mapPadding + this.radius, Math.min(canvas.width - mapPadding - this.radius, this.x));
        this.y = Math.max(mapPadding + this.radius, Math.min(canvas.height - mapPadding - this.radius, this.y));
    }
    
    updateAI(enemies, allies, gameRunning, getDirectionalDamageMultiplier, attackEffects, damageTexts, highestSingleDamage) {
        if (!gameRunning) return;
        
        // Find closest enemy
        if (enemies.length === 0) return;
        let target = enemies.reduce((a, b) => this.distanceTo(a) < this.distanceTo(b) ? a : b);
        let dx = target.x - this.x, dy = target.y - this.y;
        let dist = Math.hypot(dx, dy);
        let desiredX = dx / dist, desiredY = dy / dist;
        let touchDistance = this.radius + target.radius + 1;
        
        // Movement
        if (dist > touchDistance) {
            let speed = this.maxSpeed;
            this.velX += (desiredX * speed - this.velX) * this.turnSpeed;
            this.velY += (desiredY * speed - this.velY) * this.turnSpeed;
            this.x += this.velX;
            this.y += this.velY;
        } else {
            this.velX *= 0.7;
            this.velY *= 0.7;
        }
        
        // Attack
        if (dist <= touchDistance) {
            let now = performance.now();
            if (now - this.lastAttack >= this.attackCooldown) {
                const damageMultiplier = getDirectionalDamageMultiplier(this, target);
                const actualDamage = Math.floor(this.attackPower * damageMultiplier);
                const isCritical = damageMultiplier > 1.5;
                target.health -= actualDamage;
                this.lastAttack = now;
                this.totalDamageDealt += actualDamage;
                if (actualDamage > highestSingleDamage.value) highestSingleDamage.value = actualDamage;
                
                damageTexts.push({
                    x: target.x, y: target.y - target.radius - 8, 
                    damage: actualDamage, isHeal: false, isCritical: isCritical
                });
                
                attackEffects.push({
                    x: target.x + (Math.random() - 0.5) * 8,
                    y: target.y + (Math.random() - 0.5) * 8,
                    team: this.team,
                    isCritical: isCritical,
                    draw: function(ctx) {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, isCritical ? 8 : 6, 0, Math.PI * 2);
                        ctx.fillStyle = this.team === 'red' ? 
                            (isCritical ? 'rgba(231, 76, 60, 0.8)' : 'rgba(192, 57, 43, 0.8)') :
                            (isCritical ? 'rgba(52, 152, 219, 0.8)' : 'rgba(41, 128, 185, 0.8)');
                        ctx.fill();
                        return true;
                    }
                });
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tank;
}
