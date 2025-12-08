// characters/healer.js
class Healer {
    constructor(x, y, team, canvas, baseUnitSize) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.type = 'healer';
        
        const sizeMultiplier = Math.min(canvas.width, canvas.height) / 800;
        
        // STATS
        this.radius = baseUnitSize * sizeMultiplier;
        this.health = 80;
        this.maxHealth = 80;
        this.attackPower = 0;
        this.healPower = 6;
        this.healCooldown = 300;
        this.maxSpeed = 1.5 * sizeMultiplier;
        this.turnSpeed = 0.12;
        this.healRange = 60;
        this.currentHealTarget = null;
        
        // Common properties
        this.lastHeal = 0;
        this.velX = 0;
        this.velY = 0;
        this.id = Math.random().toString(36).substr(2, 9);
        this.facingAngle = team === 'blue' ? Math.PI : 0;
        this.lastHealth = this.health;
        this.totalDamageDealt = 0;
        this.kills = 0;
    }
    
    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x - 3, this.y - 3, 3, 
            this.x, this.y, this.radius
        );
        
        if (this.team === 'red') {
            gradient.addColorStop(0, '#f8c471');
            gradient.addColorStop(1, '#e67e22');
        } else {
            gradient.addColorStop(0, '#81ecec');
            gradient.addColorStop(1, '#00cec9');
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw cross
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius/2, this.y);
        ctx.lineTo(this.x + this.radius/2, this.y);
        ctx.moveTo(this.x, this.y - this.radius/2);
        ctx.lineTo(this.x, this.y + this.radius/2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
    
    updateAI(enemies, allies, gameRunning, healingEffects, damageTexts) {
        if (!gameRunning) return;
        
        // Find allies that need healing
        let healingCandidates = [];
        
        for (let ally of allies) {
            if (ally === this || ally.health <= 0) continue;
            
            let priority = 0;
            const healthPercent = ally.health / ally.maxHealth;
            
            // Base priority: lower health = higher priority
            priority += (1 - healthPercent) * 100;
            
            // Combat unit bonus
            if (ally.type !== 'healer') {
                priority += 50;
                
                if (ally.type === 'tank') priority += 30;
                if (ally.type === 'cavalry') priority += 20;
                
                // Check if ally is in combat
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
        
        // Sort by priority
        healingCandidates.sort((a, b) => b.priority - a.priority);
        
        if (healingCandidates.length > 0) {
            let target = healingCandidates[0].ally;
            let distToTarget = this.distanceTo(target);
            
            if (distToTarget > this.healRange + 5) {
                // Move toward target
                let dx = target.x - this.x, dy = target.y - this.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    const desiredX = dx / dist;
                    const desiredY = dy / dist;
                    const moveSpeed = Math.min(this.maxSpeed, distToTarget - this.healRange) * 0.7;
                    this.velX += (desiredX * moveSpeed - this.velX) * this.turnSpeed;
                    this.velY += (desiredY * moveSpeed - this.velY) * this.turnSpeed;
                    this.x += this.velX;
                    this.y += this.velY;
                }
            } else {
                // Within healing range
                this.velX *= 0.8;
                this.velY *= 0.8;
                let now = performance.now();
                if (now - this.lastHeal >= this.healCooldown) {
                    const healAmount = Math.min(this.healPower, target.maxHealth - target.health);
                    if (healAmount > 0) {
                        target.health += healAmount;
                        this.lastHeal = now;
                        
                        healingEffects.push({
                            startX: this.x, startY: this.y,
                            targetX: target.x, targetY: target.y,
                            amount: healAmount,
                            healingUnitId: target.id,
                            progress: 0, speed: 0.08, life: 1.0,
                            update: function() {
                                this.progress += this.speed;
                                this.life -= 0.01;
                                return this.progress <= 1.0 && this.life > 0;
                            }
                        });
                        
                        damageTexts.push({
                            x: target.x, y: target.y - target.radius - 10,
                            damage: healAmount, isHeal: true
                        });
                    }
                }
            }
        } else {
            // No one needs healing, stay behind front lines
            if (allies.length > 1) {
                let combatAllies = allies.filter(a => a !== this && a.type !== 'healer');
                if (combatAllies.length > 0) {
                    let avgX = 0, avgY = 0;
                    combatAllies.forEach(ally => { avgX += ally.x; avgY += ally.y; });
                    avgX /= combatAllies.length;
                    avgY /= combatAllies.length;
                    
                    let dx = avgX - this.x, dy = avgY - this.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > this.healRange * 0.7) {
                        const desiredX = dx / dist;
                        const desiredY = dy / dist;
                        this.velX += (desiredX * this.maxSpeed * 0.4 - this.velX) * this.turnSpeed;
                        this.velY += (desiredY * this.maxSpeed * 0.4 - this.velY) * this.turnSpeed;
                    }
                    this.x += this.velX;
                    this.y += this.velY;
                }
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Healer;
}
