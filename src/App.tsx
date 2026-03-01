/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from './game/Game';
import { RARITY_COLORS } from './game/constants';
import { Home } from './components/Home';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, ArrowRight, Pause, Play, RotateCcw, LogOut } from 'lucide-react';

// ============================================================================
// TUTORIAL DATA
// ============================================================================
const TUTORIAL_STEPS = [
    {
        title: 'ようこそ、農園防衛へ！',
        text: 'あなたは書記（かかし）として\n畑を害虫から守る使命を負っています。',
        icon: '🌾',
    },
    {
        title: '移動しよう',
        text: '画面をタップ/クリックするか\nWASD・矢印キーで移動できます。\n※ 耕された地面のみ歩けます！',
        icon: '🚶',
    },
    {
        title: 'クワで耕そう',
        text: 'クワは自動で振られます。\n攻撃範囲の地面が耕され、\n移動できるエリアが広がります！',
        icon: '⚒️',
    },
    {
        title: '敵を倒してEXPを集めよう',
        text: '害虫を倒すとEXPジェムが落ちます。\n拾ってEXPを溜めると…',
        icon: '💎',
    },
    {
        title: '小麦を育てて収穫！',
        text: 'EXPが溜まると耕地に小麦が植わります。\n10秒で成熟 → クワで刈り取ると\nスキルを選択できます！',
        icon: '🌱',
    },
    {
        title: '準備完了！',
        text: '3分間、畑を守りきろう！\nボスを倒せばステージクリア！',
        icon: '⚔️',
    },
];

// ============================================================================
// REUSABLE: WOOD MODAL WRAPPER
// ============================================================================
const WoodModal: React.FC<{
    children: React.ReactNode;
    visible: boolean;
    onOverlay?: () => void;
    width?: string;
}> = ({ children, visible, onOverlay, width = 'max-w-lg' }) => {
    if (!visible) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={onOverlay}
        >
            <motion.div
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 30 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className={`wood-panel p-6 ${width} w-[90%] mx-4 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Corner decorations */}
                {['-top-3 -left-3', '-top-3 -right-3', '-bottom-3 -left-3', '-bottom-3 -right-3'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 rounded-full`}
                        style={{ background: 'radial-gradient(circle at 35% 35%, #8899bb, #4a5578)', border: '2px solid #2a2e48' }} />
                ))}
                {children}
            </motion.div>
        </motion.div>
    );
};

