import { Player, Enemy, ExpGem, TreasureBox, Projectile, VeggieProjectile, ShovelProjectile, Explosion, HoeEffect, Wheat } from './entities';
import { getDistance, RARITY_NAMES, RARITY_COLORS } from './constants';

const TILE_SIZE = 40;

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
    wheats: Wheat[] = [];

    // Tile-based farmland system: Set of "tx,ty" strings for cultivated tiles
    cultivatedTiles = new Set<string>();

    timers = { hoe: 0, veggie: 0, mushroom: 0, shovel: 0 };
    frameCount = 0;
    timeElapsed = 0;
    enemySpawnRate = 60;
    enemySpawnTimer = 0;

    // Pending wheat to plant (accumulated from EXP gains)
    pendingWheatCount = 0;

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

        // Cultivate initial area around player spawn (radius ~3 tiles)
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                if (dx * dx + dy * dy <= 10) {
                    this.cultivatedTiles.add(`${dx},${dy}`);
                }
            }
        }
    }

    tileKey(x: number, y: number): string {
        return `${Math.floor(x / TILE_SIZE)},${Math.floor(y / TILE_SIZE)}`;
    }

    isTileCultivated(worldX: number, worldY: number): boolean {
        return this.cultivatedTiles.has(this.tileKey(worldX, worldY));
    }

    cultivateArea(cx: number, cy: number, radius: number) {
        const tileRadius = Math.ceil(radius / TILE_SIZE);
        const centerTX = Math.floor(cx / TILE_SIZE);
        const centerTY = Math.floor(cy / TILE_SIZE);
        for (let dx = -tileRadius; dx <= tileRadius; dx++) {
            for (let dy = -tileRadius; dy <= tileRadius; dy++) {
                const dist = Math.sqrt(dx * dx + dy * dy) * TILE_SIZE;
                if (dist <= radius) {
                    this.cultivatedTiles.add(`${centerTX + dx},${centerTY + dy}`);
                }
            }
        }
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

    // Plant wheat on random cultivated tiles
    plantWheat(count: number) {
        const cultivatedArr = Array.from(this.cultivatedTiles);
        if (cultivatedArr.length === 0) return;

        for (let i = 0; i < count; i++) {
            // Try to find a cultivated tile that doesn't already have wheat
            let attempts = 0;
            while (attempts < 20) {
                const tileStr = cultivatedArr[Math.floor(Math.random() * cultivatedArr.length)];
                const [tx, ty] = tileStr.split(',').map(Number);
                const wx = tx * TILE_SIZE + TILE_SIZE / 2 + (Math.random() - 0.5) * 20;
                const wy = ty * TILE_SIZE + TILE_SIZE / 2 + (Math.random() - 0.5) * 20;

                // Check no wheat already nearby
                const tooClose = this.wheats.some(w => !w.harvested && getDistance(w.x, w.y, wx, wy) < 25);
                if (!tooClose) {
                    this.wheats.push(new Wheat(wx, wy));
                    break;
                }
                attempts++;
            }
        }
    }

    handleWeapons() {
        // 1. Hoe - also cultivates ground and harvests wheat
        const hoe = this.player.weapons.hoe;
        if (hoe.level > 0) {
            this.timers.hoe++;
            if (this.timers.hoe >= Math.max(30, 90 - hoe.level * 10)) {
                this.timers.hoe = 0;
                const range = 70 + hoe.level * 15;
                const damage = 20 + hoe.level * 10;
                this.effects.push(new HoeEffect(this.player.x, this.player.y, range, hoe.level));

                // Cultivate ground in hoe range
                this.cultivateArea(this.player.x, this.player.y, range);

                // Damage enemies
                for (const enemy of this.enemies) {
                    if (getDistance(this.player.x, this.player.y, enemy.x, enemy.y) <= range + enemy.radius) {
                        enemy.hp -= damage;
                        if (hoe.level >= 3) {
                            const ang = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                            enemy.x += Math.cos(ang) * 40; enemy.y += Math.sin(ang) * 40;
                        }
                    }
                }

                // Harvest mature wheat in range
                let harvestedCount = 0;
                for (const wheat of this.wheats) {
                    if (!wheat.harvested && wheat.isMature &&
                        getDistance(this.player.x, this.player.y, wheat.x, wheat.y) <= range) {
                        wheat.harvested = true;
                        harvestedCount++;
                    }
                }
                // Each harvested wheat triggers a level-up / skill selection
                if (harvestedCount > 0) {
                    this.player.score += harvestedCount * 50;
                    // Queue level ups for harvested wheat
                    // We trigger one at a time; queue remaining
                    this.pendingWheatCount += harvestedCount - 1;
                    this.levelUp();
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

    // Check if a position is on cultivated ground (with some tolerance)
    canMoveTo(x: number, y: number): boolean {
        // Check the 4 corners of the player's bounding box
        const r = this.player.radius * 0.6;
        return this.isTileCultivated(x - r, y - r) ||
            this.isTileCultivated(x + r, y - r) ||
            this.isTileCultivated(x - r, y + r) ||
            this.isTileCultivated(x + r, y + r) ||
            this.isTileCultivated(x, y);
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

        // Save old position for collision with uncultivated ground
        const oldX = this.player.x;
        const oldY = this.player.y;
        this.player.update(this.keys, this.camera, this.canvas);

        // Movement restriction: can only walk on cultivated tiles
        if (!this.canMoveTo(this.player.x, this.player.y)) {
            // Try sliding along axes
            if (this.canMoveTo(this.player.x, oldY)) {
                this.player.y = oldY;
                this.camera.y = this.player.y - this.canvas.height / 2;
            } else if (this.canMoveTo(oldX, this.player.y)) {
                this.player.x = oldX;
                this.camera.x = this.player.x - this.canvas.width / 2;
            } else {
                this.player.x = oldX;
                this.player.y = oldY;
                this.camera.x = this.player.x - this.canvas.width / 2;
                this.camera.y = this.player.y - this.canvas.height / 2;
            }
            this.player.isMouseMoving = false;
        }

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

        // EXP collection → plant wheat instead of direct level up
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
                    this.player.level++;
                    this.player.maxExp = Math.floor(this.player.maxExp * 1.5);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
                    // Plant wheat! More wheat at higher levels
                    const wheatCount = 2 + Math.floor(this.player.level / 2);
                    this.plantWheat(wheatCount);
                }
            } else if (dist < magnetRange) {
                const ang = Math.atan2(this.player.y - gem.y, this.player.x - gem.x);
                gem.x += Math.cos(ang) * 6; gem.y += Math.sin(ang) * 6;
            }
        }

        // Update wheat
        for (const wheat of this.wheats) {
            wheat.update();
        }
        // Clean up old harvested wheat
        this.wheats = this.wheats.filter(w => !w.harvested || w.age < w.maxAge + 60);

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

            // Count mature wheat
            const matureWheat = this.wheats.filter(w => w.isMature && !w.harvested).length;

            this.onStateChange?.({
                hp: this.player.hp, maxHp: this.player.maxHp,
                exp: this.player.exp, maxExp: this.player.maxExp,
                level: this.player.level, score: this.player.score,
                timeStr: `${m}:${s}`,
                matureWheat
            });
        }
    }

    drawBackground() {
        const ctx = this.ctx;
        const camX = this.camera.x;
        const camY = this.camera.y;

        // Fill entire screen with uncultivated soil (hard/dry ground)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw uncultivated ground texture (cracked dry earth pattern)
        const startTX = Math.floor(camX / TILE_SIZE) - 1;
        const startTY = Math.floor(camY / TILE_SIZE) - 1;
        const endTX = startTX + Math.ceil(this.canvas.width / TILE_SIZE) + 2;
        const endTY = startTY + Math.ceil(this.canvas.height / TILE_SIZE) + 2;

        for (let tx = startTX; tx <= endTX; tx++) {
            for (let ty = startTY; ty <= endTY; ty++) {
                const screenX = tx * TILE_SIZE - camX;
                const screenY = ty * TILE_SIZE - camY;
                const key = `${tx},${ty}`;

                if (this.cultivatedTiles.has(key)) {
                    // Cultivated tile - rich dark soil with furrow lines
                    ctx.fillStyle = '#5c3d1e';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    // Furrow lines (horizontal)
                    ctx.strokeStyle = '#4a2e14';
                    ctx.lineWidth = 1;
                    for (let fy = 0; fy < TILE_SIZE; fy += 8) {
                        ctx.beginPath();
                        ctx.moveTo(screenX, screenY + fy);
                        ctx.lineTo(screenX + TILE_SIZE, screenY + fy);
                        ctx.stroke();
                    }

                    // Lighter soil clumps
                    const hash = Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453;
                    const r = hash - Math.floor(hash);
                    if (r > 0.6) {
                        ctx.fillStyle = '#6b4830';
                        ctx.beginPath();
                        ctx.arc(screenX + TILE_SIZE * r, screenY + TILE_SIZE * (1 - r), 3, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Subtle tile border (cultivated area edge)
                    ctx.strokeStyle = 'rgba(92, 61, 30, 0.3)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                } else {
                    // Uncultivated - dry hard ground with random texture
                    const hash = Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453;
                    const r = hash - Math.floor(hash);

                    // Slight color variation per tile
                    const shade = Math.floor(r * 20) - 10;
                    const baseR = 139 + shade;
                    const baseG = 115 + shade;
                    const baseB = 85 + shade;
                    ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                    // Small rocks/pebbles
                    if (r > 0.7) {
                        ctx.fillStyle = '#9a8a72';
                        ctx.beginPath();
                        ctx.ellipse(screenX + TILE_SIZE * 0.3, screenY + TILE_SIZE * 0.6, 4, 3, r * 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    // Dry cracks
                    if (r > 0.4 && r < 0.6) {
                        ctx.strokeStyle = 'rgba(100, 80, 50, 0.3)';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(screenX + 5, screenY + 5);
                        ctx.lineTo(screenX + TILE_SIZE * r, screenY + TILE_SIZE * (1 - r));
                        ctx.lineTo(screenX + TILE_SIZE - 5, screenY + TILE_SIZE - 10);
                        ctx.stroke();
                    }
                    // Occasional small weeds/grass tufts
                    if (r > 0.85) {
                        ctx.strokeStyle = '#7a8a4a';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(screenX + 20, screenY + TILE_SIZE - 2);
                        ctx.lineTo(screenX + 18, screenY + TILE_SIZE - 10);
                        ctx.moveTo(screenX + 22, screenY + TILE_SIZE - 2);
                        ctx.lineTo(screenX + 25, screenY + TILE_SIZE - 8);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw border glow around cultivated area edge tiles
        ctx.lineWidth = 2;
        for (let tx = startTX; tx <= endTX; tx++) {
            for (let ty = startTY; ty <= endTY; ty++) {
                const key = `${tx},${ty}`;
                if (!this.cultivatedTiles.has(key)) continue;

                const screenX = tx * TILE_SIZE - camX;
                const screenY = ty * TILE_SIZE - camY;

                // Check each neighbor - if uncultivated, draw border on that side
                ctx.strokeStyle = 'rgba(139, 90, 43, 0.6)';
                if (!this.cultivatedTiles.has(`${tx},${ty - 1}`)) {
                    ctx.beginPath(); ctx.moveTo(screenX, screenY); ctx.lineTo(screenX + TILE_SIZE, screenY); ctx.stroke();
                }
                if (!this.cultivatedTiles.has(`${tx},${ty + 1}`)) {
                    ctx.beginPath(); ctx.moveTo(screenX, screenY + TILE_SIZE); ctx.lineTo(screenX + TILE_SIZE, screenY + TILE_SIZE); ctx.stroke();
                }
                if (!this.cultivatedTiles.has(`${tx - 1},${ty}`)) {
                    ctx.beginPath(); ctx.moveTo(screenX, screenY); ctx.lineTo(screenX, screenY + TILE_SIZE); ctx.stroke();
                }
                if (!this.cultivatedTiles.has(`${tx + 1},${ty}`)) {
                    ctx.beginPath(); ctx.moveTo(screenX + TILE_SIZE, screenY); ctx.lineTo(screenX + TILE_SIZE, screenY + TILE_SIZE); ctx.stroke();
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();

        // Draw wheat (before entities so they appear behind characters)
        this.wheats.forEach(w => w.draw(this.ctx, this.camera));

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
        // Check if there are pending wheat harvests
        if (this.pendingWheatCount > 0) {
            this.pendingWheatCount--;
            // Trigger next level up after a short delay
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.levelUp();
                }
            }, 300);
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
        for (let i = 0; i < numUpgrades; i++) {
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
