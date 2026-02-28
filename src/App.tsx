/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';
import { RARITY_COLORS } from './game/constants';
import { Home } from './components/Home';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, ArrowRight } from 'lucide-react';

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);

    const [screen, setScreen] = useState<'home' | 'game'>('home');
    const [gameState, setGameState] = useState({
        hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, score: 0, timeStr: '00:00'
    });
    const [modal, setModal] = useState<'none' | 'levelup' | 'treasure' | 'gameover' | 'stageclear'>('none');
    const [levelUpOptions, setLevelUpOptions] = useState<any[]>([]);
    const [treasureContent, setTreasureContent] = useState<any>(null);
    const [finalScore, setFinalScore] = useState(0);

    useEffect(() => {
        if (screen !== 'game' || !canvasRef.current) return;
        
        const game = new Game(canvasRef.current);
        gameRef.current = game;

        game.onStateChange = (state) => {
            setGameState(state);
        };

        game.onLevelUp = (options) => {
            setLevelUpOptions(options);
            setModal('levelup');
        };

        game.onTreasure = (content) => {
            setTreasureContent(content);
            setModal('treasure');
        };

        game.onGameOver = () => {
            setModal('gameover');
        };

        game.onStageClear = (score) => {
            setFinalScore(score);
            setModal('stageclear');
        };

        game.init();

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            game.destroy();
        };
    }, [screen]);

    const handleSelectSkill = (key: string) => {
        if (gameRef.current) {
            gameRef.current.upgradeWeapon(key);
            setModal('none');
            gameRef.current.resume();
        }
    };

    const handleCloseTreasure = () => {
        setModal('none');
        if (gameRef.current) {
            gameRef.current.resume();
        }
    };

    const handleBackToHome = () => {
        setModal('none');
        setScreen('home');
    };

    const handleStartGame = () => {
        setScreen('game');
        setModal('none');
    };

    if (screen === 'home') {
        return <Home onStart={handleStartGame} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-green-800 text-white select-none font-sans">
            <canvas ref={canvasRef} className="block w-full h-full touch-none" />

            {/* HUD */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Timer */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 px-6 py-2 rounded-xl border-2 border-gray-600 shadow-lg">
                    <div className="font-mono font-bold text-3xl text-white tracking-widest drop-shadow-md">
                        {gameState.timeStr}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-xl drop-shadow-md">Lv {gameState.level}</div>
                        <div className="w-full max-w-md h-4 bg-gray-700 rounded-full border border-gray-900 overflow-hidden relative shadow-inner">
                            <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${(gameState.exp / gameState.maxExp) * 100}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-sm drop-shadow-md">HP</div>
                        <div className="w-48 h-3 bg-gray-700 rounded-full border border-gray-900 overflow-hidden relative">
                            <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${(gameState.hp / gameState.maxHp) * 100}%` }} />
                        </div>
                    </div>
                    <div className="font-bold text-sm drop-shadow-md">スコア: {gameState.score}</div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modal === 'gameover' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto z-50"
                    >
                        <h1 className="text-6xl font-black text-red-600 mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">GAME OVER</h1>
                        <p className="text-2xl mb-8 font-bold">畑を守りきれなかった...</p>
                        <button onClick={handleBackToHome} className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-2xl shadow-[0_0_15px_rgba(22,163,74,0.5)] border-2 border-white transition transform hover:scale-105 active:scale-95">
                            ホームに戻る
                        </button>
                    </motion.div>
                )}

                {modal === 'stageclear' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto z-50"
                    >
                        <div className="bg-[#fde047] border-8 border-[#ca8a04] p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full relative">
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="absolute -top-16"
                            >
                                <Trophy className="w-32 h-32 text-yellow-600 drop-shadow-lg" />
                            </motion.div>
                            
                            <h1 className="text-5xl font-black text-[#5c4033] mt-12 mb-4 italic">STAGE CLEAR!</h1>
                            
                            <div className="flex gap-2 mb-6">
                                <Star className="w-10 h-10 text-yellow-600 fill-yellow-600" />
                                <Star className="w-10 h-10 text-yellow-600 fill-yellow-600" />
                                <Star className="w-10 h-10 text-yellow-600 fill-yellow-600" />
                            </div>

                            <div className="bg-black/10 w-full p-4 rounded-xl mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#5c4033] font-bold">スコア:</span>
                                    <span className="text-3xl font-black text-[#5c4033]">{finalScore}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#5c4033] font-bold">ボーナス:</span>
                                    <span className="text-xl font-black text-green-700">+1,000</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleBackToHome} 
                                className="w-full py-4 bg-[#8b5a2b] hover:bg-[#5c4033] text-white rounded-xl font-black text-2xl shadow-[0_6px_0_#5c4033] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-4"
                            >
                                次へ進む <ArrowRight />
                            </button>
                        </div>
                    </motion.div>
                )}

                {modal === 'levelup' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/70 backdrop-blur-sm"
                    >
                        <div className="bg-gray-800 p-6 rounded-xl border-4 border-yellow-500 max-w-lg w-full mx-4 shadow-2xl">
                            <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6 drop-shadow">レベルアップ！</h2>
                            <p className="text-center mb-4 text-gray-300">取得・強化するスキルを選んでください</p>
                            <div className="flex flex-col gap-4">
                                {levelUpOptions.length === 0 ? (
                                    <button onClick={() => handleSelectSkill('max')} className="w-full text-left p-4 bg-gray-900 border-2 rounded-lg transition transform hover:scale-105 border-gray-500">
                                        <div className="text-xl font-bold mb-1 text-gray-400">MAX</div>
                                        <div className="text-sm text-gray-300">全ての武器が最大レベルです</div>
                                    </button>
                                ) : (
                                    levelUpOptions.map((opt, i) => (
                                        <button key={i} onClick={() => handleSelectSkill(opt.key)} className="w-full text-left p-4 bg-gray-900 border-2 rounded-lg transition transform hover:scale-105" style={{ borderColor: RARITY_COLORS[opt.nextLevel], boxShadow: `0 0 10px ${RARITY_COLORS[opt.nextLevel]}` }}>
                                            <div className="text-xl font-bold mb-1" style={{ color: RARITY_COLORS[opt.nextLevel] }}>{opt.title}</div>
                                            <div className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: opt.desc }} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {modal === 'treasure' && treasureContent && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-black/70 backdrop-blur-sm"
                    >
                        <div className={`bg-gray-800 p-8 rounded-2xl border-4 max-w-lg w-full mx-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]`} style={{ borderColor: RARITY_COLORS[treasureContent.rarity] }}>
                            <h2 className="text-4xl font-black text-center mb-2 drop-shadow-lg" style={{ color: RARITY_COLORS[treasureContent.rarity] }}>{treasureContent.title}</h2>
                            <p className="text-center mb-6 text-gray-300 font-bold">宝箱を開けた！</p>
                            <div className="flex flex-col gap-3 mb-8">
                                {treasureContent.results.map((res: any, i: number) => (
                                    <div key={i} className="p-3 bg-gray-900 border border-gray-600 rounded text-center font-bold text-lg shadow-inner" style={{ color: res.color || RARITY_COLORS[res.level] }}>
                                        {res.text}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleCloseTreasure} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-2xl shadow-lg border-2 border-blue-300 transition transform hover:scale-105">
                                回収して戻る
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
