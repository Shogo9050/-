import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  Coins, 
  Gem, 
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = new Player();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2 + 40;
    
    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add a slight bounce
      const bounce = Math.sin(frame * 0.05) * 5;
      const originalY = player.y;
      player.y += bounce;
      
      player.draw(ctx, { x: 0, y: 0 });
      
      player.y = originalY;
      frame++;
      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f5e6d3] overflow-hidden font-sans select-none">
      {/* Background with wheat field feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87ceeb] via-[#f5e6d3] to-[#d2b48c]">
        {/* Simple clouds or wheat field patterns could go here */}
        <div className="absolute bottom-0 w-full h-1/3 bg-[#e3c58d] opacity-50" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 bg-[#8b5a2b] rounded-lg flex items-center justify-center border-2 border-[#5c4033] shadow-md">
            <ChevronLeft className="text-white" />
          </button>
          
          <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-white/20">
            <Droplets className="text-blue-400 w-4 h-4 mr-2" />
            <span className="text-white font-bold text-sm">30/30</span>
            <span className="text-xs text-white/60 ml-2">(+1 in 18:45)</span>
            <button className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px]">+</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-white/20">
            <Coins className="text-yellow-500 w-4 h-4 mr-2" />
            <span className="text-white font-bold text-sm">12,500</span>
            <button className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px]">+</button>
          </div>
          <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-white/20">
            <Gem className="text-cyan-400 w-4 h-4 mr-2" />
            <span className="text-white font-bold text-sm">150</span>
            <button className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px]">+</button>
          </div>
        </div>
      </div>

      {/* Side Buttons - Left */}
      <div className="absolute left-4 top-24 flex flex-col gap-6 z-20">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#8b5a2b] rounded-xl border-4 border-[#5c4033] flex items-center justify-center shadow-lg mb-1 relative">
            <Plane className="text-white w-10 h-10" />
          </div>
          <span className="bg-[#5c4033] px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">クイックパトロール</span>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-[#8b5a2b] rounded-xl border-4 border-[#5c4033] flex items-center justify-center shadow-lg mb-1">
              <ShoppingBasket className="text-white w-10 h-10" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white text-[#5c4033] text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#5c4033] animate-bounce">
              収穫アリ!
            </div>
          </div>
          <span className="bg-[#5c4033] px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">パトロール報酬</span>
        </motion.div>
      </div>

      {/* Side Buttons - Right */}
      <div className="absolute right-4 top-24 flex flex-col gap-6 z-20">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#8b5a2b] rounded-xl border-4 border-[#5c4033] flex items-center justify-center shadow-lg mb-1 relative">
            <Calendar className="text-white w-10 h-10" />
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border border-white">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <span className="bg-[#5c4033] px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">ログイン</span>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#8b5a2b] rounded-xl border-4 border-[#5c4033] flex items-center justify-center shadow-lg mb-1 relative overflow-hidden">
            <Bug className="text-white w-10 h-10" />
          </div>
          <span className="bg-[#5c4033] px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">イベント</span>
          <span className="text-[8px] text-[#5c4033] font-bold mt-1">緊急クエスト!</span>
        </motion.div>
      </div>

      {/* Center Stage Board */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        {/* Chains */}
        <div className="flex gap-20 -mb-2">
          <div className="w-1.5 h-12 bg-gray-600 border-x border-gray-800" />
          <div className="w-1.5 h-12 bg-gray-600 border-x border-gray-800" />
        </div>
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-72 bg-[#d2b48c] border-4 border-[#8b5a2b] rounded-lg p-3 shadow-2xl relative"
        >
          <div className="text-center mb-2">
            <div className="text-[10px] font-black text-[#5c4033] tracking-widest">STAGE 1:</div>
            <div className="text-2xl font-black text-[#5c4033]">イナゴ襲来！</div>
          </div>
          
          <div className="bg-[#f5e6d3] border-2 border-[#8b5a2b] rounded p-1 relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/locust/400/200" 
              alt="Locust" 
              className="w-full h-24 object-cover rounded opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="border-4 border-red-600 text-red-600 font-black text-xl px-4 py-1 rotate-[-15deg] bg-white/40">
                 WARNING
               </div>
            </div>
          </div>
          
          {/* Tape decorations */}
          <div className="absolute -top-2 -left-2 w-8 h-4 bg-white/40 rotate-[-45deg]" />
          <div className="absolute -top-2 -right-2 w-8 h-4 bg-white/40 rotate-[45deg]" />
        </motion.div>
      </div>

      {/* Main Character Area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative mt-32">
          {/* Scarecrow Character (Canvas) */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [-1, 1, -1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative scale-[1.5]"
          >
            <canvas 
              ref={canvasRef} 
              width={200} 
              height={200} 
              className="w-48 h-48"
            />
          </motion.div>

          {/* Machinery/Gears at bottom */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-gray-600 rounded-full flex items-center justify-center"
            >
              <div className="w-12 h-2 bg-gray-600" />
              <div className="w-2 h-12 bg-gray-600 absolute" />
            </motion.div>
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-gray-600 rounded-full flex items-center justify-center"
            >
              <div className="w-8 h-2 bg-gray-600" />
              <div className="w-2 h-8 bg-gray-600 absolute" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Elements (Vegetables) */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute left-10 bottom-40 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-700"
        >
          <div className="w-2 h-6 bg-green-600 -mt-8" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, -15, 0], y: [0, 25, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute right-10 top-60 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center border-2 border-purple-700"
        >
          <div className="w-2 h-4 bg-green-600 -mt-6" />
        </motion.div>
      </div>

      {/* Bottom Deploy Button Area */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative group"
        >
          {/* Button Background */}
          <div className="bg-[#fde047] border-4 border-[#ca8a04] rounded-xl px-12 py-4 shadow-[0_6px_0_#ca8a04] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-4">
            <span className="text-4xl font-black text-[#5c4033] italic">出発</span>
            <div className="flex items-center bg-black/20 px-2 py-1 rounded-lg">
              <Droplets className="text-blue-400 w-6 h-6 mr-1" />
              <span className="text-2xl font-black text-white">-5</span>
            </div>
          </div>
          
          {/* Lever Decoration */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2">
            <div className="w-8 h-16 bg-gray-700 rounded-lg border-2 border-gray-900 relative">
              <motion.div 
                animate={{ rotate: [-20, 20, -20] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-10 bg-gray-400 origin-bottom"
              >
                <div className="w-4 h-4 bg-red-600 rounded-full -mt-2 -ml-1" />
              </motion.div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
