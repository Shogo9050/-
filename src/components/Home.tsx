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
  const drawBackground = useCallback((canvas: HTMLCanvasElement, time: number = 0) => {
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

    // 9. SCARECROW (GAME BATTLE SKIN - Back view, with breathing idle)
    const breathOffset = Math.sin(time * 0.002) * 4; // Sine-wave breathing
    const breathScale = 1 + Math.sin(time * 0.002) * 0.01; // subtle scale pulse
    ctx.save();
    const cx = W * 0.12;
    const cy = H * 0.85 + breathOffset;
    ctx.translate(cx, cy);
    ctx.scale(1.8 * breathScale, 1.8 * breathScale); // scale up game sprite for lobby
    ctx.scale(-1, 1); // mirror to face right (back view looking at tornado)

    // -- Shadow --
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 32, 22, 6, 0, 0, Math.PI * 2); ctx.fill();

    // -- Legs (straw poles) --
    ctx.fillStyle = '#c49a3c';
    ctx.fillRect(-10, 22, 6, 10); ctx.fillRect(4, 22, 6, 10);
    ctx.strokeStyle = '#9a7520'; ctx.lineWidth = 1;
    ctx.strokeRect(-10, 22, 6, 10); ctx.strokeRect(4, 22, 6, 10);
    // Straw tufts at feet
    ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, 31); ctx.lineTo(-15, 36); ctx.moveTo(-7, 32); ctx.lineTo(-7, 38);
    ctx.moveTo(-3, 31); ctx.lineTo(0, 35); ctx.moveTo(3, 31); ctx.lineTo(0, 35);
    ctx.moveTo(7, 32); ctx.lineTo(7, 38); ctx.moveTo(11, 31); ctx.lineTo(15, 36);
    ctx.stroke();

    // -- Overalls (Blue denim, back view) --
    ctx.fillStyle = '#5b9bd5';
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(-16, 22); ctx.lineTo(16, 22); ctx.lineTo(15, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a8bc4'; ctx.fillRect(-15, 12, 30, 10);
    ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-16, 22); ctx.lineTo(16, 22); ctx.lineTo(15, 0); ctx.stroke();
    // Suspender straps (crossing on back)
    ctx.fillStyle = '#5b9bd5';
    ctx.fillRect(-12, -14, 7, 16); ctx.fillRect(5, -14, 7, 16);
    ctx.strokeStyle = '#3a6fa0'; ctx.lineWidth = 1;
    ctx.strokeRect(-12, -14, 7, 16); ctx.strokeRect(5, -14, 7, 16);
    // Metal rivet buttons
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.arc(-8.5, -1, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8.5, -1, 2.5, 0, Math.PI * 2); ctx.fill();
    // Purple patch on overalls
    ctx.save(); ctx.translate(-9, 13); ctx.rotate(-0.08);
    ctx.fillStyle = '#d8a0e8'; ctx.fillRect(0, 0, 9, 8);
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.2; ctx.strokeRect(0, 0, 9, 8);
    ctx.restore();

    // -- Shirt (Red plaid, back view) --
    ctx.fillStyle = '#d04030';
    ctx.beginPath();
    ctx.moveTo(-18, -20); ctx.quadraticCurveTo(0, -24, 18, -20);
    ctx.lineTo(16, 2); ctx.lineTo(-16, 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8b2020'; ctx.lineWidth = 1; ctx.stroke();
    // Plaid pattern on back
    ctx.globalAlpha = 0.3; ctx.strokeStyle = '#2a0a0a'; ctx.lineWidth = 1;
    for (let i = -15; i < 15; i += 5) { ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i, 2); ctx.stroke(); }
    for (let j = -20; j < 2; j += 5) { ctx.beginPath(); ctx.moveTo(-18, j); ctx.lineTo(18, j); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // -- Arms (straw sticks from back) --
    ctx.strokeStyle = '#c49a3c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const armSway = Math.sin(time * 0.003) * 3;
    ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(-30, 8 + armSway); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, -8); ctx.lineTo(30, 8 - armSway); ctx.stroke();
    // Straw hands
    ctx.strokeStyle = '#d4a84b'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const s = (i - 1.5) * 0.3;
      ctx.beginPath(); ctx.moveTo(-30, 8 + armSway); ctx.lineTo(-30 + Math.cos(1.5 + s) * 12, 8 + armSway + Math.sin(1.5 + s) * 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, 8 - armSway); ctx.lineTo(30 + Math.cos(1.6 - s) * 12, 8 - armSway + Math.sin(1.6 - s) * 12); ctx.stroke();
    }

    // -- Scarf (Red, flowing from back) --
    ctx.fillStyle = '#e74c3c'; ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.5;
    const scarfSway = Math.sin(time * 0.0025) * 5;
    ctx.beginPath();
    ctx.moveTo(-10, -20); ctx.quadraticCurveTo(-15 + scarfSway, -28, -8, -35 + scarfSway);
    ctx.quadraticCurveTo(-2, -30, 2, -35 - scarfSway);
    ctx.quadraticCurveTo(8, -28, 10, -20);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // -- Head (burlap circle, back) --
    ctx.fillStyle = '#f5deb3'; ctx.strokeStyle = '#c49a3c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -30, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Burlap texture on back of head
    ctx.globalAlpha = 0.2; ctx.strokeStyle = '#9a7520'; ctx.lineWidth = 0.5;
    for (let i = -12; i < 12; i += 3) { ctx.beginPath(); ctx.moveTo(i, -42); ctx.lineTo(i, -18); ctx.stroke(); }
    for (let j = -42; j < -18; j += 3) { ctx.beginPath(); ctx.moveTo(-12, j); ctx.lineTo(12, j); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // -- Hat (Straw hat, back view with weave) --
    ctx.fillStyle = '#eab308'; ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2;
    // Brim
    ctx.beginPath(); ctx.ellipse(0, -40, 28, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Weave rings
    ctx.strokeStyle = '#b8960e'; ctx.lineWidth = 0.5;
    for (let r = 5; r < 28; r += 4) { ctx.beginPath(); ctx.ellipse(0, -40, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke(); }
    // Crown
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.moveTo(-18, -42); ctx.quadraticCurveTo(0, -65, 18, -42); ctx.quadraticCurveTo(0, -36, -18, -42); ctx.fill();
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.5; ctx.stroke();
    // Red hat band
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.moveTo(-18, -42); ctx.quadraticCurveTo(0, -36, 18, -42); ctx.lineTo(19, -40); ctx.quadraticCurveTo(0, -34, -19, -40); ctx.fill();

    ctx.restore();

    // 10. TRACTOR (Far Right Edge, smaller to not obstruct UI)
    ctx.save();
    const rx = W * 0.92;
    const ry = H * 0.88;
    ctx.translate(rx, ry);
    ctx.scale(0.85, 0.85); // smaller, pushed to right edge

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

  // Animation loop for breathing idle + resize
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const animate = (time: number) => {
      drawBackground(canvas, time);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [drawBackground]);


  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none bg-black">
      {/* Background Canvas */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />

      {/* ======================= TOP BAR ======================= */}
      <div className="absolute top-0 left-0 w-full z-40">
        <div className="relative w-full h-14 flex items-center justify-between px-3"
          style={{
            background: 'linear-gradient(180deg, #b07c50 0%, #8b5a2b 40%, #5c3a1a 100%)',
            borderBottom: '4px solid #3a1e0a',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.2)'
          }}>
          {/* Wood grain overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 2px, #3a1e0a 2px, #3a1e0a 3px)' }} />

          {/* ===== LEFT: Back + Player Icon + Settings ===== */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Back btn */}
            <button className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border-[3px] border-[#4a2e14] bg-[#f5e6d3] shadow-[0_2px_5px_rgba(0,0,0,0.5)] active:translate-y-1">
              <ChevronLeft className="text-[#5c3a1a] w-7 h-7" />
            </button>

            {/* Player Level Icon */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#facc15] overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                style={{ background: 'linear-gradient(135deg, #fde68a, #d4a017)' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="11" r="7" fill="#f5deb3" stroke="#8b5a2b" strokeWidth="1.5" />
                  <ellipse cx="12" cy="6" rx="9" ry="2.5" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                  <path d="M8 6Q12 0 16 6" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
                  <path d="M9 10l1.5 1.5M10.5 10l-1.5 1.5" stroke="#5c3a1a" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M13.5 10l1.5 1.5M15 10l-1.5 1.5" stroke="#5c3a1a" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M10 14h4" stroke="#5c3a1a" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-sm leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '0.5px #3a1e0a' }}>Lv.1</span>
                <span className="text-white/70 text-[9px] font-bold leading-tight">かかし見習い</span>
              </div>
            </div>

            {/* Settings btn */}
            <button className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border-2 border-[#4a2e14] shadow-[0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-0.5"
              style={{ background: 'linear-gradient(180deg, #8b6a3e, #6b4226)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f5e6d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* ===== RIGHT: Resources ===== */}
          <div className="flex gap-3 items-center relative z-10">
            {/* Stamina */}
            <div className="relative flex items-center bg-black/40 rounded-full h-7 min-w-[130px] border border-[#3a1e0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="absolute -left-4 w-9 h-9"><WateringCanIcon /></div>
              <div className="ml-6 w-full pr-7 py-0.5">
                <div className="w-full h-3.5 bg-black/60 rounded-sm border border-[#4d7c0f] overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#84cc16] to-[#4d7c0f]" />
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                    30/30
                  </div>
                </div>
              </div>
              <button className="absolute -right-1.5 w-5 h-5 bg-gradient-to-b from-[#fca5a5] to-[#dc2626] rounded-full border-2 border-[#7f1d1d] flex items-center justify-center text-white text-[10px] font-black shadow-sm">+</button>
            </div>

            {/* Gold */}
            <div className="relative flex items-center bg-black/40 rounded-full h-7 min-w-[90px] border border-[#3a1e0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="absolute -left-3.5 w-8 h-8"><GoldIcon /></div>
              <div className="ml-5 w-full text-center pr-3 text-white font-black text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">12,500</div>
              <button className="absolute -right-1.5 w-5 h-5 bg-gradient-to-b from-[#86efac] to-[#16a34a] rounded-full border-2 border-[#14532d] flex items-center justify-center text-white text-[10px] font-black shadow-sm">+</button>
            </div>

            {/* Gem */}
            <div className="relative flex items-center bg-black/40 rounded-full h-7 min-w-[70px] border border-[#3a1e0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="absolute -left-3.5 w-8 h-8"><GemIcon /></div>
              <div className="ml-5 w-full text-center pr-3 text-white font-black text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">150</div>
              <button className="absolute -right-1.5 w-5 h-5 bg-gradient-to-b from-[#86efac] to-[#16a34a] rounded-full border-2 border-[#14532d] flex items-center justify-center text-white text-[10px] font-black shadow-sm">+</button>
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

      {/* ======================= RIGHT SIDE BUTTONS (All consolidated) ======================= */}
      <div className="absolute right-3 top-20 z-30 flex flex-col gap-3">
        {/* Login */}
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="relative w-14 h-14 rounded-2xl p-2.5 bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] border-3 border-[#3a1e0a] shadow-[0_4px_0_#3a1e0a,_0_8px_8px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            <div className="w-full h-full bg-white rounded border border-gray-400 relative">
              <div className="w-full h-2.5 bg-red-600 rounded-t border-b border-red-800 flex justify-evenly items-center">
                <div className="w-1 h-2.5 bg-gray-200 rounded-full -mt-1.5 border border-gray-400" />
                <div className="w-1 h-2.5 bg-gray-200 rounded-full -mt-1.5 border border-gray-400" />
              </div>
              <div className="text-[8px] font-black text-center mt-0.5 text-gray-800">LOGIN</div>
              <div className="absolute mt-0 left-1 text-green-500 font-black text-base">✓</div>
            </div>
          </div>
          <span className="game-text text-[9px] mt-1" style={{ color: '#d4d4d8' }}>ログイン</span>
        </div>

        {/* Event */}
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl p-1.5 bg-gradient-to-b from-[#8b5a2b] to-[#5c4033] border-3 border-[#3a1e0a] shadow-[0_4px_0_#3a1e0a,_0_8px_8px_rgba(0,0,0,0.4)] relative active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            <GrasshopperIcon />
          </div>
          <span className="game-text text-[9px] mt-1" style={{ color: '#d4d4d8' }}>イベント</span>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-[8px] font-black" style={{ color: '#f87171', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}>
            緊急クエスト!
          </motion.div>
        </div>

        {/* Quick Patrol */}
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl p-1.5 bg-gradient-to-b from-[#a3c2c2] to-[#7a9999] border-3 border-[#3a1e0a] shadow-[0_4px_0_#3a1e0a,_0_8px_8px_rgba(0,0,0,0.4)] relative overflow-hidden active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
            <div className="absolute inset-0 bg-white/20" />
            <DroneIcon />
          </div>
          <span className="game-text text-[9px] mt-1" style={{ color: '#d4d4d8' }}>パトロール</span>
        </div>

        {/* Patrol Reward */}
        <div className="group cursor-pointer flex flex-col items-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl p-1.5 bg-gradient-to-b from-[#d4a017] to-[#b45309] border-3 border-[#3a1e0a] shadow-[0_4px_0_#3a1e0a,_0_8px_8px_rgba(0,0,0,0.4)] relative overflow-hidden active:translate-y-1 active:shadow-[0_0px_0_#3a1e0a]">
              <div className="absolute inset-0 bg-white/20" />
              <BasketIcon />
            </div>
            <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -top-2 -left-5 bg-white border-2 border-[#d97706] rounded-full px-1.5 py-0.5 z-10 shadow-md">
              <span className="text-[#b45309] font-black text-[8px]">収穫アリ!</span>
            </motion.div>
          </div>
          <span className="game-text text-[9px] mt-1" style={{ color: '#d4d4d8' }}>報酬</span>
        </div>
      </div>


      {/* ======================= CENTRAL STAGE BOARD (drops in with bounce) ======================= */}
      <motion.div
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 }}
        className="absolute top-[70px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
      >
        {/* Main Wood Board */}
        <div className="relative p-6 rounded-2xl w-[520px] max-w-[90vw]"
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
            <div className="text-white text-lg font-black drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] tracking-widest" style={{ WebkitTextStroke: '1px #3a1e0a' }}>STAGE 1:</div>
            <div className="text-white text-5xl font-black drop-shadow-[0_3px_2px_rgba(0,0,0,0.8)] tracking-wide mt-1" style={{ WebkitTextStroke: '2px #3a1e0a' }}>イナゴ襲来！</div>
          </div>

          {/* Picture Frame */}
          <div className="relative bg-[#f5e6d3] p-1.5 rounded border-2 border-[#8b5a2b] shadow-inner mb-4">
            {/* Photo contents (Locusts in field) */}
            <div className="w-full h-52 bg-gradient-to-b from-[#87ceeb] to-[#fcd34d] relative overflow-hidden rounded-sm border border-[#a16207]">
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
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
      </motion.div>

      {/* ======================= BOTTOM NAVIGATION BAR ======================= */}
      <div className="absolute bottom-0 left-0 w-full z-40">
        <div className="w-full flex items-end justify-center"
          style={{
            background: 'linear-gradient(180deg, rgba(30,33,56,0) 0%, rgba(30,33,56,0.95) 30%, #1a1d2e 100%)',
            paddingTop: '20px',
          }}>
          <div className="w-full max-w-2xl flex items-end mx-auto px-2 pb-2 gap-1">

            {/* Tab 1: ショップ */}
            <button className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all group"
              style={{
                background: 'linear-gradient(180deg, rgba(90,96,128,0.6), rgba(42,46,72,0.8))',
                border: '2px solid #4a5070',
              }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fcd34d, #d97706)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5c3a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" fill="#f59e0b" stroke="#92400e" />
                  <circle cx="12" cy="12" r="6" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
                  <text x="12" y="16" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="bold" stroke="none">¥</text>
                </svg>
              </div>
              <span className="game-text text-[10px]" style={{ color: '#8892b0' }}>ショップ</span>
            </button>

            {/* Tab 2: キャラ */}
            <button className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all group"
              style={{
                background: 'linear-gradient(180deg, rgba(90,96,128,0.6), rgba(42,46,72,0.8))',
                border: '2px solid #4a5070',
              }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fde68a, #d4a017)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  {/* Scarecrow face mini icon */}
                  <circle cx="12" cy="11" r="8" fill="#f5deb3" stroke="#8b5a2b" strokeWidth="1.5" />
                  {/* Hat brim */}
                  <ellipse cx="12" cy="5" rx="10" ry="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                  {/* Hat dome */}
                  <path d="M7 5Q12 -2 17 5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  {/* X eyes */}
                  <path d="M8 10l2 2M10 10l-2 2" stroke="#5c3a1a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M14 10l2 2M16 10l-2 2" stroke="#5c3a1a" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Stitch smile */}
                  <path d="M9 15h6" stroke="#5c3a1a" strokeWidth="1.5" />
                  <path d="M10 14v2M12 14v2M14 14v2" stroke="#5c3a1a" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <span className="game-text text-[10px]" style={{ color: '#8892b0' }}>キャラ</span>
            </button>

            {/* Tab 3: 装備 */}
            <button className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all group"
              style={{
                background: 'linear-gradient(180deg, rgba(90,96,128,0.6), rgba(42,46,72,0.8))',
                border: '2px solid #4a5070',
              }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a3a3a3, #737373)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  {/* Hoe icon */}
                  <line x1="6" y1="20" x2="16" y2="6" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                  <path d="M14 4l6 4-3 2-5-4z" fill="#d1d5db" stroke="#6b7280" strokeWidth="1.5" strokeLinejoin="round" />
                  {/* Small sword cross */}
                  <line x1="18" y1="14" x2="22" y2="18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="19" y1="16" x2="21" y2="16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="game-text text-[10px]" style={{ color: '#8892b0' }}>装備</span>
            </button>

            {/* Tab 4: 農地開拓 (ACTIVE) */}
            <button className="flex-1 flex flex-col items-center gap-1 px-1 rounded-xl transition-all relative"
              style={{
                background: 'linear-gradient(180deg, rgba(250,204,21,0.25), rgba(234,179,8,0.15), rgba(42,46,72,0.9))',
                border: '2px solid #facc15',
                boxShadow: '0 0 20px rgba(250,204,21,0.3), inset 0 0 15px rgba(250,204,21,0.1)',
                paddingTop: '6px',
                paddingBottom: '10px',
                marginTop: '-8px',
              }}>
              {/* Active indicator arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #facc15' }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                  boxShadow: '0 0 15px rgba(74,222,128,0.5), 0 3px 8px rgba(0,0,0,0.5)',
                  border: '2px solid #22c55e',
                }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                  {/* Tractor mini icon */}
                  <rect x="4" y="8" width="12" height="8" rx="1" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                  <rect x="14" y="6" width="6" height="6" rx="1" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
                  {/* Wheels */}
                  <circle cx="8" cy="18" r="3.5" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                  <circle cx="8" cy="18" r="1.5" fill="#6b7280" />
                  <circle cx="17" cy="18" r="2.5" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                  <circle cx="17" cy="18" r="1" fill="#6b7280" />
                  {/* Exhaust */}
                  <line x1="18" y1="6" x2="18" y2="2" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="18" cy="1" r="1.5" fill="#9ca3b8" opacity="0.5" />
                  {/* Ground line */}
                  <line x1="2" y1="21" x2="22" y2="21" stroke="#854d0e" strokeWidth="1.5" />
                  <line x1="3" y1="22" x2="5" y2="22" stroke="#a16207" strokeWidth="1" />
                  <line x1="7" y1="22" x2="9" y2="22" stroke="#a16207" strokeWidth="1" />
                  <line x1="11" y1="22" x2="13" y2="22" stroke="#a16207" strokeWidth="1" />
                </svg>
              </div>
              <span className="game-text text-[11px] font-black" style={{ color: '#facc15' }}>農地開拓</span>
            </button>

          </div>
        </div>
      </div>
    </div >
  );
};
