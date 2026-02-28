import { Player, Enemy, ExpGem, TreasureBox, Projectile, VeggieProjectile, ShovelProjectile, Explosion, HoeEffect } from './entities';
import { getDistance, RARITY_NAMES, RARITY_COLORS } from './constants';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    state: 'playing' | 'paused' | 'gameover' = 'playing';
    
    player: Player;
    enemies: Enemy[] = [];
    gems: ExpGem[] = [];
    projectiles: Projectile[] = [];
    effects: HoeEffect[] = [];
    explosions: Explosion[] = [];
    treasureBoxes: TreasureBox[] = [];
    
    timers = { hoe: 0, veggie: 0, mushroom: 0, shovel: 0 };
    frameCount = 0;
    timeElapsed = 0;
    enemySpawnRate = 60;
    enemySpawnTimer = 0;
    
    camera = { x: 0, y: 0 };
    keys: Record<string, boolean> = {};
    animationFrameId = 0;

    onStateChange?: (state: any) => void;
    onLevelUp?: (options: any[]) => void;
    onTreasure?: (content: any) => void;
    onGameOver?: () => void;
    onStageClear?: (score: number) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.player = new Player();
    }

    init() {
        const handleKeyDown = (e: KeyboardEvent) => { this.keys[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { this.keys[e.key] = false; };
        
        const setTarget = (e: MouseEvent | TouchEvent) => {
            if (this.state !== 'playing') return;
            e.preventDefault();
            let cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            let cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            this.player.targetX = cx + this.camera.x;
            this.player.targetY = cy + this.camera.y;
            this.player.isMouseMoving = true;
        };
        const stopMove = () => { this.player.isMouseMoving = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        this.canvas.addEventListener('mousedown', setTarget);
        this.canvas.addEventListener('mousemove', (e) => { if (e.buttons > 0) setTarget(e); });
        this.canvas.addEventListener('mouseup', stopMove);
        this.canvas.addEventListener('touchstart', setTarget, { passive: false });
        this.canvas.addEventListener('touchmove', setTarget, { passive: false });
        this.canvas.addEventListener('touchend', stopMove);

        this.loop();
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
    }

    spawnEnemy(type?: string) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(this.canvas.width, this.canvas.height) / 2 + 100;
        const sx = this.player.x + Math.cos(angle) * dist;
        const sy = this.player.y + Math.sin(angle) * dist;
        
        if (!type) {
            type = (Math.random() > 0.8 - (this.timeElapsed * 0.002)) ? 'crow' : 'worm';
        }
        this.enemies.push(new Enemy(sx, sy, type));
    }

    handleWeapons() {
        // 1. Hoe
        const hoe = this.player.weapons.hoe;
        if (hoe.level > 0) {
            this.timers.hoe++;
            if (this.timers.hoe >= Math.max(30, 90 - hoe.level * 10)) {
                this.timers.hoe = 0;
                const range = 70 + hoe.level * 15;
                const damage = 20 + hoe.level * 10;
                this.effects.push(new HoeEffect(this.player.x, this.player.y, range, hoe.level));
                for (const enemy of this.enemies) {
                    if (getDistance(this.player.x, this.player.y, enemy.x, enemy.y) <= range + enemy.radius) {
                        enemy.hp -= damage;
                        if (hoe.level >= 3) {
                            const ang = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                            enemy.x += Math.cos(ang) * 40; enemy.y += Math.sin(ang) * 40;
                        }
                    }
                }
            }
        }

        // 2. Veggie
        const veggie = this.player.weapons.veggie;
        if (veggie.level > 0 && this.enemies.length > 0) {
            this.timers.veggie++;
            if (this.timers.veggie >= Math.max(10, 60 - veggie.level * 8)) {
                this.timers.veggie = 0;
                let closest = null; let minDist = Infinity;
                for (const enemy of this.enemies) {
                    const dist = getDistance(this.player.x, this.player.y, enemy.x, enemy.y);
                    if (dist < minDist && dist < 600) { minDist = dist; closest = enemy; }
                }
                if (closest) {
                    const pierce = veggie.level >= 3 ? veggie.level - 2 : 0;
                    const dmg = 15 + veggie.level * 8;
                    this.projectiles.push(new VeggieProjectile(this.player.x, this.player.y, closest.x, closest.y, veggie.level, dmg, 8, '#f97316', pierce));
                }
            }
        }

        // 3. Mushroom (Explosion)
        const mushroom = this.player.weapons.mushroom;
        if (mushroom.level > 0) {
            this.timers.mushroom++;
            if (this.timers.mushroom >= Math.max(40, 150 - mushroom.level * 20)) {
                this.timers.mushroom = 0;
                const num = 2 + Math.floor(mushroom.level / 2);
                const dmg = 30 + mushroom.level * 15;
                const radius = 60 + mushroom.level * 10;
                for (let i = 0; i < num; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 150;
                    const ex = this.player.x + Math.cos(angle) * dist;
                    const ey = this.player.y + Math.sin(angle) * dist;
                    this.explosions.push(new Explosion(ex, ey, radius, dmg));
                }
            }
        }

        // 4. Shovel
        const shovel = this.player.weapons.shovel;
        if (shovel.level > 0) {
            this.timers.shovel++;
            if (this.timers.shovel >= Math.max(40, 120 - shovel.level * 15)) {
                this.timers.shovel = 0;
                const dmg = 25 + shovel.level * 12;
                const pierce = 2 + shovel.level;
                const num = 1 + Math.floor(shovel.level / 3);
                for (let i = 0; i < num; i++) {
                    const angleOffset = (i - (num - 1) / 2) * 0.2;
                    this.projectiles.push(new ShovelProjectile(this.player.x, this.player.y, this.player.facingAngle + angleOffset, shovel.level, dmg, pierce));
                }
            }
        }
    }

    update() {
        if (this.state !== 'playing') return;

        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.timeElapsed++;
            
            if (this.timeElapsed === 60 || this.timeElapsed === 120) this.spawnEnemy('elite');
            if (this.timeElapsed === 180) {
                this.spawnEnemy('boss');
                this.enemies = this.enemies.filter(e => e.isElite || e.isBoss);
            }
        }

        this.player.update(this.keys, this.camera, this.canvas);

        this.enemySpawnTimer++;
        let currentRate = this.timeElapsed >= 180 ? 90 : this.enemySpawnRate;
        if (this.enemySpawnTimer >= currentRate) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
            if (this.enemySpawnRate > 15) this.enemySpawnRate -= 0.2;
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update();
            
            if ((proj.life !== undefined && proj.life <= 0) || 
                getDistance(this.player.x, this.player.y, proj.x, proj.y) > 1000) {
                this.projectiles.splice(i, 1);
                continue;
            }

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (proj.hitEnemies.has(enemy)) continue;

                if (getDistance(proj.x, proj.y, enemy.x, enemy.y) < proj.radius + enemy.radius) {
                    enemy.hp -= proj.damage;
                    proj.hitEnemies.add(enemy);
                    if (proj.pierce > 0) { proj.pierce--; } 
                    else { this.projectiles.splice(i, 1); break; }
                }
            }
        }

        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(this.enemies);
            if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.player.x, this.player.y);

            if (enemy.hp <= 0) {
                if (enemy.isElite || enemy.isBoss) {
                    this.treasureBoxes.push(new TreasureBox(enemy.x, enemy.y));
                    if (enemy.isBoss) {
                        this.player.score += 5000;
                        // Stage Clear after a short delay
                        setTimeout(() => {
                            this.state = 'paused';
                            this.onStageClear?.(this.player.score);
                        }, 2000);
                    }
                } else {
                    this.gems.push(new ExpGem(enemy.x, enemy.y));
                }
                this.enemies.splice(i, 1);
                continue;
            }

            if (getDistance(this.player.x, this.player.y, enemy.x, enemy.y) < this.player.radius + enemy.radius) {
                this.player.hp -= enemy.damage * 0.05;
                if (this.player.hp <= 0) {
                    this.player.hp = 0;
                    this.state = 'gameover';
                    this.onGameOver?.();
                }
                const ang = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                this.player.x += Math.cos(ang) * 1; this.player.y += Math.sin(ang) * 1;
            }
        }

        const magnetRange = 80;
        for (let i = this.gems.length - 1; i >= 0; i--) {
            const gem = this.gems[i];
            const dist = getDistance(this.player.x, this.player.y, gem.x, gem.y);
            if (dist < this.player.radius) {
                this.player.exp += gem.value;
                this.player.score += 10;
                this.gems.splice(i, 1);
                if (this.player.exp >= this.player.maxExp) {
                    this.player.exp -= this.player.maxExp;
                    this.levelUp();
                }
            } else if (dist < magnetRange) {
                const ang = Math.atan2(this.player.y - gem.y, this.player.x - gem.x);
                gem.x += Math.cos(ang) * 6; gem.y += Math.sin(ang) * 6;
            }
        }

        for (let i = this.treasureBoxes.length - 1; i >= 0; i--) {
            const box = this.treasureBoxes[i];
            if (getDistance(this.player.x, this.player.y, box.x, box.y) < this.player.radius + box.radius) {
                this.openTreasure();
                this.treasureBoxes.splice(i, 1);
            }
        }

        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].update();
            if (this.effects[i].life <= 0) this.effects.splice(i, 1);
        }

        this.handleWeapons();

        if (this.frameCount % 5 === 0) {
            const m = Math.floor(this.timeElapsed / 60).toString().padStart(2, '0');
            const s = (this.timeElapsed % 60).toString().padStart(2, '0');
            this.onStateChange?.({
                hp: this.player.hp, maxHp: this.player.maxHp,
                exp: this.player.exp, maxExp: this.player.maxExp,
                level: this.player.level, score: this.player.score,
                timeStr: `${m}:${s}`
            });
        }
    }

    drawBackground() {
        const size = 100;
        const sx = Math.floor(this.camera.x / size) * size;
        const sy = Math.floor(this.camera.y / size) * size;
        
        this.ctx.fillStyle = '#84cc16';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#65a30d';
        for (let x = sx; x < sx + this.canvas.width + size; x += size) {
            this.ctx.fillRect(x - this.camera.x, 0, 4, this.canvas.height);
        }
        for (let y = sy; y < sy + this.canvas.height + size; y += size) {
            this.ctx.fillRect(0, y - this.camera.y, this.canvas.width, 4);
        }

        this.ctx.fillStyle = '#a16207';
        for (let x = sx - size; x < sx + this.canvas.width + size; x += size) {
            for (let y = sy - size; y < sy + this.canvas.height + size; y += size) {
                const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
                if (hash - Math.floor(hash) > 0.8) {
                    this.ctx.beginPath();
                    this.ctx.ellipse(x - this.camera.x + 50, y - this.camera.y + 50, 40, 20, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        this.treasureBoxes.forEach(b => b.draw(this.ctx, this.camera));
        this.gems.forEach(g => g.draw(this.ctx, this.camera));
        this.effects.forEach(e => e.draw(this.ctx, this.camera));
        this.explosions.forEach(e => e.draw(this.ctx, this.camera));
        
        this.enemies.sort((a, b) => a.y - b.y).forEach(e => e.draw(this.ctx, this.camera));
        this.projectiles.forEach(p => p.draw(this.ctx, this.camera));
        this.player.draw(this.ctx, this.camera);
    }

    loop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    levelUp() {
        this.player.level++;
        this.player.maxExp = Math.floor(this.player.maxExp * 1.5);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
        
        this.state = 'paused';
        this.player.isMouseMoving = false;
        
        const available = Object.keys(this.player.weapons).filter(k => this.player.weapons[k].level < 5);
        let options = [];
        if (available.length > 0) {
            available.sort(() => 0.5 - Math.random());
            options = available.slice(0, 3).map(key => {
                const w = this.player.weapons[key];
                return {
                    key,
                    title: `${w.name} を ${w.level === 0 ? '取得' : '強化'}`,
                    desc: `レアリティ: ${RARITY_NAMES[w.level + 1]}<br/>${w.desc}`,
                    nextLevel: w.level + 1
                };
            });
        }
        this.onLevelUp?.(options);
    }

    upgradeWeapon(key: string) {
        if (key !== 'max' && this.player.weapons[key]) {
            this.player.weapons[key].level++;
        }
    }

    openTreasure() {
        this.state = 'paused';
        this.player.isMouseMoving = false;
        
        const r = Math.random();
        let numUpgrades = 1, rarity = 1, title = '緑の宝箱（1枠強化）';
        if (r < 0.60) {
            numUpgrades = 1;
        } else if (r < 0.90) {
            numUpgrades = 3; rarity = 2; title = '青の宝箱（3枠強化）';
        } else {
            numUpgrades = 5; rarity = 4; title = '金の宝箱（5枠強化！）';
        }

        const results = [];
        for(let i=0; i<numUpgrades; i++) {
            const upgradeable = Object.keys(this.player.weapons).filter(k => this.player.weapons[k].level < 5);
            if (upgradeable.length === 0) {
                results.push({ text: '💰 ボーナス金貨獲得！ (+500点)', color: '#facc15' });
                this.player.score += 500;
                continue;
            }
            const key = upgradeable[Math.floor(Math.random() * upgradeable.length)];
            this.player.weapons[key].level++;
            const w = this.player.weapons[key];
            results.push({
                text: `${w.name} が Lv${w.level} (${RARITY_NAMES[w.level]}) に強化！`,
                level: w.level
            });
        }

        this.onTreasure?.({ title, rarity, results });
    }

    resume() {
        this.state = 'playing';
    }
}
