import { getDistance, RARITY_COLORS } from './constants';

export class Player {
    x = 0; y = 0;
    speed = 3.5;
    radius = 20;
    maxHp = 100; hp = 100;
    targetX = 0; targetY = 0;
    isMouseMoving = false;
    facingAngle = 0;

    level = 1; exp = 0; maxExp = 10; score = 0;

    weapons: Record<string, { level: number, name: string, desc: string }> = {
        hoe: { level: 1, name: '大クワ振り', desc: '周囲の敵をなぎ払う' },
        veggie: { level: 0, name: '野菜投げ', desc: '一番近い敵に野菜を投げる' },
        mushroom: { level: 0, name: '爆発キノコ', desc: '周囲に爆発するキノコを落とす' },
        shovel: { level: 0, name: 'シャベル突撃', desc: '向いている方向にシャベルを飛ばす' }
    };

    update(keys: Record<string, boolean>, camera: { x: number, y: number }, canvas: HTMLCanvasElement) {
        let dx = 0; let dy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const dist = Math.hypot(dx, dy);
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            this.isMouseMoving = false;
            this.facingAngle = Math.atan2(dy, dx);
        } else if (this.isMouseMoving) {
            const mx = this.targetX - this.x;
            const my = this.targetY - this.y;
            const mdist = Math.hypot(mx, my);
            if (mdist > this.speed) {
                this.x += (mx / mdist) * this.speed;
                this.y += (my / mdist) * this.speed;
                this.facingAngle = Math.atan2(my, mx);
            } else {
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMouseMoving = false;
            }
        }

        camera.x = this.x - canvas.width / 2;
        camera.y = this.y - canvas.height / 2;
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;
        ctx.save();
        ctx.translate(drawX, drawY);
        if (Math.abs(this.facingAngle) > Math.PI / 2) ctx.scale(-1, 1);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath(); ctx.ellipse(0, 28, 20, 7, 0, 0, Math.PI * 2); ctx.fill();

