import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Calendar,
  Bug,
  Plane,
  ShoppingBasket
} from 'lucide-react';
import { Player } from '../game/entities';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const charCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the entire illustrated background scene
  const drawBackground = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // ===== SKY =====
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    skyGrad.addColorStop(0, '#7ec8e3');
    skyGrad.addColorStop(0.5, '#a8dce8');
    skyGrad.addColorStop(1, '#d4e8c0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.55);

    // Clouds
    const drawCloud = (x: number, y: number, s: number) => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(x, y, 20 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 18 * s, y - 5 * s, 16 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 15 * s, y + 3 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 8 * s, y - 12 * s, 12 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 30 * s, y + 2 * s, 12 * s, 0, Math.PI * 2); ctx.fill();
    };
    drawCloud(W * 0.12, H * 0.08, 1.8);
    drawCloud(W * 0.55, H * 0.05, 1.2);
    drawCloud(W * 0.82, H * 0.12, 1.5);
    drawCloud(W * 0.35, H * 0.15, 0.8);

    // ===== DISTANT HILLS =====
    ctx.fillStyle = '#6ba34a';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.42);
    ctx.quadraticCurveTo(W * 0.15, H * 0.32, W * 0.3, H * 0.38);
    ctx.quadraticCurveTo(W * 0.5, H * 0.44, W * 0.65, H * 0.36);
    ctx.quadraticCurveTo(W * 0.8, H * 0.3, W, H * 0.4);
    ctx.lineTo(W, H * 0.5); ctx.lineTo(0, H * 0.5);
    ctx.closePath(); ctx.fill();

    // Mid-distance hills
    ctx.fillStyle = '#548c3a';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.46);
    ctx.quadraticCurveTo(W * 0.2, H * 0.4, W * 0.4, H * 0.44);
    ctx.quadraticCurveTo(W * 0.6, H * 0.48, W * 0.75, H * 0.42);
    ctx.quadraticCurveTo(W * 0.9, H * 0.38, W, H * 0.45);
    ctx.lineTo(W, H * 0.55); ctx.lineTo(0, H * 0.55);
    ctx.closePath(); ctx.fill();

    // ===== WHEAT FIELD (middle) =====
    const fieldGrad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.75);
    fieldGrad.addColorStop(0, '#d4a017');
    fieldGrad.addColorStop(0.5, '#c8960e');
    fieldGrad.addColorStop(1, '#a07820');
    ctx.fillStyle = fieldGrad;
    ctx.fillRect(0, H * 0.48, W, H * 0.3);

    // Wheat stalks in field
    for (let x = 0; x < W; x += 6) {
      const baseY = H * 0.5 + Math.sin(x * 0.02) * 8;
      const h = 15 + Math.random() * 20;
      const sway = Math.sin(x * 0.05) * 3;
      ctx.strokeStyle = `hsl(${42 + Math.random() * 10}, ${60 + Math.random() * 20}%, ${50 + Math.random() * 15}%)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, baseY + 10);
      ctx.quadraticCurveTo(x + sway * 0.5, baseY + 5 - h / 2, x + sway, baseY - h);
      ctx.stroke();
      // tiny wheat head
      if (Math.random() > 0.3) {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(x + sway, baseY - h - 2, 2, 4, sway * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ===== FOREGROUND DIRT =====
    const dirtGrad = ctx.createLinearGradient(0, H * 0.72, 0, H);
    dirtGrad.addColorStop(0, '#7a6040');
    dirtGrad.addColorStop(0.4, '#5c4530');
    dirtGrad.addColorStop(1, '#3d2e1e');
    ctx.fillStyle = dirtGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.72);
    ctx.quadraticCurveTo(W * 0.3, H * 0.68, W * 0.5, H * 0.73);
    ctx.quadraticCurveTo(W * 0.7, H * 0.78, W, H * 0.7);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    // Dirt path
    ctx.fillStyle = '#6b5038';
    ctx.beginPath();
    ctx.moveTo(W * 0.3, H);
    ctx.quadraticCurveTo(W * 0.4, H * 0.82, W * 0.55, H * 0.75);
    ctx.quadraticCurveTo(W * 0.65, H * 0.7, W * 0.75, H * 0.65);
    ctx.quadraticCurveTo(W * 0.85, H * 0.68, W * 0.8, H * 0.78);
    ctx.lineTo(W * 0.7, H);
    ctx.closePath(); ctx.fill();

    // ===== WOODEN FENCE (left) =====
    const drawFence = (startX: number, y: number, count: number) => {
      ctx.fillStyle = '#6b4226';
      ctx.strokeStyle = '#4a2e14';
      ctx.lineWidth = 1;
      for (let i = 0; i < count; i++) {
        const fx = startX + i * 30;
        // vertical post
        ctx.fillRect(fx, y - 50, 6, 60);
        ctx.strokeRect(fx, y - 50, 6, 60);
        // post top (pointed)
        ctx.beginPath();
        ctx.moveTo(fx - 1, y - 50);
        ctx.lineTo(fx + 3, y - 58);
        ctx.lineTo(fx + 7, y - 50);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // horizontal bars
      ctx.fillStyle = '#7a5030';
      ctx.fillRect(startX - 3, y - 38, count * 30 + 6, 5);
      ctx.fillRect(startX - 3, y - 22, count * 30 + 6, 5);
      ctx.strokeRect(startX - 3, y - 38, count * 30 + 6, 5);
      ctx.strokeRect(startX - 3, y - 22, count * 30 + 6, 5);
    };
    drawFence(10, H * 0.82, 4);

    // ===== WOODEN LOGS (crossed, left foreground) =====
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(5, H * 0.88); ctx.lineTo(60, H * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, H * 0.88); ctx.lineTo(20, H * 0.73); ctx.stroke();
    ctx.strokeStyle = '#7a5030';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(7, H * 0.87); ctx.lineTo(58, H * 0.76); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(38, H * 0.87); ctx.lineTo(22, H * 0.74); ctx.stroke();

    // ===== TRACTOR (right side) =====
    const tx = W * 0.78;
    const ty = H * 0.72;
    // Body
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(tx - 30, ty - 25, 60, 30);
    // Hood/engine
    ctx.fillStyle = '#a93226';
    ctx.fillRect(tx + 25, ty - 15, 28, 20);
    // Roof
    ctx.fillStyle = '#333';
    ctx.fillRect(tx - 25, ty - 42, 40, 4);
    // Support poles
    ctx.fillStyle = '#444';
    ctx.fillRect(tx - 22, ty - 42, 3, 18);
    ctx.fillRect(tx + 10, ty - 42, 3, 18);
    // Window
    ctx.fillStyle = '#87ceeb';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(tx - 18, ty - 22, 30, 12);
    ctx.globalAlpha = 1;
    // Big back wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(tx - 12, ty + 10, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(tx - 12, ty + 10, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(tx - 12, ty + 10, 6, 0, Math.PI * 2); ctx.fill();
    // Front wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(tx + 42, ty + 12, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(tx + 42, ty + 12, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(tx + 42, ty + 12, 4, 0, Math.PI * 2); ctx.fill();
    // Exhaust pipe
    ctx.fillStyle = '#444';
    ctx.fillRect(tx + 40, ty - 30, 4, 16);
    // Smoke puffs
    ctx.fillStyle = 'rgba(100,100,100,0.3)';
    ctx.beginPath(); ctx.arc(tx + 42, ty - 35, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + 45, ty - 42, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + 40, ty - 50, 4, 0, Math.PI * 2); ctx.fill();

    // ===== TORNADO / LOCUST SWARM (right background) =====
    ctx.save();
    const tornadoX = W * 0.88;
    const tornadoTopY = H * 0.15;
    const tornadoBottomY = H * 0.55;
    // Main tornado funnel
    ctx.globalAlpha = 0.4;
    const torGrad = ctx.createLinearGradient(tornadoX, tornadoTopY, tornadoX, tornadoBottomY);
    torGrad.addColorStop(0, '#2a2a2a');
    torGrad.addColorStop(0.5, '#4a4a3a');
    torGrad.addColorStop(1, '#6a6a4a');
    ctx.fillStyle = torGrad;
    ctx.beginPath();
    ctx.moveTo(tornadoX - 8, tornadoTopY);
    ctx.quadraticCurveTo(tornadoX - 40, (tornadoTopY + tornadoBottomY) / 2, tornadoX - 50, tornadoBottomY);
    ctx.lineTo(tornadoX + 50, tornadoBottomY);
    ctx.quadraticCurveTo(tornadoX + 40, (tornadoTopY + tornadoBottomY) / 2, tornadoX + 8, tornadoTopY);
    ctx.closePath(); ctx.fill();
    // Swirl lines
    ctx.strokeStyle = 'rgba(60,50,30,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const y = tornadoTopY + (tornadoBottomY - tornadoTopY) * t;
      const spread = 8 + t * 40;
      ctx.beginPath();
      ctx.arc(tornadoX, y, spread, 0.5 + t, 2.5 + t);
      ctx.stroke();
    }
    // Locust dots in tornado
    ctx.fillStyle = '#3a3a1a';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 30; i++) {
      const t = Math.random();
      const y = tornadoTopY + (tornadoBottomY - tornadoTopY) * t;
      const spread = 8 + t * 40;
      const angle = Math.random() * Math.PI * 2;
      const lx = tornadoX + Math.cos(angle) * spread * Math.random();
      const ly = y + (Math.random() - 0.5) * 10;
      ctx.fillRect(lx - 2, ly - 1, 4, 2);
    }
    ctx.restore();

    // ===== SMALL LOCUST BUGS flying (right side) =====
    const drawLocust = (x: number, y: number, s: number, flip: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      if (flip) ctx.scale(-1, 1);
      ctx.scale(s, s);
      // Body
      ctx.fillStyle = '#5a7a20';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Head
      ctx.fillStyle = '#4a6a18';
      ctx.beginPath();
      ctx.arc(10, -1, 4, 0, Math.PI * 2); ctx.fill();
      // Wings
      ctx.fillStyle = 'rgba(150,180,100,0.5)';
      ctx.beginPath();
      ctx.ellipse(-2, -4, 8, 3, -0.3, 0, Math.PI * 2); ctx.fill();
      // Legs
      ctx.strokeStyle = '#3a5a10';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-3, 3); ctx.lineTo(-8, 10); ctx.lineTo(-12, 6);
      ctx.moveTo(2, 3); ctx.lineTo(5, 10); ctx.lineTo(1, 6);
      ctx.stroke();
      // Antenna
      ctx.beginPath();
      ctx.moveTo(12, -3); ctx.lineTo(16, -8);
      ctx.moveTo(11, -4); ctx.lineTo(14, -10);
      ctx.stroke();
      ctx.restore();
    };
    drawLocust(W * 0.75, H * 0.3, 0.8, false);
    drawLocust(W * 0.82, H * 0.25, 0.6, true);
    drawLocust(W * 0.9, H * 0.35, 0.5, false);
    drawLocust(W * 0.85, H * 0.42, 0.7, true);
    drawLocust(W * 0.78, H * 0.38, 0.4, false);

    // ===== WOODEN FENCE (right foreground) =====
    drawFence(W - 120, H * 0.72, 3);

    // ===== Additional wheat tufts foreground (decorative) =====
    for (let i = 0; i < 15; i++) {
      const wx = W * 0.05 + Math.random() * W * 0.25;
      const wy = H * 0.62 + Math.random() * H * 0.08;
      const wh = 12 + Math.random() * 15;
      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wx, wy); ctx.lineTo(wx + 2, wy - wh);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(wx + 2, wy - wh - 3, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ===== METAL CHAIN-LINK HINT (where stage board hangs) =====
    const chainX1 = W * 0.5 - 90;
    const chainX2 = W * 0.5 + 90;
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const cy = 58 + i * 8;
      ctx.beginPath();
      ctx.ellipse(chainX1, cy, 4, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(chainX2, cy, 4, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

  }, []);

  // Character canvas render
  useEffect(() => {
    if (!charCanvasRef.current) return;
    const canvas = charCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const player = new Player();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2 + 50;
    let frame = 0;
    let rafId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bounce = Math.sin(frame * 0.04) * 4;
      const origY = player.y;
      player.y += bounce;
      player.draw(ctx, { x: 0, y: 0 });
      player.y = origY;
      frame++;
      rafId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Background canvas render (only once, on mount/resize)
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
    <div className="relative w-full h-screen overflow-hidden font-sans select-none" style={{ background: '#3d2e1e' }}>
      {/* ===== Full background canvas ===== */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />

      {/* ===== TOP BAR ===== */}
      <div className="absolute top-0 left-0 w-full z-30">
        <div className="flex items-center px-3 py-2 gap-2" style={{
          background: 'linear-gradient(180deg, rgba(60,40,20,0.9), rgba(80,55,30,0.85))',
          borderBottom: '3px solid #3a2510',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          {/* Back button */}
          <button className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#6b4226', border: '2px solid #4a2e14', boxShadow: '0 2px 0 #3a1e0a' }}>
            <ChevronLeft className="text-white w-5 h-5" />
          </button>
          <span className="text-white font-black text-sm tracking-wide mr-auto whitespace-nowrap"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            バトル(ステージ選択)
          </span>

          {/* Stamina */}
          <div className="flex items-center rounded-full px-2 py-0.5 shrink-0"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="w-5 h-5 mr-1.5 rounded-sm flex items-center justify-center text-[10px]"
              style={{ background: '#22c55e' }}>🌿</div>
            <div className="relative w-20 h-3 rounded-full overflow-hidden mr-1"
              style={{ background: '#1a3a10', border: '1px solid #2a5a1a' }}>
              <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)' }} />
            </div>
            <span className="text-white font-bold text-[11px]">30/30</span>
            <span className="text-white/50 text-[8px] ml-1 hidden sm:inline">(+1 in 18:45)</span>
            <button className="ml-1 w-4 h-4 bg-green-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">+</button>
          </div>

          {/* Gold */}
          <div className="flex items-center rounded-full px-2 py-0.5 shrink-0"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-lg mr-1">🪙</span>
            <span className="text-yellow-300 font-bold text-[11px]">12,500</span>
            <button className="ml-1 w-4 h-4 bg-green-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">+</button>
          </div>

          {/* Gems */}
          <div className="flex items-center rounded-full px-2 py-0.5 shrink-0"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-lg mr-1">💎</span>
            <span className="text-cyan-300 font-bold text-[11px]">150</span>
            <button className="ml-1 w-4 h-4 bg-green-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      {/* ===== LEFT SIDE BUTTONS ===== */}
      <div className="absolute left-2 z-20 flex flex-col gap-4" style={{ top: '60px' }}>
        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center cursor-pointer">
          <div className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(180deg, #8b6a3e, #6b4226)',
              border: '3px solid #4a2e14',
              boxShadow: '0 3px 0 #3a1e0a, inset 0 1px 0 rgba(255,255,255,0.15)'
            }}>
            <Plane className="text-white w-8 h-8" />
          </div>
          <div className="mt-1 px-2 py-0.5 rounded text-center"
            style={{ background: '#4a2e14', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-[9px] font-black text-yellow-300">クイックパトロール</div>
            <div className="text-[7px] text-white/60">スタミナ消費で即時報酬</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center cursor-pointer">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(180deg, #8b6a3e, #6b4226)',
                border: '3px solid #4a2e14',
                boxShadow: '0 3px 0 #3a1e0a, inset 0 1px 0 rgba(255,255,255,0.15)'
              }}>
              <ShoppingBasket className="text-white w-8 h-8" />
            </div>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[7px] font-black"
              style={{ background: '#fbbf24', color: '#5c3a1a', border: '2px solid #d97706' }}>
              収穫アリ!
            </motion.div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded"
            style={{ background: '#4a2e14', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-[9px] font-bold text-white text-center">パトロール報酬</div>
          </div>
        </motion.div>
      </div>

      {/* ===== RIGHT SIDE BUTTONS ===== */}
      <div className="absolute right-2 z-20 flex flex-col gap-4" style={{ top: '60px' }}>
        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center cursor-pointer">
          <div className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(180deg, #8b6a3e, #6b4226)',
              border: '3px solid #4a2e14',
              boxShadow: '0 3px 0 #3a1e0a, inset 0 1px 0 rgba(255,255,255,0.15)'
            }}>
            <Calendar className="text-white w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e', border: '2px solid white' }}>
              <span className="text-white text-[7px] font-black">✓</span>
            </div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded"
            style={{ background: '#4a2e14', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-[9px] font-bold text-white text-center">ログイン</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center cursor-pointer">
          <div className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #8b6a3e, #6b4226)',
              border: '3px solid #4a2e14',
              boxShadow: '0 3px 0 #3a1e0a, inset 0 1px 0 rgba(255,255,255,0.15)'
            }}>
            <Bug className="text-white w-8 h-8" />
          </div>
          <div className="mt-1 px-2 py-0.5 rounded"
            style={{ background: '#4a2e14', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-[9px] font-bold text-white text-center">イベント</div>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[8px] font-black mt-0.5"
            style={{ color: '#ff6b6b', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}>
            緊急クエスト!
          </motion.div>
        </motion.div>
      </div>

      {/* ===== CHARACTER (left-center) ===== */}
      <div className="absolute z-10 pointer-events-none" style={{ left: '8%', bottom: '20%' }}>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="scale-[2.2] origin-bottom"
        >
          <canvas ref={charCanvasRef} width={200} height={200} className="w-28 h-28" />
        </motion.div>
      </div>

      {/* ===== CENTER STAGE BOARD ===== */}
      <div className="absolute z-20 left-1/2 -translate-x-1/2" style={{ top: '80px' }}>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Wooden sign */}
          <div className="relative px-4 pt-3 pb-4 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #c8a070, #a37848, #8b6530)',
              border: '4px solid #6b4226',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)',
              minWidth: '280px'
            }}>
            {/* Wood grain lines */}
            <div className="absolute inset-0 rounded overflow-hidden pointer-events-none" style={{ opacity: 0.15 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute w-full h-[1px]" style={{ top: `${12 + i * 12}%`, background: '#4a2e14' }} />
              ))}
            </div>

            {/* Corner bolts */}
            {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-4 h-4 rounded-full`}
                style={{ background: 'radial-gradient(circle at 35% 35%, #999, #555)', border: '1px solid #444' }} />
            ))}

            {/* Stage text */}
            <div className="text-center mb-2 relative z-10">
              <div className="text-[11px] font-black tracking-[0.3em]"
                style={{ color: '#3a2510', textShadow: '0 1px 0 rgba(255,255,255,0.2)' }}>
                STAGE 1:
              </div>
              <div className="text-2xl font-black"
                style={{
                  color: '#2a1a0a',
                  textShadow: '0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.3)'
                }}>
                イナゴ襲来！
              </div>
            </div>

            {/* Stage image frame */}
            <div className="relative rounded overflow-hidden"
              style={{
                border: '3px solid #5c3a1e',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
              }}>
              {/* Canvas-drawn locust scene inside */}
              <div className="w-full h-24 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #d4a017, #b8960e, #9a7a08)' }}>
                {/* Wheat background pattern */}
                <div className="absolute inset-0" style={{
                  background: `repeating-linear-gradient(75deg, transparent, transparent 3px, rgba(180,140,20,0.3) 3px, rgba(180,140,20,0.3) 4px)`,
                }} />
                {/* Locust silhouettes */}
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <Bug className="text-[#3a3a1a] w-12 h-12 opacity-70 rotate-[-20deg]" />
                  <Bug className="text-[#2a2a0a] w-16 h-16 opacity-80" />
                  <Bug className="text-[#3a3a1a] w-10 h-10 opacity-60 rotate-[15deg]" />
                </div>

                {/* WARNING stamp */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: -15 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="px-4 py-1.5 font-black text-lg tracking-wider"
                    style={{
                      color: '#cc2222',
                      border: '3px solid #cc2222',
                      background: 'rgba(255,255,255,0.3)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                    WARNING
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Tape corners on the image */}
            <div className="absolute top-[52px] left-[12px] w-6 h-3 rotate-[-45deg] opacity-40"
              style={{ background: 'rgba(255,255,255,0.6)' }} />
            <div className="absolute top-[52px] right-[12px] w-6 h-3 rotate-[45deg] opacity-40"
              style={{ background: 'rgba(255,255,255,0.6)' }} />
          </div>

          {/* ===== X DECORATIONS on sides (crossed metal circles) ===== */}
          <div className="flex items-center gap-4 -mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#555', border: '2px solid #333' }}>
              <span className="text-white font-black text-sm">✕</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#555', border: '2px solid #333' }}>
              <span className="text-white font-black text-sm">✕</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== BOTTOM DEPLOY BUTTON ===== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, y: 4 }}
          onClick={onStart}
          className="relative"
        >
          <div className="relative px-10 py-3 rounded-xl flex items-center gap-3 transition-all"
            style={{
              background: 'linear-gradient(180deg, #fde047, #eab308)',
              border: '4px solid #ca8a04',
              boxShadow: '0 6px 0 #a16207, 0 8px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
            }}>
            <span className="text-3xl font-black italic"
              style={{ color: '#5c3a1a', textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
              出発
            </span>
            <div className="flex items-center px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)' }}>
              <span className="text-lg mr-0.5">🌿</span>
              <span className="text-xl font-black text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>-5</span>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
