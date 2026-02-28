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

        // ===== SHADOW =====
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath(); ctx.ellipse(0, 32, 22, 6, 0, 0, Math.PI * 2); ctx.fill();

        // ===== LEGS (straw poles) =====
        // Left leg
        ctx.fillStyle = '#c49a3c';
        ctx.save(); ctx.translate(-7, 22);
        ctx.fillRect(-3, 0, 6, 10);
        // Leg outline
        ctx.strokeStyle = '#9a7520'; ctx.lineWidth = 1;
        ctx.strokeRect(-3, 0, 6, 10);
        ctx.restore();
        // Right leg
        ctx.save(); ctx.translate(7, 22);
        ctx.fillStyle = '#c49a3c';
        ctx.fillRect(-3, 0, 6, 10);
        ctx.strokeStyle = '#9a7520'; ctx.lineWidth = 1;
        ctx.strokeRect(-3, 0, 6, 10);
        ctx.restore();

        // Straw tufts at feet (multiple per leg for fullness)
        ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Left foot straw
        ctx.moveTo(-11, 31); ctx.lineTo(-15, 36);
        ctx.moveTo(-9, 31); ctx.lineTo(-11, 37);
        ctx.moveTo(-7, 32); ctx.lineTo(-7, 38);
        ctx.moveTo(-5, 31); ctx.lineTo(-3, 37);
        ctx.moveTo(-3, 31); ctx.lineTo(0, 35);
        ctx.stroke();
        ctx.beginPath();
        // Right foot straw
        ctx.moveTo(3, 31); ctx.lineTo(0, 35);
        ctx.moveTo(5, 31); ctx.lineTo(3, 37);
        ctx.moveTo(7, 32); ctx.lineTo(7, 38);
        ctx.moveTo(9, 31); ctx.lineTo(11, 37);
        ctx.moveTo(11, 31); ctx.lineTo(15, 36);
        ctx.stroke();
        // Lighter straw highlights
        ctx.strokeStyle = '#e8c95a'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, 31); ctx.lineTo(-13, 35);
        ctx.moveTo(-6, 32); ctx.lineTo(-6, 36);
        ctx.moveTo(6, 32); ctx.lineTo(6, 36);
        ctx.moveTo(10, 31); ctx.lineTo(13, 35);
        ctx.stroke();

        // ===== OVERALLS (Blue denim) =====
        ctx.fillStyle = '#5b9bd5';
        // Main overall body with slight rounded shape
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-16, 22);
        ctx.lineTo(-8, 23); ctx.lineTo(-8, 22);
        ctx.lineTo(8, 22); ctx.lineTo(8, 23);
        ctx.lineTo(16, 22);
        ctx.lineTo(15, 0);
        ctx.closePath(); ctx.fill();
        // Denim shade variation
        ctx.fillStyle = '#4a8bc4';
        ctx.fillRect(-15, 12, 30, 10);
        // Overall outline
        ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(-16, 22); ctx.lineTo(16, 22); ctx.lineTo(15, 0);
        ctx.stroke();
        // Center seam
        ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
        ctx.setLineDash([]);
        // Leg split line
        ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, 22); ctx.stroke();

        // Straps
        ctx.fillStyle = '#5b9bd5';
        ctx.fillRect(-12, -14, 7, 16);
        ctx.fillRect(5, -14, 7, 16);
        ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1;
        ctx.strokeRect(-12, -14, 7, 16);
        ctx.strokeRect(5, -14, 7, 16);

        // Metal rivet buttons on straps
        ctx.fillStyle = '#ddd';
        ctx.beginPath(); ctx.arc(-8.5, -1, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8.5, -1, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(-8.5, -1, 2.5, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(8.5, -1, 2.5, 0, Math.PI * 2); ctx.stroke();
        // Button cross marks
        ctx.strokeStyle = '#888'; ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-9.5, -1); ctx.lineTo(-7.5, -1);
        ctx.moveTo(-8.5, -2); ctx.lineTo(-8.5, 0);
        ctx.moveTo(7.5, -1); ctx.lineTo(9.5, -1);
        ctx.moveTo(8.5, -2); ctx.lineTo(8.5, 0);
        ctx.stroke();

        // Front pocket
        ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, 3); ctx.lineTo(-4, 10); ctx.lineTo(4, 10); ctx.lineTo(4, 3);
        ctx.stroke();

        // ===== PURPLE PATCH on overalls =====
        ctx.fillStyle = '#d8a0e8';
        // Slightly rotated patch for natural look
        ctx.save();
        ctx.translate(-9, 13);
        ctx.rotate(-0.08);
        ctx.fillRect(0, 0, 9, 8);
        ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.2;
        ctx.strokeRect(0, 0, 9, 8);
        // Visible stitch marks around patch border
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(-1.5, -1.5, 12, 11);
        ctx.setLineDash([]);
        // Cross-stitch on patch
        ctx.strokeStyle = '#9333ea'; ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(2, 2); ctx.lineTo(2, 6);
        ctx.moveTo(4.5, 2); ctx.lineTo(4.5, 6);
        ctx.moveTo(7, 2); ctx.lineTo(7, 6);
        ctx.stroke();
        ctx.restore();

        // ===== SHIRT (Red Buffalo Plaid) =====
        ctx.fillStyle = '#cc2222';
        // Rounded shirt body
        ctx.beginPath();
        ctx.moveTo(-17, -17);
        ctx.lineTo(-17, 2);
        ctx.lineTo(17, 2);
        ctx.lineTo(17, -17);
        ctx.closePath(); ctx.fill();

        // Black squares for buffalo check pattern
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let gx = -16; gx < 16; gx += 8) {
            for (let gy = -16; gy < 0; gy += 6) {
                if ((Math.floor((gx + 16) / 8) + Math.floor((gy + 16) / 6)) % 2 === 0) {
                    ctx.fillRect(gx, gy, 8, 6);
                }
            }
        }
        // Plaid lines - dark horizontal
        ctx.strokeStyle = '#8b1a1a'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-17, -14); ctx.lineTo(17, -14);
        ctx.moveTo(-17, -8); ctx.lineTo(17, -8);
        ctx.moveTo(-17, -2); ctx.lineTo(17, -2);
        ctx.stroke();
        // Plaid lines - dark vertical
        ctx.beginPath();
        ctx.moveTo(-12, -17); ctx.lineTo(-12, 2);
        ctx.moveTo(-4, -17); ctx.lineTo(-4, 2);
        ctx.moveTo(4, -17); ctx.lineTo(4, 2);
        ctx.moveTo(12, -17); ctx.lineTo(12, 2);
        ctx.stroke();
        // Lighter plaid accent lines
        ctx.strokeStyle = 'rgba(255,200,200,0.2)'; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-17, -11); ctx.lineTo(17, -11);
        ctx.moveTo(-17, -5); ctx.lineTo(17, -5);
        ctx.moveTo(-8, -17); ctx.lineTo(-8, 2);
        ctx.moveTo(0, -17); ctx.lineTo(0, 2);
        ctx.moveTo(8, -17); ctx.lineTo(8, 2);
        ctx.stroke();
        // Shirt outline
        ctx.strokeStyle = '#7a1515'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-17, -17); ctx.lineTo(-17, 2); ctx.lineTo(17, 2); ctx.lineTo(17, -17);
        ctx.stroke();

        // ===== ARMS (wooden stick arms) =====
        // Left arm - main stick
        ctx.strokeStyle = '#a07030'; ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-17, -10); ctx.lineTo(-34, -2); ctx.stroke();
        // Right arm - main stick
        ctx.beginPath(); ctx.moveTo(17, -10); ctx.lineTo(34, -2); ctx.stroke();
        // Arm wood grain
        ctx.strokeStyle = '#8b5e2a'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-20, -9); ctx.lineTo(-30, -4);
        ctx.moveTo(20, -9); ctx.lineTo(30, -4);
        ctx.stroke();

        // Plaid sleeves (on arms near shoulder)
        ctx.strokeStyle = '#cc2222'; ctx.lineWidth = 8;
        ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(-17, -10); ctx.lineTo(-22, -8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(17, -10); ctx.lineTo(22, -8); ctx.stroke();
        // Sleeve plaid stripes
        ctx.strokeStyle = '#8b1a1a'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-18, -12); ctx.lineTo(-22, -10);
        ctx.moveTo(-18, -9); ctx.lineTo(-22, -7);
        ctx.moveTo(18, -12); ctx.lineTo(22, -10);
        ctx.moveTo(18, -9); ctx.lineTo(22, -7);
        ctx.stroke();

        // ===== STRAW TUFTS AT HANDS (dense & prominent) =====
        ctx.lineCap = 'round';
        // Left hand straw - base layer
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-33, -3); ctx.lineTo(-40, -10);
        ctx.moveTo(-33, -2); ctx.lineTo(-42, -4);
        ctx.moveTo(-33, -1); ctx.lineTo(-40, 4);
        ctx.moveTo(-34, -4); ctx.lineTo(-38, -14);
        ctx.moveTo(-34, 0); ctx.lineTo(-39, 8);
        ctx.stroke();
        // Left hand straw - highlights
        ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-34, -3); ctx.lineTo(-39, -8);
        ctx.moveTo(-34, -1); ctx.lineTo(-41, -2);
        ctx.moveTo(-34, 0); ctx.lineTo(-38, 6);
        ctx.moveTo(-33, -5); ctx.lineTo(-37, -12);
        ctx.moveTo(-33, 1); ctx.lineTo(-37, 7);
        ctx.stroke();
        // Right hand straw - base layer
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(33, -3); ctx.lineTo(40, -10);
        ctx.moveTo(33, -2); ctx.lineTo(42, -4);
        ctx.moveTo(33, -1); ctx.lineTo(40, 4);
        ctx.moveTo(34, -4); ctx.lineTo(38, -14);
        ctx.moveTo(34, 0); ctx.lineTo(39, 8);
        ctx.stroke();
        // Right hand straw - highlights
        ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(34, -3); ctx.lineTo(39, -8);
        ctx.moveTo(34, -1); ctx.lineTo(41, -2);
        ctx.moveTo(34, 0); ctx.lineTo(38, 6);
        ctx.moveTo(33, -5); ctx.lineTo(37, -12);
        ctx.moveTo(33, 1); ctx.lineTo(37, 7);
        ctx.stroke();

        // ===== YELLOW SCARF (large, flowing, dramatic) =====
        // Scarf wrap around neck
        ctx.fillStyle = '#f0b820';
        ctx.beginPath();
        ctx.moveTo(-18, -17);
        ctx.lineTo(18, -17);
        ctx.lineTo(16, -10);
        ctx.lineTo(-16, -10);
        ctx.closePath(); ctx.fill();
        // Scarf knot/fold at front
        ctx.fillStyle = '#e5a810';
        ctx.beginPath();
        ctx.moveTo(-5, -15); ctx.lineTo(5, -15);
        ctx.lineTo(3, -10); ctx.lineTo(-3, -10);
        ctx.closePath(); ctx.fill();

        // Flowing scarf tail (large, wavy)
        ctx.fillStyle = '#f0b820';
        ctx.beginPath();
        ctx.moveTo(-14, -15);
        ctx.quadraticCurveTo(-20, -22, -30, -18);
        ctx.quadraticCurveTo(-40, -14, -42, -4);
        ctx.quadraticCurveTo(-42, 2, -36, 5);
        ctx.lineTo(-32, 2);
        ctx.quadraticCurveTo(-36, -2, -36, -8);
        ctx.quadraticCurveTo(-34, -14, -24, -16);
        ctx.quadraticCurveTo(-18, -16, -14, -12);
        ctx.closePath(); ctx.fill();

        // Scarf highlight/shine
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.moveTo(-16, -16);
        ctx.quadraticCurveTo(-24, -20, -32, -16);
        ctx.quadraticCurveTo(-38, -12, -40, -4);
        ctx.lineTo(-38, -2);
        ctx.quadraticCurveTo(-36, -10, -28, -15);
        ctx.quadraticCurveTo(-22, -17, -15, -13);
        ctx.closePath(); ctx.fill();

        // Scarf shadow edge
        ctx.strokeStyle = '#c48a10'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-36, 5);
        ctx.quadraticCurveTo(-42, 2, -42, -4);
        ctx.quadraticCurveTo(-40, -14, -30, -18);
        ctx.stroke();

        // ===== HEAD (round burlap) =====
        // Head base - slightly larger for chibi feel
        ctx.fillStyle = '#d4a373';
        ctx.beginPath(); ctx.arc(0, -30, 19, 0, Math.PI * 2); ctx.fill();
        // Subtle shading on head
        ctx.fillStyle = 'rgba(180, 120, 60, 0.15)';
        ctx.beginPath(); ctx.arc(3, -28, 17, 0, Math.PI * 2); ctx.fill();
        // Head outline
        ctx.lineWidth = 2; ctx.strokeStyle = '#8b5a2b';
        ctx.beginPath(); ctx.arc(0, -30, 19, 0, Math.PI * 2); ctx.stroke();

        // Burlap weave texture on head
        ctx.strokeStyle = 'rgba(139, 90, 43, 0.2)'; ctx.lineWidth = 0.6;
        ctx.beginPath();
        // Vertical weave lines
        ctx.moveTo(-10, -40); ctx.lineTo(-8, -20);
        ctx.moveTo(-4, -42); ctx.lineTo(-3, -18);
        ctx.moveTo(2, -42); ctx.lineTo(3, -18);
        ctx.moveTo(8, -40); ctx.lineTo(9, -20);
        // Horizontal weave lines
        ctx.moveTo(-14, -36); ctx.lineTo(14, -36);
        ctx.moveTo(-16, -30); ctx.lineTo(16, -30);
        ctx.moveTo(-14, -24); ctx.lineTo(14, -24);
        ctx.stroke();

        // ===== EYES (large button style with X cross stitch) =====
        // Left eye button
        ctx.fillStyle = '#5c3a1e';
        ctx.beginPath(); ctx.arc(-7, -32, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3d2510'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-7, -32, 6, 0, Math.PI * 2); ctx.stroke();
        // Button rim highlight
        ctx.strokeStyle = 'rgba(120, 80, 40, 0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(-7, -32, 4.5, 0, Math.PI * 2); ctx.stroke();
        // X stitch on left eye
        ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, -35); ctx.lineTo(-4, -29);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4, -35); ctx.lineTo(-10, -29);
        ctx.stroke();

        // Right eye button
        ctx.fillStyle = '#5c3a1e';
        ctx.beginPath(); ctx.arc(7, -32, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3d2510'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(7, -32, 6, 0, Math.PI * 2); ctx.stroke();
        // Button rim highlight
        ctx.strokeStyle = 'rgba(120, 80, 40, 0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(7, -32, 4.5, 0, Math.PI * 2); ctx.stroke();
        // X stitch on right eye
        ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(4, -35); ctx.lineTo(10, -29);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -35); ctx.lineTo(4, -29);
        ctx.stroke();

        // ===== MOUTH (stitched zigzag smile) =====
        ctx.strokeStyle = '#3d2510'; ctx.lineWidth = 2;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        // Main horizontal mouth line
        ctx.beginPath();
        ctx.moveTo(-10, -21);
        ctx.lineTo(10, -21);
        ctx.stroke();
        // Cross-stitch marks (6 stitches)
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-9, -23.5); ctx.lineTo(-9, -18.5);
        ctx.moveTo(-5.5, -23.5); ctx.lineTo(-5.5, -18.5);
        ctx.moveTo(-2, -23.5); ctx.lineTo(-2, -18.5);
        ctx.moveTo(2, -23.5); ctx.lineTo(2, -18.5);
        ctx.moveTo(5.5, -23.5); ctx.lineTo(5.5, -18.5);
        ctx.moveTo(9, -23.5); ctx.lineTo(9, -18.5);
        ctx.stroke();

        // ===== HAT (wide-brimmed straw hat) =====
        // Hat brim - wide ellipse with depth
        ctx.fillStyle = '#e0b830';
        ctx.beginPath(); ctx.ellipse(0, -44, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
        // Brim darker edge ring
        ctx.strokeStyle = '#a08020'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(0, -44, 34, 10, 0, 0, Math.PI * 2); ctx.stroke();
        // Inner brim ring
        ctx.strokeStyle = '#c09828'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, -44, 28, 7, 0, 0, Math.PI * 2); ctx.stroke();
        // Brim weave texture
        ctx.strokeStyle = 'rgba(160, 128, 32, 0.3)'; ctx.lineWidth = 0.7;
        for (let i = -30; i <= 30; i += 5) {
            ctx.beginPath();
            ctx.moveTo(i, -44 - Math.sqrt(Math.max(0, 1 - (i * i) / (34 * 34))) * 10);
            ctx.lineTo(i, -44 + Math.sqrt(Math.max(0, 1 - (i * i) / (34 * 34))) * 10);
            ctx.stroke();
        }

        // Hat top (dome shape)
        ctx.fillStyle = '#dbb030';
        ctx.beginPath();
        ctx.moveTo(-18, -44);
        ctx.bezierCurveTo(-18, -52, -14, -64, 0, -65);
        ctx.bezierCurveTo(14, -64, 18, -52, 18, -44);
        ctx.closePath(); ctx.fill();
        // Dome outline
        ctx.strokeStyle = '#a08020'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -44);
        ctx.bezierCurveTo(-18, -52, -14, -64, 0, -65);
        ctx.bezierCurveTo(14, -64, 18, -52, 18, -44);
        ctx.stroke();

        // Dense cross-hatch weave pattern on dome
        ctx.strokeStyle = 'rgba(160, 120, 20, 0.35)'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        // Diagonal lines going right
        ctx.moveTo(-14, -58); ctx.lineTo(-8, -46);
        ctx.moveTo(-8, -62); ctx.lineTo(-2, -46);
        ctx.moveTo(-2, -64); ctx.lineTo(4, -46);
        ctx.moveTo(4, -62); ctx.lineTo(10, -46);
        ctx.moveTo(10, -58); ctx.lineTo(14, -46);
        // Diagonal lines going left
        ctx.moveTo(14, -58); ctx.lineTo(8, -46);
        ctx.moveTo(8, -62); ctx.lineTo(2, -46);
        ctx.moveTo(2, -64); ctx.lineTo(-4, -46);
        ctx.moveTo(-4, -62); ctx.lineTo(-10, -46);
        ctx.moveTo(-10, -58); ctx.lineTo(-14, -46);
        ctx.stroke();
        // Horizontal weave lines on dome
        ctx.beginPath();
        ctx.moveTo(-16, -50); ctx.lineTo(16, -50);
        ctx.moveTo(-14, -54); ctx.lineTo(14, -54);
        ctx.moveTo(-10, -58); ctx.lineTo(10, -58);
        ctx.moveTo(-6, -62); ctx.lineTo(6, -62);
        ctx.stroke();

        // Hat band (brown ribbon)
        ctx.fillStyle = '#8b6914';
        ctx.beginPath();
        ctx.moveTo(-16, -47); ctx.lineTo(16, -47);
        ctx.lineTo(16, -44); ctx.lineTo(-16, -44);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6d5210'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-16, -47); ctx.lineTo(16, -47);
        ctx.moveTo(-16, -44); ctx.lineTo(16, -44);
        ctx.stroke();

        // ===== STRAW WISPS from under hat =====
        ctx.strokeStyle = '#c49a3c'; ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-16, -43); ctx.lineTo(-20, -40);
        ctx.moveTo(-14, -42); ctx.lineTo(-17, -38);
        ctx.moveTo(16, -43); ctx.lineTo(20, -40);
        ctx.moveTo(14, -42); ctx.lineTo(17, -38);
        ctx.stroke();

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