        // Legs (straw sticking out from bottom of overalls)
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(-10, 18, 6, 10);
        ctx.fillRect(4, 18, 6, 10);
        // Straw tufts at feet
        ctx.strokeStyle = '#c8962e'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-9, 28); ctx.lineTo(-12, 32);
        ctx.moveTo(-7, 28); ctx.lineTo(-7, 33);
        ctx.moveTo(-5, 28); ctx.lineTo(-3, 31);
        ctx.moveTo(5, 28); ctx.lineTo(3, 32);
        ctx.moveTo(7, 28); ctx.lineTo(7, 33);
        ctx.moveTo(9, 28); ctx.lineTo(12, 31);
        ctx.stroke();

        // Overalls (Blue denim)
        ctx.fillStyle = '#4a90d9';
        // Main body
        ctx.beginPath();
        ctx.moveTo(-14, -2); ctx.lineTo(-14, 20); ctx.lineTo(14, 20); ctx.lineTo(14, -2);
        ctx.closePath(); ctx.fill();
        // Straps
        ctx.fillRect(-11, -12, 6, 12);
        ctx.fillRect(5, -12, 6, 12);
        // Buttons on straps
        ctx.fillStyle = '#2563eb';
        ctx.beginPath(); ctx.arc(-8, -3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -3, 2, 0, Math.PI * 2); ctx.fill();
        // Seam line
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 20); ctx.stroke();

        // Purple Patch on overalls
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-9, 8, 8, 8);
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1;
        ctx.strokeRect(-9, 8, 8, 8);
        // Stitch marks on patch
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-8, 10); ctx.lineTo(-8, 14);
        ctx.moveTo(-6, 10); ctx.lineTo(-6, 14);
        ctx.moveTo(-4, 10); ctx.lineTo(-4, 14);
        ctx.stroke();

        // Shirt (Red Plaid)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-15, -16, 30, 16);
        // Plaid pattern - horizontal
        ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, -12); ctx.lineTo(15, -12);
        ctx.moveTo(-15, -6); ctx.lineTo(15, -6);
        ctx.stroke();
        // Plaid pattern - vertical
        ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8, -16); ctx.lineTo(-8, 0);
        ctx.moveTo(0, -16); ctx.lineTo(0, 0);
        ctx.moveTo(8, -16); ctx.lineTo(8, 0);
        ctx.stroke();

        // Arms (straw colored sticks)
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-15, -10); ctx.lineTo(-28, -4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, -10); ctx.lineTo(28, -4);
        ctx.stroke();

        // Red plaid sleeves on arms
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-15, -10); ctx.lineTo(-20, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, -10); ctx.lineTo(20, -8);
        ctx.stroke();
        ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-16, -11); ctx.lineTo(-20, -9);
        ctx.moveTo(-16, -9); ctx.lineTo(-20, -7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, -11); ctx.lineTo(20, -9);
        ctx.moveTo(16, -9); ctx.lineTo(20, -7);
        ctx.stroke();

        // Straw tufts at hands
        ctx.strokeStyle = '#c8962e'; ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-28, -4); ctx.lineTo(-32, -8);
        ctx.moveTo(-28, -4); ctx.lineTo(-33, -3);
        ctx.moveTo(-28, -4); ctx.lineTo(-31, 1);
        ctx.moveTo(28, -4); ctx.lineTo(32, -8);
        ctx.moveTo(28, -4); ctx.lineTo(33, -3);
        ctx.moveTo(28, -4); ctx.lineTo(31, 1);
        ctx.stroke();

        // Yellow Scarf (flowing)
        ctx.fillStyle = '#fbbf24';
        // Main scarf wrap
        ctx.beginPath();
        ctx.moveTo(-16, -16); ctx.lineTo(16, -16);
        ctx.lineTo(12, -10); ctx.lineTo(-12, -10);
        ctx.closePath(); ctx.fill();
        // Flowing scarf tail
        ctx.beginPath();
        ctx.moveTo(-12, -14);
        ctx.quadraticCurveTo(-22, -18, -32, -8);
        ctx.lineTo(-28, -3);
        ctx.quadraticCurveTo(-18, -12, -12, -10);
        ctx.closePath(); ctx.fill();
        // Scarf highlight
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(-14, -15);
        ctx.quadraticCurveTo(-24, -16, -30, -7);
        ctx.lineTo(-29, -5);
        ctx.quadraticCurveTo(-20, -14, -13, -12);
        ctx.closePath(); ctx.fill();

        // Head (round burlap/straw color)
        ctx.fillStyle = '#d4a373';
        ctx.beginPath(); ctx.arc(0, -27, 17, 0, Math.PI * 2); ctx.fill();
        // Head outline
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#8b5a2b'; ctx.stroke();
        // Burlap texture lines on head
        ctx.strokeStyle = 'rgba(139, 90, 43, 0.3)'; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-8, -34); ctx.lineTo(-6, -20);
        ctx.moveTo(0, -35); ctx.lineTo(0, -19);
        ctx.moveTo(8, -34); ctx.lineTo(6, -20);
        ctx.stroke();

        // Eyes (button-style with X)
        ctx.fillStyle = '#5c4033';
        ctx.beginPath(); ctx.arc(-7, -29, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(7, -29, 5, 0, Math.PI * 2); ctx.fill();
        // X marks on buttons
        ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-9.5, -31.5); ctx.lineTo(-4.5, -26.5);
        ctx.moveTo(-4.5, -31.5); ctx.lineTo(-9.5, -26.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4.5, -31.5); ctx.lineTo(9.5, -26.5);
        ctx.moveTo(9.5, -31.5); ctx.lineTo(4.5, -26.5);
        ctx.stroke();

        // Mouth (stitched smile)
        ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-8, -19); ctx.lineTo(8, -19);
        ctx.stroke();
        // Stitch marks across mouth
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-7, -21); ctx.lineTo(-7, -17);
        ctx.moveTo(-3.5, -21); ctx.lineTo(-3.5, -17);
        ctx.moveTo(0, -21); ctx.lineTo(0, -17);
        ctx.moveTo(3.5, -21); ctx.lineTo(3.5, -17);
        ctx.moveTo(7, -21); ctx.lineTo(7, -17);
        ctx.stroke();

        // Hat brim (wide straw hat)
        ctx.fillStyle = '#e8c95a';
        ctx.beginPath(); ctx.ellipse(0, -40, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.stroke();
        // Hat top (dome)
        ctx.fillStyle = '#e8c95a';
        ctx.beginPath();
        ctx.moveTo(-16, -40);
        ctx.quadraticCurveTo(-16, -58, 0, -58);
        ctx.quadraticCurveTo(16, -58, 16, -40);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.stroke();
        // Hat cross-hatch pattern
        ctx.strokeStyle = 'rgba(184, 134, 11, 0.4)'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-10, -55); ctx.lineTo(-6, -42);
        ctx.moveTo(-3, -56); ctx.lineTo(0, -42);
        ctx.moveTo(4, -55); ctx.lineTo(7, -42);
        ctx.moveTo(-12, -48); ctx.lineTo(12, -48);
        ctx.moveTo(-14, -44); ctx.lineTo(14, -44);
        ctx.stroke();
        // Hat band
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-14, -43, 28, 3);

        ctx.restore();
    }
}

