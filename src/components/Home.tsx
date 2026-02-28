import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Player } from '../game/entities';

interface HomeProps {
  onStart: () => void;
}

// ============================================================================
// SVG ICONS (Custom tailored to match the reference image closely)
// ============================================================================
const WateringCanIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20a6 6 0 0 0 6-6V9a4 4 0 0 0-8 0v5a6 6 0 0 0 2 6Z" fill="#a3e635" stroke="#4d7c0f" />
    <path d="M14 9h4" stroke="#4d7c0f" /><path d="M10 12l-5-2 1-3 5 2" stroke="#4d7c0f" fill="#cbd5e1" />
    <path d="M5 7c.5-1 1.5-1.5 2.5-1.5 1 0 2 .5 2.5 1.5" stroke="#4d7c0f" />
  </svg>
);

const GoldIcon = () => (
  <div className="w-full h-full rounded-full border-2 border-[#b45309] bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),_0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center relative overflow-hidden">
    <div className="w-[70%] h-[70%] rounded-full border-2 border-[#fef08a] opacity-50 absolute" />
    <div className="w-1 h-3 bg-[#fef08a] rounded-full rotate-45 transform -translate-x-1 -translate-y-1" />
  </div>
);

const GemIcon = () => (
  <div className="w-full h-full flex items-center justify-center drop-shadow-md">
    <svg viewBox="0 0 24 24" width="90%" height="90%">
      <path d="M12 2l-6 6v8l6 6 6-6V8z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1" />
      <path d="M12 2l-6 6h12z" fill="#67e8f9" opacity="0.8" />
      <path d="M6 8v8l6 6v-14z" fill="#3b82f6" opacity="0.6" />
      <path d="M12 8v14l6-6V8z" fill="#22d3ee" opacity="0.4" />
    </svg>
  </div>
);

const DroneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
    <ellipse cx="12" cy="12" rx="6" ry="4" fill="#3b82f6" stroke="#1e3a8a" />
    <circle cx="12" cy="12" r="1.5" fill="#f8fafc" stroke="#0f172a" />
    <path d="M6 12H2M18 12h4" strokeWidth="2" stroke="#475569" />
    <ellipse cx="2" cy="11" rx="2" ry="0.5" fill="#94a3b8" /><ellipse cx="22" cy="11" rx="2" ry="0.5" fill="#94a3b8" />
    <path d="M10 16l-2 3M14 16l2 3" stroke="#64748b" />
    <path d="M4 14v4M20 14v4" stroke="#94a3b8" strokeDasharray="1,1" />
  </svg>
);

const BasketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
    {/* Veggies */}
    <circle cx="8" cy="10" r="3" fill="#ef4444" stroke="#991b1b" />
    <circle cx="16" cy="10" r="3" fill="#eab308" stroke="#a16207" />
    <path d="M10 7c0-2-2-3-2-3s-2 1-2 3h4z" fill="#22c55e" stroke="#14532d" />
    <path d="M14 7c0-2 2-3 2-3s2 1 2 3h-4z" fill="#cf6679" stroke="#9f1239" />
    {/* Basket */}
    <path d="M3 12h18l-2 9H5z" fill="#d97706" stroke="#78350f" strokeWidth="2" />
    <path d="M3 12h18M5 15h14M6 18h12" stroke="#92400e" strokeWidth="1" />
    <path d="M8 12v9M16 12v9" stroke="#92400e" strokeWidth="1" />
  </svg>
);

const GrasshopperIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" className="w-full h-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
    <ellipse cx="12" cy="12" rx="7" ry="4" fill="#a3e635" stroke="#4d7c0f" />
    <path d="M18 11c1-1 3-1 3-1-1 2-2 3-3 3" fill="#ecfccb" stroke="#65a30d" />
    <path d="M6 12l-2 4M8 14l-1 5M16 14l4-5M15 14l3 5" stroke="#4d7c0f" />
    <circle cx="6" cy="11" r="1.5" fill="#4d7c0f" />
    <path d="M5 10l-2-4M7 10l1-5" stroke="#4d7c0f" />
  </svg>
);


// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Background Rendering
  const drawBackground = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. SKY (Light blue to off-white/beige horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    skyGrad.addColorStop(0, '#74b9d6');
    skyGrad.addColorStop(0.6, '#b6dce3');
    skyGrad.addColorStop(1, '#e3e1cc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.55);

    // Tiny birds/locusts in background sky
    ctx.fillStyle = '#4a4a4a';
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 15; i++) {
      const x = W * 0.1 + Math.random() * W * 0.4;
      const y = H * 0.1 + Math.random() * H * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.arc(x - 2, y - 1, 0.8, 0, Math.PI * 2);
      ctx.arc(x + 2, y - 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Clouds
    const drawCloud = (x: number, y: number, w: number, h: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      ctx.ellipse(x - w * 0.6, y + h * 0.2, w * 0.6, h * 0.7, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w * 0.5, y + h * 0.3, w * 0.7, h * 0.8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w * 0.2, y - h * 0.4, w * 0.5, h * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCloud(W * 0.15, H * 0.2, W * 0.08, H * 0.05, 0.8);
    drawCloud(W * 0.45, H * 0.1, W * 0.06, H * 0.04, 0.6);
    drawCloud(W * 0.7, H * 0.15, W * 0.09, H * 0.06, 0.7);

    // 2. DISANT HILLS (Pale blue/green)
    ctx.fillStyle = '#9cb8aa';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.5);
    ctx.quadraticCurveTo(W * 0.1, H * 0.4, W * 0.25, H * 0.45);
    ctx.quadraticCurveTo(W * 0.4, H * 0.48, W * 0.55, H * 0.42);
    ctx.lineTo(W, H * 0.5); ctx.lineTo(0, H * 0.5);
    ctx.fill();

    // 3. MIDGROUND GREEN HILLS
    const hillGrad = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.55);
    hillGrad.addColorStop(0, '#8ec164');
    hillGrad.addColorStop(1, '#6ba341');
    ctx.fillStyle = hillGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.52);
    ctx.quadraticCurveTo(W * 0.2, H * 0.44, W * 0.4, H * 0.48);
    ctx.quadraticCurveTo(W * 0.65, H * 0.52, W, H * 0.46);
    ctx.lineTo(W, H * 0.6); ctx.lineTo(0, H * 0.6);
    ctx.fill();

    // 4. STRIPED GREEN/YELLOW FARMLAND (Perspective)
    ctx.save();
    ctx.translate(W * 0.5, H * 0.53);
    for (let i = -10; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#b8d655' : '#cbed66'; // light green stripes
      ctx.beginPath();
      ctx.moveTo(i * 40, 0);
      ctx.lineTo((i + 1) * 40, 0);
      ctx.lineTo((i + 1) * 150, H * 0.15);
      ctx.lineTo(i * 150, H * 0.15);
      ctx.fill();
    }
    ctx.restore();

    // 5. GOLDEN WHEAT FIELD
    const wheatGrad = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.75);
    wheatGrad.addColorStop(0, '#eac646');
    wheatGrad.addColorStop(0.5, '#daa026');
    wheatGrad.addColorStop(1, '#bb7a17');
    ctx.fillStyle = wheatGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.58);
    ctx.lineTo(W, H * 0.58);
    ctx.lineTo(W, H * 0.78);
    ctx.quadraticCurveTo(W * 0.5, H * 0.72, 0, H * 0.82);
    ctx.fill();

    // Draw thousands of tiny wheat stalks
    ctx.save();
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * W;
      // concentrate wheat in the middle-back
      const yBase = H * 0.58 + Math.pow(Math.random(), 1.5) * (H * 0.18);
      const yAdjust = Math.sin(x * 0.01) * 10;
      const fy = yBase + yAdjust;

      if (fy > H * 0.78) continue; // Don't draw over dirt path

      const h = 8 + (fy - H * 0.58) * 0.15; // closer = taller
      const sway = Math.sin(x * 0.05 + fy * 0.01) * 3;

      ctx.strokeStyle = `hsl(42, ${70 + Math.random() * 20}%, ${40 + Math.random() * 20}%)`;
      ctx.lineWidth = 1 + (fy - H * 0.58) * 0.01;
      ctx.beginPath();
      ctx.moveTo(x, fy);
      ctx.quadraticCurveTo(x + sway, fy - h / 2, x + sway * 1.5, fy - h);
      ctx.stroke();
    }
    ctx.restore();

    // 6. FOREGROUND DIRT (Curved path)
    const dirtGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
    dirtGrad.addColorStop(0, '#9c7349');
    dirtGrad.addColorStop(0.5, '#7b532f');
    dirtGrad.addColorStop(1, '#53351a');
    ctx.fillStyle = dirtGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.82);
    ctx.quadraticCurveTo(W * 0.4, H * 0.72, W, H * 0.78);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.fill();

    // Foreground track lines / tire marks
    ctx.strokeStyle = '#5c3a1e';
    ctx.lineWidth = 15;
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(W * 0.3, H); ctx.quadraticCurveTo(W * 0.6, H * 0.85, W * 0.9, H * 0.78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.5, H); ctx.quadraticCurveTo(W * 0.7, H * 0.88, W * 0.95, H * 0.8); ctx.stroke();
    ctx.globalAlpha = 1;

    // 7. WOODEN FENCES
    const drawFence = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#8b5a2b';
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;

      // horizontal
      const hBars = [[-100, -30], [-120, 0]];
      hBars.forEach(([ox, oy]) => {
        ctx.fillRect(ox, oy, 240, 15);
        ctx.strokeRect(ox, oy, 240, 15);
        // wood grain
        ctx.beginPath(); ctx.moveTo(ox + 10, oy + 5); ctx.lineTo(ox + 200, oy + 5); ctx.moveTo(ox + 20, oy + 10); ctx.lineTo(ox + 230, oy + 10); ctx.strokeStyle = '#5c4033'; ctx.lineWidth = 1; ctx.stroke();
      });

      // vertical
      const vBars = [-50, 0, 50];
      vBars.forEach(bx => {
        ctx.fillStyle = '#8b5a2b'; ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 3;
        ctx.fillRect(bx - 10, -50, 20, 80);
        ctx.strokeRect(bx - 10, -50, 20, 80);
        ctx.beginPath(); ctx.moveTo(bx - 10, -50); ctx.lineTo(bx, -65); ctx.lineTo(bx + 10, -50); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
    };
    drawFence(W * 0.15, H * 0.85, 1.2); // Left fence
    drawFence(W * 0.9, H * 0.85, 1.0);  // Right fence

    // Left foreground crossed logs
    ctx.save();
    ctx.translate(W * 0.05, H * 0.92);
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = '#5c4033'; ctx.strokeStyle = '#2d1a11'; ctx.lineWidth = 2;
    ctx.fillRect(-80, -15, 160, 30); ctx.strokeRect(-80, -15, 160, 30);
    ctx.rotate(-Math.PI / 3);
    ctx.fillRect(-80, -15, 160, 30); ctx.strokeRect(-80, -15, 160, 30);
    ctx.restore();


    // 8. TORNADO & SWARM (Right Background)
    ctx.save();
    const torX = W * 0.85;
    const torTopY = 0;
    const torBotY = H * 0.6;

    // Swarm base (dust cloud)
    const dustGrad = ctx.createRadialGradient(torX, torBotY, 10, torX, torBotY, 200);
    dustGrad.addColorStop(0, 'rgba(100,90,70,0.8)');
    dustGrad.addColorStop(1, 'rgba(150,140,110,0)');
    ctx.fillStyle = dustGrad;
    ctx.fillRect(torX - 250, torBotY - 100, 500, 200);

    // Tornado cone
    ctx.beginPath();
    ctx.moveTo(torX - 150, torTopY);
    ctx.quadraticCurveTo(torX, H * 0.3, torX - 20, torBotY);
    ctx.lineTo(torX + 20, torBotY);
    ctx.quadraticCurveTo(torX, H * 0.3, torX + 120, torTopY);
    ctx.fillStyle = 'rgba(60, 50, 40, 0.4)';
    ctx.fill();

    // Heavy swarm particles (locusts wrapping around tornado)
    ctx.fillStyle = '#2d241c';
    for (let i = 0; i < 400; i++) {
      const t = Math.random();
      const y = torTopY + (torBotY - torTopY) * t;
      const widthAtY = 150 - (130 * Math.pow(t, 2)); // trumpet shape
      const xOffset = (Math.random() - 0.5) * widthAtY * 2;
      const x = torX + xOffset + Math.sin(t * 20) * 20; // swirl
      const size = 1 + Math.random() * 2 + (t * 1.5); // bigger near bottom
      ctx.globalAlpha = 0.3 + Math.random() * 0.6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillRect(-size, -size / 2, size * 2, size);
      // wings
      ctx.fillStyle = 'rgba(150,150,150,0.5)';
      ctx.fillRect(-size, -size, size, size * 2);
      ctx.fillStyle = '#2d241c';
      ctx.restore();
    }
    ctx.restore();

    // 9. SCARECROW CHARACTER (BACK VIEW)
    ctx.save();
    const cx = W * 0.25;
    const cy = H * 0.8;
    ctx.translate(cx, cy);

    // Wooden pole
    ctx.fillStyle = '#5c4033'; ctx.strokeStyle = '#2d1a11'; ctx.lineWidth = 3;
    ctx.fillRect(-8, 50, 16, 150); ctx.strokeRect(-8, 50, 16, 150);

    // Arms (wood sticks)
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-60, 40); ctx.lineTo(-65, 35); ctx.lineTo(0, -20); ctx.fillStyle = '#6b4226'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(60, 40); ctx.lineTo(65, 35); ctx.lineTo(0, -20); ctx.fill(); ctx.stroke();

    // Straw hands
    ctx.fillStyle = '#eab308'; ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const s = (i - 2.5) * 0.2;
      ctx.beginPath(); ctx.moveTo(-62, 38); ctx.lineTo(-62 + Math.cos(1.8 + s) * 25, 38 + Math.sin(1.8 + s) * 25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(62, 38); ctx.lineTo(62 + Math.cos(1.3 - s) * 25, 38 + Math.sin(1.3 - s) * 25); ctx.stroke();
    }

    // Body/Shirt (Red, back view)
    ctx.fillStyle = '#c0392b'; ctx.strokeStyle = '#7b241c'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-35, -20); ctx.quadraticCurveTo(0, -30, 35, -20);
    ctx.lineTo(45, 60); ctx.quadraticCurveTo(0, 70, -45, 60);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Shirt folds
    ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(-20, 50); ctx.moveTo(15, -10); ctx.lineTo(20, 50); ctx.stroke();
    // Green patch on left arm
    ctx.fillStyle = '#2ecc71'; ctx.fillRect(-45, 10, 15, 18); ctx.strokeRect(-45, 10, 15, 18);

    // Overalls (Blue, back view)
    ctx.fillStyle = '#2980b9'; ctx.strokeStyle = '#1a5276';
    ctx.beginPath();
    ctx.moveTo(-35, 40); ctx.quadraticCurveTo(0, 30, 35, 40);
    ctx.lineTo(40, 90); ctx.lineTo(-40, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Suspenders crossing in back
    ctx.fillStyle = '#1f618d';
    ctx.beginPath(); ctx.moveTo(-30, 40); ctx.lineTo(30, -20); ctx.lineTo(40, -20); ctx.lineTo(-20, 40); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 40); ctx.lineTo(-30, -20); ctx.lineTo(-40, -20); ctx.lineTo(20, 40); ctx.fill(); ctx.stroke();
    // Patch on pants
    ctx.fillStyle = '#9b59b6'; ctx.fillRect(10, 60, 20, 20); ctx.strokeRect(10, 60, 20, 20);
    ctx.beginPath(); ctx.moveTo(15, 65); ctx.lineTo(25, 75); ctx.moveTo(25, 65); ctx.lineTo(15, 75); ctx.stroke(); // stitches

    // Hat (Back view, very wide brim)
    ctx.translate(0, -50);
    ctx.rotate(0.1); // slight head tilt

    // Back of brim
    ctx.fillStyle = '#eab308'; ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 70, 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Hat weave texture (concentric ellipses)
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1;
    for (let r = 10; r < 70; r += 8) {
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Crown (dome from back)
    ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-40, 5); ctx.quadraticCurveTo(0, -60, 40, 5); ctx.quadraticCurveTo(0, 15, -40, 5); ctx.fill(); ctx.stroke();
    // Red hat band
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(0, 10, 40, 0); ctx.lineTo(42, 5); ctx.quadraticCurveTo(0, 15, -42, 5); ctx.fill();
    ctx.restore();

    // 10. TRACTOR (Right Foreground)
    ctx.save();
    const rx = W * 0.8;
    const ry = H * 0.82;
    ctx.translate(rx, ry);
    ctx.scale(1.2, 1.2); // make it big

    // Back tire (left)
    DrawTire(ctx, -70, 30, 40, 15);

    // Engine/Chassis (Red)
    ctx.fillStyle = '#c0392b'; ctx.strokeStyle = '#7b241c'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-80, -20);
    ctx.lineTo(-40, -40); // curve up to cabin
    ctx.lineTo(20, -40); // hood top
    ctx.quadraticCurveTo(40, -40, 60, -20); // nose curve
    ctx.lineTo(60, 20); // nose front
    ctx.lineTo(-80, 20); // bottom
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Front Grille
    ctx.fillStyle = '#bdc3c7'; ctx.fillRect(45, -15, 10, 30);
    ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(45, -10 + i * 4); ctx.lineTo(55, -10 + i * 4); ctx.stroke(); }

    // Headlight
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(60, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(63, -2, 3, 0, Math.PI * 2); ctx.fill();

    // Exhaust Pipe (Tall chimney)
    ctx.fillStyle = '#34495e';
    ctx.fillRect(10, -100, 8, 60); ctx.strokeRect(10, -100, 8, 60);
    ctx.fillRect(5, -110, 18, 10); ctx.strokeRect(5, -110, 18, 10); // cap

    // Exhaust Smoke
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#7f8c8d';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(15 + i * 15, -120 - i * 20, 10 + i * 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Steering wheel & Seat area
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-30, -35); ctx.lineTo(-10, -60); ctx.stroke(); // steering column
    ctx.beginPath(); ctx.moveTo(-20, -65); ctx.lineTo(0, -55); ctx.stroke(); // wheel

    // Front tire (right)
    DrawTire(ctx, 40, 45, 20, 8);
    // Back tire (right - overlapping)
    DrawTire(ctx, -50, 40, 45, 18);

    // Yellow rim center
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(-50, 40, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(40, 45, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.restore();

  }, []);

  function DrawTire(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, w: number) {
    ctx.fillStyle = '#2c3e50'; ctx.strokeStyle = '#1a252f'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#17202a'; ctx.fill();
    // Tread bumps
    ctx.strokeStyle = '#1a252f'; ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - w / 2), y + Math.sin(a) * (r - w / 2));
      ctx.lineTo(x + Math.cos(a) * (r + w / 2), y + Math.sin(a) * (r + w / 2)); ctx.stroke();
    }
  }

  // Handle Resize
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawBackground(canvas);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawBackground]);


  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none bg-black">
      {/* Background Canvas */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />

      {/* ======================= TOP BAR ======================= */}
      <div className="absolute top-0 left-0 w-full z-40">
        <div className="relative w-full h-14 flex items-center px-4"
          style={{
            background: 'linear-gradient(180deg, #b07c50 0%, #8b5a2b 40%, #5c3a1a 100%)',
            borderBottom: '4px solid #3a1e0a',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.2)'
          }}>
          {/* Wood grain overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 2px, #3a1e0a 2px, #3a1e0a 3px)' }} />

          {/* Back btn */}
          <button className="relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border-[3px] border-[#4a2e14] bg-[#f5e6d3] shadow-[0_2px_5px_rgba(0,0,0,0.5)] active:translate-y-1">
            <ChevronLeft className="text-[#5c3a1a] w-8 h-8 font-black" />
          </button>

          <span className="text-white font-black text-xl tracking-wide ml-4 mr-auto drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px #3a1e0a' }}>
            バトル(ステージ選択)
          </span>

          <div className="flex gap-4 sm:gap-8 items-center mr-4">
            {/* Stamina */}
            <div className="relative flex items-center bg-black/40 rounded-r-full h-8 min-w-[160px] border border-[#3a1e0a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
              {/* Protruding Icon */}
              <div className="absolute -left-6 w-12 h-12">
                <WateringCanIcon />
              </div>
              {/* Bar area */}
              <div className="ml-8 w-full pr-8 py-1">
                <div className="w-full h-4 bg-black/60 rounded-sm border border-[#4d7c0f] overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#84cc16] to-[#4d7c0f]" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                    30/30 <span className="opacity-70 ml-1">(+1 in 18:45)</span>
                  </div>
                </div>
              </div>
              <button className="absolute -right-2 w-7 h-7 bg-gradient-to-b from-[#fca5a5] to-[#dc2626] rounded-full border-2 border-[#7f1d1d] flex items-center justify-center text-white font-black shadow-md hover:scale-110 pb-0.5">+</button>
            </div>

            {/* Gold */}
            <div className="relative flex items-center bg-black/40 rounded-r-full h-8 min-w-[120px] border border-[#3a1e0a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
              <div className="absolute -left-5 w-10 h-10"><GoldIcon /></div>
              <div className="ml-6 w-full text-center pr-4 text-white font-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">12,500</div>
              <button className="absolute -right-2 w-7 h-7 bg-gradient-to-b from-[#86efac] to-[#16a34a] rounded-full border-2 border-[#14532d] flex items-center justify-center text-white font-black shadow-md hover:scale-110 pb-0.5">+</button>
            </div>

            {/* Gem */}
            <div className="relative flex items-center bg-black/40 rounded-r-full h-8 min-w-[80px] border border-[#3a1e0a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] hidden sm:flex">
              <div className="absolute -left-5 w-10 h-10"><GemIcon /></div>
              <div className="ml-6 w-full text-center pr-4 text-white font-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">150</div>
              <button className="absolute -right-2 w-7 h-7 bg-gradient-to-b from-[#86efac] to-[#16a34a] rounded-full border-2 border-[#14532d] flex items-center justify-center text-white font-black shadow-md hover:scale-110 pb-0.5">+</button>
            </div>
          </div>
        </div>

        {/* Metal hanging chains for the stage board (attached to top bar) */}
        <div className="absolute top-14 left-1/2 -translate-x-[110px] w-4 h-12 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 border-x-2 border-gray-800" />
        <div className="absolute top-14 left-1/2 translate-x-[90px] w-4 h-12 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 border-x-2 border-gray-800" />
        {/* Chain links */}
        <div className="absolute top-16 left-1/2 -translate-x-[120px] w-8 h-4 border-4 border-gray-600 rounded-full bg-transparent" />
        <div className="absolute top-16 left-1/2 translate-x-[80px] w-8 h-4 border-4 border-gray-600 rounded-full bg-transparent" />
      </div>

      {/* ======================= SIDE BUTTONS ======================= */}
      <div className="absolute left-4 top-24 z-30 flex flex-col gap-6">
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl p-2 bg-gradient-to-b from-[#a3c2c2] to-[#7a9999] border-4 border-[#3a1e0a] shadow-[0_5px_0_#3a1e0a,_0_10px_10px_rgba(0,0,0,0.5)] relative overflow-hidden active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            <div className="absolute inset-0 bg-white/20" />
            <DroneIcon />
          </div>
          <div className="mt-4 text-center">
            <div className="text-white font-black text-[12px] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '0.5px #000' }}>クイックパトロール</div>
            <div className="text-white/90 font-bold text-[9px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">スタミナ消費で即時報酬</div>
          </div>
        </div>

        <div className="group cursor-pointer flex flex-col items-center mt-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl p-2 bg-gradient-to-b from-[#d4a017] to-[#b45309] border-4 border-[#3a1e0a] shadow-[0_5px_0_#3a1e0a,_0_10px_10px_rgba(0,0,0,0.5)] relative overflow-hidden active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
              <div className="absolute inset-0 bg-white/20" />
              <BasketIcon />
            </div>
            {/* Badge */}
            <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-3 -right-6 bg-white border-2 border-[#d97706] rounded-full px-2 py-0.5 z-10 shadow-lg">
              <span className="text-[#b45309] font-black text-[10px]">収穫アリ!</span>
              <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white border-b-2 border-r-2 border-[#d97706] rotate-45" />
            </motion.div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-white font-black text-[12px] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '0.5px #000' }}>パトロール報酬</div>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-24 z-30 flex flex-col gap-6">
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-2xl p-3 bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] border-4 border-[#3a1e0a] shadow-[0_5px_0_#3a1e0a,_0_10px_10px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            {/* Calendar graphic */}
            <div className="w-full h-full bg-white rounded border border-gray-400 relative">
              <div className="w-full h-3 bg-red-600 rounded-t border-b border-red-800 flex justify-evenly items-center">
                <div className="w-1.5 h-3 bg-gray-200 rounded-full -mt-2 border border-gray-400" />
                <div className="w-1.5 h-3 bg-gray-200 rounded-full -mt-2 border border-gray-400" />
              </div>
              <div className="text-[10px] font-black text-center mt-0.5 text-gray-800">LOGIN</div>
              <div className="absolute mt-1 left-1.5 text-green-500 font-black text-lg">✓</div>
            </div>
          </div>
          <div className="mt-4 rounded bg-[#8b5a2b] border-2 border-[#4a2e14] px-4 py-0.5 shadow-md">
            <div className="text-white font-black text-[12px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">ログイン</div>
          </div>
        </div>

        <div className="group cursor-pointer flex flex-col items-center mt-2">
          <div className="w-16 h-16 rounded-2xl p-2 bg-gradient-to-b from-[#8b5a2b] to-[#5c4033] border-4 border-[#3a1e0a] shadow-[0_5px_0_#3a1e0a,_0_10px_10px_rgba(0,0,0,0.5)] relative active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            <GrasshopperIcon />
          </div>
          <div className="mt-4 rounded bg-[#8b5a2b] border-2 border-[#4a2e14] px-4 py-0.5 shadow-md">
            <div className="text-white font-black text-[12px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">イベント</div>
          </div>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-white font-black text-[10px] mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '0.5px #000' }}>
            緊急クエスト!
          </motion.div>
        </div>
      </div>


      {/* ======================= CENTRAL STAGE BOARD ======================= */}
      <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {/* Main Wood Board */}
        <div className="relative p-4 rounded-xl w-[420px]"
          style={{
            background: 'linear-gradient(180deg, #d2a679, #ad7f50)',
            border: '6px solid #5c3a1e',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.4)'
          }}>
          {/* Horizontal wood panel lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-evenly">
            <div className="w-full h-px bg-black" /><div className="w-full h-px bg-black" /><div className="w-full h-px bg-black" />
          </div>

          {/* Top bolts */}
          <div className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border-2 border-gray-800 shadow-md flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-800" /></div>
          <div className="absolute -top-3 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border-2 border-gray-800 shadow-md flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-800" /></div>
          {/* Bottom bolts */}
          <div className="absolute -bottom-3 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border-2 border-gray-800 shadow-md flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-800" /></div>
          <div className="absolute -bottom-3 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 border-2 border-gray-800 shadow-md flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-800" /></div>

          {/* Stage Text */}
          <div className="text-center mt-2 mb-4">
            <div className="text-white text-base font-black drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] tracking-widest" style={{ WebkitTextStroke: '1px #3a1e0a' }}>STAGE 1:</div>
            <div className="text-white text-4xl font-black drop-shadow-[0_3px_2px_rgba(0,0,0,0.8)] tracking-wide mt-1" style={{ WebkitTextStroke: '1.5px #3a1e0a' }}>イナゴ襲来！</div>
          </div>

          {/* Picture Frame */}
          <div className="relative bg-[#f5e6d3] p-1.5 rounded border-2 border-[#8b5a2b] shadow-inner mb-4">
            {/* Photo contents (Locusts in field) */}
            <div className="w-full h-44 bg-gradient-to-b from-[#87ceeb] to-[#fcd34d] relative overflow-hidden rounded-sm border border-[#a16207]">
              {/* Tiny sun */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white opacity-80 shadow-[0_0_20px_#fff]" />
              {/* Wheat field in photo */}
              <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#ca8a04] to-[#eab308]">
                {/* Draw some wheat lines */}
                <div className="w-full h-full opacity-30" style={{ background: 'repeating-linear-gradient(60deg, transparent, transparent 5px, #854d0e 5px, #854d0e 7px)' }} />
              </div>
              {/* Locust Silhouettes/Images */}
              <div className="absolute inset-0 flex items-center justify-center gap-6">
                <GrasshopperIcon />
              </div>
              {/* WARNING STAMP */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-[6px] border-red-600/80 rounded px-6 py-2 rotate-[-15deg] shadow-lg backdrop-blur-sm bg-white/20">
                  <span className="text-red-600/90 font-black text-4xl tracking-widest drop-shadow-sm">WARNING</span>
                </div>
              </div>
            </div>

            {/* Tape corners */}
            <div className="absolute -top-2 -left-3 w-12 h-6 bg-white/50 backdrop-blur-sm rotate-[-45deg] shadow-sm flex items-center">
              <div className="w-full border-t border-dashed border-white/80" />
            </div>
            <div className="absolute top-2 -right-3 w-12 h-6 bg-white/50 backdrop-blur-sm rotate-[45deg] shadow-sm flex items-center">
              <div className="w-full border-t border-dashed border-white/80" />
            </div>
          </div>

          {/* Metallic Mount Bottom */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Hanging metal links */}
            <div className="flex gap-16">
              <div className="w-6 h-12 bg-gray-400 border-x-4 border-gray-600 flex items-center justify-center"><div className="w-2 h-8 rounded-full bg-gray-800" /></div>
              <div className="w-6 h-12 bg-gray-400 border-x-4 border-gray-600 flex items-center justify-center"><div className="w-2 h-8 rounded-full bg-gray-800" /></div>
            </div>

            {/* Metal cross wheels (X) */}
            <div className="absolute top-4 flex gap-16">
              <div className="w-12 h-12 rounded-full border-4 border-gray-600 bg-gray-400 flex items-center justify-center transform -translate-x-3 shadow-md">
                <div className="text-gray-700 font-black text-2xl rotate-45">+</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-gray-600 bg-gray-400 flex items-center justify-center transform translate-x-3 shadow-md">
                <div className="text-gray-700 font-black text-2xl rotate-45">+</div>
              </div>
            </div>

            {/* Main metal base block for button */}
            <div className="relative mt-2 p-2 rounded-xl bg-gradient-to-b from-gray-300 to-gray-500 border-4 border-gray-700 shadow-2xl flex items-center gap-4 w-[280px]">
              {/* Metal Gear */}
              <div className="w-16 h-16 rounded-full border-4 border-gray-600 bg-gray-300 absolute -left-6 flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 rounded-full border-4 border-gray-600 bg-gray-400 shadow-inner" />
                {/* Gear teeth */}
                {[0, 45, 90, 135].map(deg => (
                  <div key={deg} className="absolute w-20 h-4 bg-gray-500 -z-10" style={{ transform: `rotate(${deg}deg)` }} />
                ))}
              </div>
              {/* Red Lever */}
              <div className="absolute -left-2 -top-10 w-3 h-16 bg-gray-500 border border-gray-700 rounded-t-full origin-bottom rotate-[-15deg] shadow-lg">
                <div className="absolute -top-3 -left-2 w-7 h-7 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-red-800 shadow-md" />
              </div>

              {/* Deploy Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="ml-10 w-full rounded-lg bg-gradient-to-b from-[#fcd34d] to-[#d97706] border-[3px] border-[#92400e] shadow-[0_6px_0_#78350f] active:shadow-none active:translate-y-[6px] flex items-center justify-center py-2 px-4 gap-2"
              >
                <span className="text-white font-black text-3xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px #451a03' }}>出発</span>
                <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
                  <div className="w-6 h-6"><WateringCanIcon /></div>
                  <span className="text-white font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">-5</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