// ============================================================================
// REUSABLE: WOOD BUTTON
// ============================================================================
const WoodButton: React.FC<{
    children: React.ReactNode;
    onClick: () => void;
    color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}> = ({ children, onClick, color = 'green', className = '', size = 'md' }) => {
    const colors = {
        green: { bg: 'linear-gradient(180deg, #4ade80, #16a34a)', border: '#14532d', shadow: '#0f3d1e', text: '#fff' },
        blue: { bg: 'linear-gradient(180deg, #60a5fa, #2563eb)', border: '#1e3a8a', shadow: '#152e6e', text: '#fff' },
        red: { bg: 'linear-gradient(180deg, #f87171, #dc2626)', border: '#7f1d1d', shadow: '#5c1515', text: '#fff' },
        yellow: { bg: 'linear-gradient(180deg, #fde047, #eab308)', border: '#92400e', shadow: '#6e3009', text: '#3a2510' },
        gray: { bg: 'linear-gradient(180deg, #94a3b8, #64748b)', border: '#334155', shadow: '#1e293b', text: '#fff' },
    };
    const c = colors[color];
    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-lg', lg: 'px-8 py-4 text-2xl' };

    return (
        <button
            onClick={onClick}
            className={`wood-btn game-text ${sizes[size]} w-full flex items-center justify-center gap-3 ${className}`}
            style={{
                background: c.bg,
                borderColor: c.border,
                boxShadow: `0 5px 0 ${c.shadow}, 0 8px 15px rgba(0,0,0,0.4)`,
                color: c.text,
            }}
        >
            {children}
        </button>
    );
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);

    const [screen, setScreen] = useState<'home' | 'game'>('home');
    const [gameState, setGameState] = useState({
        hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, score: 0, timeStr: '00:00'
    });
    const [modal, setModal] = useState<'none' | 'levelup' | 'treasure' | 'gameover' | 'stageclear' | 'pause'>('none');
    const [levelUpOptions, setLevelUpOptions] = useState<any[]>([]);
    const [treasureContent, setTreasureContent] = useState<any>(null);
    const [finalScore, setFinalScore] = useState(0);

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (screen !== 'game' || !canvasRef.current) return;

        const game = new Game(canvasRef.current);
        gameRef.current = game;

        game.onStateChange = (state) => setGameState(state);
        game.onLevelUp = (options) => { setLevelUpOptions(options); setModal('levelup'); };
        game.onTreasure = (content) => { setTreasureContent(content); setModal('treasure'); };
        game.onGameOver = () => setModal('gameover');
        game.onStageClear = (score) => { setFinalScore(score); setModal('stageclear'); };

        game.init();

        // Start tutorial on first stage
        setTutorialStep(0);
        setShowTutorial(true);
        game.state = 'paused'; // Pause while tutorial shows

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
        gameRef.current?.resume();
    };

    const handleBackToHome = () => {
        setModal('none');
        setScreen('home');
    };

    const handleStartGame = () => {
        setScreen('game');
        setModal('none');
    };

    // Pause controls
    const handlePause = useCallback(() => {
        if (gameRef.current && gameRef.current.state === 'playing' && modal === 'none' && !showTutorial) {
            gameRef.current.state = 'paused';
            setModal('pause');
        }
    }, [modal, showTutorial]);

    const handleResume = () => {
        setModal('none');
        gameRef.current?.resume();
    };

    const handleRestart = () => {
        setModal('none');
        // Reinitialize the game by re-mounting
        setScreen('home');
        setTimeout(() => {
            setScreen('game');
            setModal('none');
        }, 50);
    };

    // Tutorial controls
    const handleTutorialNext = () => {
        if (tutorialStep < TUTORIAL_STEPS.length - 1) {
            setTutorialStep(tutorialStep + 1);
        } else {
            setShowTutorial(false);
            gameRef.current?.resume();
        }
    };

    const handleTutorialSkip = () => {
        setShowTutorial(false);
        gameRef.current?.resume();
    };

    // ESC to pause
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (modal === 'pause') handleResume();
                else handlePause();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modal, handlePause]);

    if (screen === 'home') {
        return <Home onStart={handleStartGame} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-green-800 text-white select-none">
            <canvas ref={canvasRef} className="block w-full h-full touch-none" />

            {/* HUD */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Timer */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 rounded-xl px-6 py-2 border-2"
                    style={{
                        background: 'linear-gradient(180deg, #3a3f5c, #2a2e48)',
                        borderColor: '#5a6080',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    }}>
                    <div className="game-text text-3xl tracking-widest">{gameState.timeStr}</div>
                </div>

                {/* Pause Button */}
                <button
                    onClick={handlePause}
                    className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center pointer-events-auto"
                    style={{
                        background: 'linear-gradient(180deg, #3a3f5c, #2a2e48)',
                        border: '3px solid #5a6080',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}
                >
                    <Pause className="w-6 h-6 text-white" />
                </button>

                {/* Status Bars */}
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="game-text text-xl">Lv {gameState.level}</div>
                        <div className="w-full max-w-md h-5 rounded-full overflow-hidden relative"
                            style={{ background: '#1a1d2e', border: '2px solid #5a6080', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
                            <div className="h-full transition-all duration-200 rounded-full"
                                style={{ width: `${(gameState.exp / gameState.maxExp) * 100}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }} />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] game-text">
                                {gameState.exp}/{gameState.maxExp}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="game-text text-sm">HP</div>
                        <div className="w-48 h-4 rounded-full overflow-hidden relative"
                            style={{ background: '#1a1d2e', border: '2px solid #5a6080', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
                            <div className="h-full transition-all duration-200 rounded-full"
                                style={{
                                    width: `${(gameState.hp / gameState.maxHp) * 100}%`,
                                    background: gameState.hp / gameState.maxHp > 0.3 ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #f87171, #dc2626)'
                                }} />
                        </div>
                    </div>
                    <div className="game-text text-sm">スコア: {gameState.score}</div>
                </div>
            </div>

            {/* ===== MODALS ===== */}
            <AnimatePresence>
                {/* ---- TUTORIAL ---- */}
                {showTutorial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    >
                        <motion.div
                            key={tutorialStep}
                            initial={{ scale: 0.85, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ type: 'spring', damping: 18 }}
                            className="wood-panel p-8 max-w-md w-[90%] mx-4 relative"
                        >
                            {/* Corner bolts */}
                            {['-top-3 -left-3', '-top-3 -right-3', '-bottom-3 -left-3', '-bottom-3 -right-3'].map((pos, i) => (
                                <div key={i} className={`absolute ${pos} w-5 h-5 rounded-full`}
                                    style={{ background: 'radial-gradient(circle at 35% 35%, #8899bb, #4a5578)', border: '2px solid #2a2e48' }} />
                            ))}

                            {/* Step indicator */}
                            <div className="flex justify-center gap-2 mb-4">
                                {TUTORIAL_STEPS.map((_, i) => (
                                    <div key={i} className="w-3 h-3 rounded-full transition-all"
                                        style={{
                                            background: i === tutorialStep ? '#facc15' : i < tutorialStep ? '#4ade80' : '#4a5578',
                                            boxShadow: i === tutorialStep ? '0 0 8px #facc15' : 'none'
                                        }} />
                                ))}
                            </div>

                            {/* Icon */}
                            <div className="text-center mb-4">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="text-6xl"
                                >
                                    {TUTORIAL_STEPS[tutorialStep].icon}
                                </motion.div>
                            </div>

                            {/* Title */}
                            <h2 className="game-text text-2xl text-center mb-3"
                                style={{ color: '#facc15' }}>
                                {TUTORIAL_STEPS[tutorialStep].title}
                            </h2>

                            {/* Description */}
                            <p className="game-text text-center text-base mb-6 leading-relaxed whitespace-pre-line"
                                style={{ color: '#e2e8f0' }}>
                                {TUTORIAL_STEPS[tutorialStep].text}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button onClick={handleTutorialSkip}
                                    className="wood-btn game-text text-sm px-4 py-2 flex-shrink-0"
                                    style={{
                                        background: 'linear-gradient(180deg, #94a3b8, #64748b)',
                                        borderColor: '#334155',
                                        color: '#fff',
                                        boxShadow: '0 4px 0 #1e293b'
                                    }}>
                                    スキップ
                                </button>
                                <WoodButton onClick={handleTutorialNext} color="yellow" size="md">
                                    {tutorialStep < TUTORIAL_STEPS.length - 1 ? '次へ ▶' : 'ゲーム開始！'}
                                </WoodButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ---- PAUSE MENU ---- */}
                <WoodModal visible={modal === 'pause'}>
                    <h2 className="game-text text-3xl text-center mb-8" style={{ color: '#facc15' }}>
                        ⏸ ポーズ
                    </h2>

                    <div className="flex flex-col gap-4">
                        <WoodButton onClick={handleResume} color="green" size="lg">
                            <Play className="w-7 h-7" /> ゲームに戻る
                        </WoodButton>
                        <WoodButton onClick={handleRestart} color="blue" size="md">
                            <RotateCcw className="w-5 h-5" /> やり直す
                        </WoodButton>
                        <WoodButton onClick={handleBackToHome} color="red" size="md">
                            <LogOut className="w-5 h-5" /> 終了する
                        </WoodButton>
                    </div>

                    <p className="text-center text-sm mt-4" style={{ color: '#8892b0' }}>
                        ESCキーでも再開できます
                    </p>
                </WoodModal>

                {/* ---- GAME OVER ---- */}
                <WoodModal visible={modal === 'gameover'}>
                    <div className="text-center mb-2">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-6xl mb-4">💀</motion.div>
                        <h1 className="game-text text-5xl mb-3" style={{ color: '#ef4444' }}>GAME OVER</h1>
                        <p className="game-text text-lg mb-6" style={{ color: '#94a3b8' }}>畑を守りきれなかった...</p>
                    </div>

                    <div className="rounded-xl p-4 mb-6"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #5a6080' }}>
                        <div className="flex justify-between items-center">
                            <span className="game-text text-sm" style={{ color: '#94a3b8' }}>スコア</span>
                            <span className="game-text text-2xl" style={{ color: '#facc15' }}>{gameState.score}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <WoodButton onClick={handleRestart} color="blue" size="md">
                            <RotateCcw className="w-5 h-5" /> もう一度挑戦
                        </WoodButton>
                        <WoodButton onClick={handleBackToHome} color="gray" size="md">
                            <LogOut className="w-5 h-5" /> ホームに戻る
                        </WoodButton>
                    </div>
                </WoodModal>

                {/* ---- STAGE CLEAR ---- */}
                <WoodModal visible={modal === 'stageclear'}>
                    <div className="text-center mb-2">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                            <Trophy className="w-20 h-20 mx-auto mb-2" style={{ color: '#facc15', filter: 'drop-shadow(0 2px 8px rgba(250,204,21,0.6))' }} />
                        </motion.div>
                        <h1 className="game-text text-4xl mb-2" style={{ color: '#facc15' }}>STAGE CLEAR!</h1>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        <Star className="w-10 h-10" style={{ color: '#facc15', fill: '#facc15' }} />
                        <Star className="w-10 h-10" style={{ color: '#facc15', fill: '#facc15' }} />
                        <Star className="w-10 h-10" style={{ color: '#facc15', fill: '#facc15' }} />
                    </div>

                    <div className="rounded-xl p-4 mb-6"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #5a6080' }}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="game-text text-sm" style={{ color: '#94a3b8' }}>スコア</span>
                            <span className="game-text text-2xl" style={{ color: '#fff' }}>{finalScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="game-text text-sm" style={{ color: '#94a3b8' }}>ボーナス</span>
                            <span className="game-text text-xl" style={{ color: '#4ade80' }}>+1,000</span>
                        </div>
                    </div>

                    <WoodButton onClick={handleBackToHome} color="yellow" size="lg">
                        次へ進む <ArrowRight className="w-6 h-6" />
                    </WoodButton>
                </WoodModal>

                {/* ---- LEVEL UP ---- */}
                <WoodModal visible={modal === 'levelup'}>
                    <h2 className="game-text text-3xl text-center mb-2" style={{ color: '#facc15' }}>
                        🌾 収穫完了！
                    </h2>
                    <p className="game-text text-sm text-center mb-5" style={{ color: '#94a3b8' }}>
                        取得・強化するスキルを選んでください
                    </p>
                    <div className="flex flex-col gap-3">
                        {levelUpOptions.length === 0 ? (
                            <button onClick={() => handleSelectSkill('max')}
                                className="w-full text-left p-4 rounded-xl transition transform hover:scale-[1.02]"
                                style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid #5a6080' }}>
                                <div className="game-text text-xl mb-1" style={{ color: '#94a3b8' }}>MAX</div>
                                <div className="game-text text-sm" style={{ color: '#64748b' }}>全ての武器が最大レベルです</div>
                            </button>
                        ) : (
                            levelUpOptions.map((opt, i) => (
                                <button key={i} onClick={() => handleSelectSkill(opt.key)}
                                    className="w-full text-left p-4 rounded-xl transition transform hover:scale-[1.02] cursor-pointer"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `3px solid ${RARITY_COLORS[opt.nextLevel]}`,
                                        boxShadow: `0 0 15px ${RARITY_COLORS[opt.nextLevel]}40, inset 0 0 20px ${RARITY_COLORS[opt.nextLevel]}15`
                                    }}>
                                    <div className="game-text text-xl mb-1" style={{ color: RARITY_COLORS[opt.nextLevel] }}>
                                        {opt.title}
                                    </div>
                                    <div className="game-text text-sm" style={{ color: '#94a3b8' }}
                                        dangerouslySetInnerHTML={{ __html: opt.desc }} />
                                </button>
                            ))
                        )}
                    </div>
                </WoodModal>

                {/* ---- TREASURE ---- */}
                {modal === 'treasure' && treasureContent && (
                    <WoodModal visible={true}>
                        <div className="text-center mb-2">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-5xl mb-2">
                                🎁
                            </motion.div>
                            <h2 className="game-text text-3xl mb-2" style={{ color: RARITY_COLORS[treasureContent.rarity] }}>
                                {treasureContent.title}
                            </h2>
                            <p className="game-text text-sm mb-4" style={{ color: '#94a3b8' }}>宝箱を開けた！</p>
                        </div>
                        <div className="flex flex-col gap-2 mb-6">
                            {treasureContent.results.map((res: any, i: number) => (
                                <div key={i} className="game-text text-center p-3 rounded-lg"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid #5a6080',
                                        color: res.color || RARITY_COLORS[res.level]
                                    }}>
                                    {res.text}
                                </div>
                            ))}
                        </div>
                        <WoodButton onClick={handleCloseTreasure} color="blue" size="md">
                            回収して戻る
                        </WoodButton>
                    </WoodModal>
                )}
            </AnimatePresence>
        </div>
    );
}