export class Enemy {
    x: number; y: number; type: string;
    facing = 1;
    isElite = false; isBoss = false;
    radius: number; speed: number; hp: number; maxHp: number; damage: number; color: string;
    wobble: number;

    constructor(x: number, y: number, type = 'worm') {
        this.x = x; this.y = y; this.type = type;
        this.wobble = Math.random() * Math.PI * 2;

        if (type === 'worm') {
            this.radius = 12; this.speed = 1.0 + Math.random() * 0.5; this.hp = 10; this.damage = 5; this.color = '#84cc16';
        } else if (type === 'crow') {
            this.radius = 15; this.speed = 2.0 + Math.random() * 0.5; this.hp = 5; this.damage = 8; this.color = '#1f2937';
        } else if (type === 'elite') {
            this.radius = 20; this.speed = 1.6; this.hp = 120; this.damage = 15; this.color = '#ea580c';
            this.isElite = true;
        } else if (type === 'boss') {
            this.radius = 45; this.speed = 1.4; this.hp = 1500; this.damage = 25; this.color = '#78350f';
            this.isBoss = true;
        } else {
            this.radius = 12; this.speed = 1; this.hp = 10; this.damage = 5; this.color = '#000';
        }
        this.maxHp = this.hp;
    }

    update(targetX: number, targetY: number) {
        const dx = targetX - this.x; const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            this.facing = dx > 0 ? 1 : -1;
        }
        this.wobble += 0.1;
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(this.facing, 1);

        if (this.type === 'worm' || this.type === 'elite') {
            ctx.fillStyle = this.color;
            const offset = Math.sin(this.wobble) * (this.isElite ? 5 : 3);
            const r = this.radius;
            ctx.beginPath(); ctx.arc(-r * 0.6, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, offset, r * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(r * 0.8, -offset, r * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = this.isElite ? '#fcd34d' : 'black';
            ctx.beginPath(); ctx.arc(r, -offset - 2, r * 0.2, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === 'crow') {
            ctx.fillStyle = this.color; const flap = Math.sin(this.wobble * 2) * 5;
            ctx.beginPath(); ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-10, -10 + flap); ctx.lineTo(5, 0); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-10, 10 - flap); ctx.lineTo(5, 0); ctx.fill();
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(20, 0); ctx.lineTo(10, 2); ctx.fill();
        } else if (this.type === 'boss') {
            ctx.fillStyle = this.color;
            const bounce = Math.abs(Math.sin(this.wobble)) * 5;
            ctx.beginPath(); ctx.ellipse(0, -bounce, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(40, -bounce, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'white'; ctx.beginPath(); ctx.moveTo(35, -bounce + 8); ctx.lineTo(48, -bounce + 22); ctx.lineTo(40, -bounce + 8); ctx.fill();
            ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(28, -bounce - 8, 5, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();

        if ((this.isBoss || this.isElite) && this.hp < this.maxHp) {
            const barW = this.isBoss ? 80 : 40;
            ctx.fillStyle = 'red';
            ctx.fillRect(drawX - barW / 2, drawY - this.radius - 15, barW * (this.hp / this.maxHp), 6);
            ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
            ctx.strokeRect(drawX - barW / 2, drawY - this.radius - 15, barW, 6);
        }
    }
}

export class ExpGem {
    x: number; y: number; radius = 5; value = 1;
    constructor(x: number, y: number) { this.x = x; this.y = y; }
    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        ctx.save(); ctx.translate(drawX, drawY);
        ctx.fillStyle = '#4ade80';
        ctx.beginPath(); ctx.moveTo(0, -this.radius); ctx.quadraticCurveTo(this.radius, 0, 0, this.radius); ctx.quadraticCurveTo(-this.radius, 0, 0, -this.radius); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-1, -1, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

export class TreasureBox {
    x: number; y: number; radius = 20; wobble = 0;
    constructor(x: number, y: number) { this.x = x; this.y = y; }
    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        this.wobble += 0.1;
        const bounce = Math.abs(Math.sin(this.wobble)) * 5;
        ctx.save(); ctx.translate(drawX, drawY - bounce);

        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#92400e'; ctx.fillRect(-15, -10, 30, 20);
        ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(0, -10, 15, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(-15, -2, 30, 4);
        ctx.fillRect(-4, -6, 8, 8);
        ctx.restore();
    }
}

export class Projectile {
    x: number; y: number; speed = 10; damage: number; radius: number; color: string; pierce: number;
    vx: number; vy: number; hitEnemies = new Set<Enemy>(); life?: number;

    constructor(x: number, y: number, targetX: number, targetY: number, level: number, damage: number, radius: number, color: string, pierce = 0) {
        this.x = x; this.y = y; this.damage = damage; this.radius = radius; this.color = color; this.pierce = pierce;
        const dx = targetX - x; const dy = targetY - y;
        const dist = Math.hypot(dx, dy);
        this.vx = (dx / dist) * this.speed; this.vy = (dy / dist) * this.speed;
    }
    update() { this.x += this.vx; this.y += this.vy; if (this.life !== undefined) this.life--; }
    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}

export class VeggieProjectile extends Projectile {
    veggieType: 'carrot' | 'radish' | 'cucumber';
    rotation = 0;

    constructor(x: number, y: number, targetX: number, targetY: number, level: number, damage: number, radius: number, color: string, pierce: number) {
        super(x, y, targetX, targetY, level, damage, radius, color, pierce);
        const types = ['carrot', 'radish', 'cucumber'];
        this.veggieType = types[Math.floor(Math.random() * types.length)] as any;
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        this.rotation += 0.2;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(this.rotation);

        if (this.veggieType === 'carrot') {
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-10, -5); ctx.lineTo(-10, 5); ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-15, -5); ctx.lineTo(-15, 5); ctx.fill();
        } else if (this.veggieType === 'radish') {
            ctx.fillStyle = '#d946ef';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-5, -12); ctx.lineTo(5, -12); ctx.fill();
        } else if (this.veggieType === 'cucumber') {
            ctx.fillStyle = '#16a34a';
            ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
    }
}

export class ShovelProjectile extends Projectile {
    angle: number;
    constructor(x: number, y: number, angle: number, level: number, damage: number, pierce: number) {
        super(x, y, x + Math.cos(angle), y + Math.sin(angle), level, damage, 15, '#d1d5db', pierce);
        this.angle = angle;
        this.speed = 12;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-15, -2, 20, 4);
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(5, -6); ctx.lineTo(15, 0); ctx.lineTo(5, 6); ctx.fill();

        ctx.restore();
    }
}

export class Explosion {
    x: number; y: number; radius: number; life = 20; maxLife = 20; damage: number;
    hitEnemies = new Set<Enemy>();

    constructor(x: number, y: number, radius: number, damage: number) {
        this.x = x; this.y = y; this.radius = radius; this.damage = damage;
    }

    update(enemies: Enemy[]) {
        this.life--;
        if (this.life === this.maxLife - 2) {
            for (const enemy of enemies) {
                if (getDistance(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
                    enemy.hp -= this.damage;
                    this.hitEnemies.add(enemy);
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        const progress = 1 - (this.life / this.maxLife);

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.globalAlpha = 1 - progress;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(0, 0, this.radius * progress, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(0, 0, this.radius * progress * 0.7, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
}

export class HoeEffect {
    x: number; y: number; maxRadius: number; life = 15; maxLife = 15; level: number; color: string;
    startAngle: number; swingAngle = Math.PI * 1.2;

    constructor(x: number, y: number, radius: number, level: number) {
        this.x = x; this.y = y; this.maxRadius = radius; this.level = level;
        this.color = RARITY_COLORS[level];
        this.startAngle = Math.random() * Math.PI * 2;
    }

    update() { this.life--; }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number }) {
        const drawX = this.x - camera.x; const drawY = this.y - camera.y;
        const progress = 1 - (this.life / this.maxLife);
        const currentAngle = this.startAngle + this.swingAngle * progress;

        ctx.save();
        ctx.translate(drawX, drawY);

        ctx.save();
        ctx.rotate(this.startAngle + this.swingAngle);
        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = this.color; ctx.lineWidth = 15 + this.level * 3;
        ctx.beginPath(); ctx.arc(0, 0, this.maxRadius * 0.8, -this.swingAngle * progress, 0); ctx.stroke();
        ctx.restore();

        ctx.rotate(currentAngle);
        const handleLen = this.maxRadius;
        ctx.fillStyle = '#78350f'; ctx.fillRect(0, -4, handleLen, 8);
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath(); ctx.moveTo(handleLen, -20); ctx.lineTo(handleLen + 12, -20); ctx.lineTo(handleLen + 20, 20); ctx.lineTo(handleLen, 20); ctx.fill();
        ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2; ctx.stroke();

        ctx.restore();
    }
}
