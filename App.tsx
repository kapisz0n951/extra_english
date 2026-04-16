
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
    GameState, 
    PlayerRole, 
    GameMode, 
    Difficulty, 
    Word, 
    PlayerData,
    PeerMessageType,
    PeerMessage,
    MainCategory,
    AppLanguage,
    Chapter,
    Subject,
    ProficiencyLevel,
    Quest,
    Mistake,
    PowerUps
} from './types';
import { MULTI_LANG_DATA, TOTAL_QUESTIONS, ENGLISH_CHAPTERS, SPANISH_CHAPTERS } from './constants';
import { generateCategoryWords, generateMathQuestions, generateEducationalLesson, explainMistakes, generateWordImage, generateWordMnemonic } from './services/geminiService';

declare var Peer: any;
declare var confetti: any;

// --- Helpers ---
const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
};

const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const getLevelInfo = (xp: number) => {
    let level = 1;
    let xpForNext = 100;
    let remainingXP = xp;
    while (remainingXP >= xpForNext) {
        remainingXP -= xpForNext;
        level++;
        xpForNext += 50;
    }
    return { level, xpInLevel: remainingXP, xpRequired: xpForNext };
};

// PeerJS Configuration for better cross-network connectivity
const PEER_CONFIG = {
    debug: 1,
    config: {
        'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            { 'urls': 'stun:stun1.l.google.com:19302' },
            { 'urls': 'stun:stun2.l.google.com:19302' },
            { 'urls': 'stun:stun3.l.google.com:19302' },
            { 'urls': 'stun:stun4.l.google.com:19302' },
        ]
    }
};

// --- UI Components ---

const Button: React.FC<{ 
    children: React.ReactNode; 
    onClick?: () => void | Promise<void>; 
    className?: string; 
    variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "math" | "ai" | "multi" | "boss" | "powerup";
    disabled?: boolean;
}> = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "primary", 
    disabled = false 
}) => {
    const base = "px-6 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
        secondary: "bg-white text-gray-800 border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
        math: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200",
        ai: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200",
        boss: "bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse",
        powerup: "bg-amber-100 text-amber-700 border-2 border-amber-200 hover:bg-amber-200",
        multi: "bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-200"
    };
    return (
        <button 
            disabled={disabled}
            onClick={onClick} 
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`glass-panel rounded-3xl p-6 shadow-xl ${className}`}>
        {children}
    </div>
);

export default function App() {
    const [view, setView] = useState<'menu' | 'start' | 'game' | 'summary' | 'loading' | 'ai-prompt' | 'multi-menu' | 'lobby' | 'multi-leaderboard' | 'shop' | 'ai-review'>('menu');
    const [engSubMode, setEngSubMode] = useState<'path' | 'classic'>('path');
    const [currentSubject, setCurrentSubject] = useState<Subject>(() => (localStorage.getItem('vocab_pro_current_subject') as Subject) || 'Angielski');
    
    // Multiplayer State
    const [peer, setPeer] = useState<any>(null);
    const [conns, setConns] = useState<any[]>([]); 
    const [conn, setConn] = useState<any>(null); 
    const [myId, setMyId] = useState("");
    const [targetId, setTargetId] = useState("");
    const [nickname, setNickname] = useState(() => localStorage.getItem('vpro_nick') || "");
    const [remotePlayers, setRemotePlayers] = useState<PlayerData[]>([]);
    const [playerRole, setPlayerRole] = useState<PlayerRole>('single');
    const [isInitializingPeer, setIsInitializingPeer] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [isConnectingToRoom, setIsConnectingToRoom] = useState(false);

    // Game Prep States
    const [pendingChapter, setPendingChapter] = useState<{ mainCat: MainCategory, subCat: string, icon?: string, title?: string } | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
    const [selectedMode, setSelectedMode] = useState<GameMode>('translation');
    const [customWordsBuffer, setCustomWordsBuffer] = useState<Word[] | null>(null);

    // Power-ups State
    const [powerUps, setPowerUps] = useState<PowerUps>(() => {
        const saved = localStorage.getItem('vocab_pro_powerups');
        return saved ? JSON.parse(saved) : { hints: 3, shields: 1, freezes: 2 };
    });

    // Streak logic
    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem('vocab_pro_streak');
        const lastDate = localStorage.getItem('vocab_pro_last_date');
        const today = new Date().toDateString();
        if (lastDate === today) return parseInt(saved || "0");
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) return parseInt(saved || "0");
        return 0;
    });

    const [gameState, setGameState] = useState<GameState>({
        appLanguage: 'EN',
        mainCategory: 'words',
        currentCategory: null,
        difficulty: 'normal',
        mode: 'translation',
        currentQuestionIndex: 0,
        score: 0,
        isGameActive: false,
        history: [],
        mistakes: [],
        isBossMode: false,
        activeShield: false
    });

    const [wordsQueue, setWordsQueue] = useState<Word[]>([]);
    const [spellingInput, setSpellingInput] = useState<string>("");
    const [spellingTiles, setSpellingTiles] = useState<string[]>([]);
    const [bossTimer, setBossTimer] = useState(0);
    const [aiReviewText, setAiReviewText] = useState("");
    const [currentHintOptions, setCurrentHintOptions] = useState<string[]>([]);
    const [isWrongAnswer, setIsWrongAnswer] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    
    // XP State
    const [xpData, setXpData] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('vocab_pro_subjects_xp');
        return saved ? JSON.parse(saved) : { Angielski: 0, Hiszpański: 0 };
    });

    useEffect(() => {
        localStorage.setItem('vocab_pro_subjects_xp', JSON.stringify(xpData));
        localStorage.setItem('vocab_pro_current_subject', currentSubject);
        localStorage.setItem('vocab_pro_streak', streak.toString());
        localStorage.setItem('vocab_pro_last_date', new Date().toDateString());
        localStorage.setItem('vocab_pro_powerups', JSON.stringify(powerUps));
        if (nickname) localStorage.setItem('vpro_nick', nickname);
    }, [xpData, currentSubject, streak, powerUps, nickname]);

    useEffect(() => {
        setGameState(prev => ({
            ...prev,
            appLanguage: currentSubject === 'Angielski' ? 'EN' : 'ES',
            mainCategory: 'words'
        }));
    }, [currentSubject]);

    const { level: playerLevel, xpInLevel: currentLevelXP, xpRequired: xpForNext } = useMemo(() => getLevelInfo(xpData[currentSubject] || 0), [xpData, currentSubject]);
    const xpPercentage = useMemo(() => (currentLevelXP / xpForNext) * 100, [currentLevelXP, xpForNext]);

    // Audio logic
    const playSound = useCallback((type: 'correct' | 'incorrect' | 'start' | 'end') => {
        const sounds = {
            correct: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
            incorrect: 'https://www.soundjay.com/misc/sounds/fail-trombone-01.mp3',
            start: 'https://www.soundjay.com/misc/sounds/magic-chime-01.mp3',
            end: 'https://www.soundjay.com/misc/sounds/tada-fanfare-01.mp3'
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play blocked", e));
    }, []);

    const playAudio = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = gameState.appLanguage === 'EN' ? 'en-US' : (gameState.appLanguage === 'ES' ? 'es-ES' : 'pl-PL');
        window.speechSynthesis.speak(u);
    }, [gameState.appLanguage]);

    const initSpellingQuestion = useCallback((word: Word | undefined) => {
        if (!word) return;
        const cleaned = word.en.toUpperCase().replace(/[^A-ZÑÁÉÍÓÚĄĆĘŁŃÓŚŹŻ]/g, "");
        const letters = cleaned.split("");
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZĄĆĘŁŃÓŚŹŻ";
        const extraCount = selectedDifficulty === 'hard' ? 4 : 2;
        const extra = [...Array(extraCount)].map(() => alphabet[Math.floor(Math.random() * alphabet.length)]);
        setSpellingTiles(shuffle([...letters, ...extra]));
        setSpellingInput("");
    }, [selectedDifficulty]);

    // Multi Logic
    const handlePeerData = useCallback((c: any, data: PeerMessage) => {
        switch (data.type) {
            case PeerMessageType.JOIN:
                setRemotePlayers(prev => {
                    if (prev.find(p => p.id === c.peer)) return prev;
                    return [...prev, { id: c.peer, nick: data.payload.nick, score: 0, progress: 0, status: 'playing', level: 1 }];
                });
                break;
            case PeerMessageType.START_GAME:
                setWordsQueue(data.payload.words);
                setGameState(prev => ({ 
                    ...prev, 
                    isGameActive: true, 
                    difficulty: data.payload.difficulty,
                    mode: data.payload.mode
                }));
                if (data.payload.mode === 'spelling') {
                    initSpellingQuestion(data.payload.words[0]);
                }
                setView('game');
                break;
            case PeerMessageType.UPDATE_SCORE:
                setRemotePlayers(prev => prev.map(p => p.id === c.peer ? { ...p, progress: data.payload.progress, score: data.payload.score } : p));
                break;
            case PeerMessageType.GAME_OVER:
                setRemotePlayers(prev => prev.map(p => p.id === c.peer ? { ...p, status: 'finished' } : p));
                break;
        }
    }, [initSpellingQuestion]);

    const setupConnection = useCallback((connection: any) => {
        setIsConnectingToRoom(true);

        const timeout = setTimeout(() => {
            if (view !== 'lobby' && !connection.open) {
                setIsConnectingToRoom(false);
                alert("Nie udało się nawiązać stabilnego połączenia. Spróbuj ponownie.");
                connection.close();
            }
        }, 15000);

        connection.on('open', () => {
            clearTimeout(timeout);
            setIsConnectingToRoom(false);
            connection.send({ type: PeerMessageType.JOIN, payload: { nick: nickname || "Anonim" } });
            if (playerRole === 'student') setView('lobby');
        });

        connection.on('data', (data: PeerMessage) => handlePeerData(connection, data));
        
        connection.on('close', () => {
            setRemotePlayers(prev => prev.filter(p => p.id !== connection.peer));
            setConns(prev => prev.filter(c => c.peer !== connection.peer));
            setIsConnectingToRoom(false);
        });

        connection.on('error', (err: any) => {
            clearTimeout(timeout);
            setIsConnectingToRoom(false);
            console.error("Connection error:", err);
            alert("Błąd połączenia z pokojem.");
        });
    }, [nickname, playerRole, handlePeerData, view]);

    const initPeer = useCallback((isHost: boolean) => {
        if (typeof Peer === 'undefined') {
            alert("Błąd: Biblioteka PeerJS nie została załadowana. Sprawdź połączenie z internetem.");
            return;
        }

        setIsInitializingPeer(true);
        if (peer) {
            try { peer.destroy(); } catch (e) { console.error(e); }
        }
        
        setIsReconnecting(false);
        const roomCode = isHost ? generateRoomCode() : undefined;
        
        try {
            const p = isHost ? new Peer(roomCode, PEER_CONFIG) : new Peer(undefined, PEER_CONFIG);
            
            p.on('open', (id: string) => {
                setMyId(id);
                setPeer(p);
                setPlayerRole(isHost ? 'teacher' : 'student');
                if (isHost) setView('lobby');
                setIsReconnecting(false);
                setIsInitializingPeer(false);
            });

            p.on('connection', (connection: any) => {
                setConns(prev => [...prev, connection]);
                setupConnection(connection);
            });

            p.on('disconnected', () => {
                if (!p.destroyed) {
                    console.log("Disconnected from signaling server. Attempting reconnect...");
                    setIsReconnecting(true);
                    p.reconnect();
                }
            });

            p.on('error', (err: any) => {
                setIsInitializingPeer(false);
                setIsReconnecting(false);
                setIsConnectingToRoom(false);
                if (err.type === 'unavailable-id' && isHost) {
                    initPeer(true);
                } else if (err.type === 'peer-unavailable') {
                    alert("Nie znaleziono pokoju o tym kodzie. Upewnij się, że host założył pokój.");
                    setView('multi-menu');
                } else if (err.type === 'lost-connection') {
                    console.warn("Signaling server connection lost.");
                    setIsReconnecting(true);
                } else if (err.type === 'network') {
                    console.error("Błąd sieciowy PeerJS.");
                } else {
                    console.error("PeerJS Error:", err);
                }
            });

            setPeer(p);
        } catch (err) {
            console.error("Peer creation error:", err);
            setIsInitializingPeer(false);
            alert("Błąd podczas tworzenia połączenia.");
        }
    }, [setupConnection, peer]);

    const connectToPeer = () => {
        if (!targetId.trim()) return;
        if (!peer || peer.destroyed) {
            alert("Błąd inicjalizacji. Odśwież stronę.");
            return;
        }
        setIsConnectingToRoom(true);
        const connection = peer.connect(targetId.trim().toUpperCase());
        setConn(connection);
        setupConnection(connection);
    };

    const broadcastMessage = (type: PeerMessageType, payload: any) => {
        conns.forEach(c => {
            if (c.open) c.send({ type, payload });
        });
    };

    const sendToHost = (type: PeerMessageType, payload: any) => {
        if (conn && conn.open) conn.send({ type, payload });
    };

    // Game Logic
    const startGame = useCallback(async (mainCat: MainCategory, subCat: string, isBoss: boolean = false, customWords?: Word[]) => {
        setView('loading');
        
        let finalWords: Word[] = [];
        const questionCount = selectedDifficulty === 'easy' ? 8 : (selectedDifficulty === 'hard' ? 16 : 12);

        if (customWords && customWords.length > 0) {
            finalWords = customWords;
        } else {
            const langData = MULTI_LANG_DATA[gameState.appLanguage];
            const sourceData = (langData as any)?.[mainCat]?.[subCat] as Word[] | undefined;
            if (sourceData && Array.isArray(sourceData)) {
                finalWords = (shuffle([...sourceData])).slice(0, isBoss ? 20 : questionCount);
            }
        }

        if (finalWords.length === 0) { 
            alert("Nie znaleziono słówek dla tej kategorii.");
            setView('menu'); 
            return; 
        }

        if (playerRole === 'teacher') {
            broadcastMessage(PeerMessageType.START_GAME, {
                words: finalWords,
                difficulty: selectedDifficulty,
                mode: selectedMode
            });
            setWordsQueue(finalWords); 
            setView('multi-leaderboard');
            playSound('start');
        } else {
            setWordsQueue(finalWords);
            setBossTimer(isBoss ? 75 : 0);
            setGameState(prev => ({ 
                ...prev, isBossMode: isBoss, mainCategory: mainCat, currentCategory: subCat, 
                currentQuestionIndex: 0, score: 0, isGameActive: true, mistakes: [], activeShield: false,
                difficulty: selectedDifficulty,
                mode: (mainCat === 'orthography' || isBoss || selectedDifficulty === 'hard') ? 'spelling' : selectedMode
            }));

            if (mainCat === 'orthography' || isBoss || selectedDifficulty === 'hard' || selectedMode === 'spelling') {
                initSpellingQuestion(finalWords[0]);
            }
            setView('game');
            playSound('start');
            const distractors = shuffle(finalWords.filter((w: Word) => w.en !== (finalWords[0] as Word).en)).slice(0, 3);
            setCurrentHintOptions(shuffle([
                (finalWords[0] as Word).en,
                ...distractors.map((d: Word) => d.en)
            ]));
        }
    }, [gameState.appLanguage, initSpellingQuestion, selectedDifficulty, selectedMode, playerRole, conns]);

    const handleAnswer = async (selected: string) => {
        if (isCooldown) return;
        const word = wordsQueue[gameState.currentQuestionIndex] as Word | undefined;
        if (!word) return;

        setIsCooldown(true);
        setSelectedOption(selected);

        const isCorrect = selected.toLowerCase().trim() === word.en.toLowerCase().trim();

        if (!isCorrect) {
            playSound('incorrect');
            if (gameState.activeShield) {
                setGameState(prev => ({ ...prev, activeShield: false }));
                setSpellingInput("");
                setIsCooldown(false);
                setSelectedOption(null);
                return;
            }
            setIsWrongAnswer(true);
            setTimeout(() => setIsWrongAnswer(false), 500);

            setTimeout(() => {
                // Reset progress: back to the first question
                setGameState(prev => ({ 
                    ...prev, 
                    currentQuestionIndex: 0, 
                    score: 0,
                    mistakes: [...prev.mistakes, { word, userAnswer: selected, correctAnswer: word.en }] 
                }));
                
                setSpellingInput("");
                const firstWord = wordsQueue[0];
                if (gameState.mode === 'spelling' || gameState.mainCategory === 'orthography') {
                    initSpellingQuestion(firstWord);
                }
                
                if (firstWord) {
                    const distractors = shuffle(wordsQueue.filter((w: Word) => w.en !== (firstWord as Word).en)).slice(0, 3);
                    setCurrentHintOptions(shuffle([
                        (firstWord as Word).en,
                        ...distractors.map((d: Word) => d.en)
                    ]));
                }

                if (playerRole === 'student') {
                    sendToHost(PeerMessageType.UPDATE_SCORE, { score: 0, progress: 0 });
                }

                if (gameState.isBossMode) setBossTimer(t => Math.max(0, t - 2));
                setIsCooldown(false);
                setSelectedOption(null);
            }, 2000);
            return;
        }

        if (isCorrect) {
            playSound('correct');
        }

        const xpMulti = gameState.difficulty === 'hard' ? 2 : (gameState.difficulty === 'normal' ? 1.5 : 1);
        const earnedXP = isCorrect ? Math.round((gameState.isBossMode ? 40 : 20) * xpMulti) : 0;
        setXpData(prev => ({ ...prev, [currentSubject]: (prev[currentSubject] || 0) + earnedXP }));
        
        const nextIdx = gameState.currentQuestionIndex + 1;
        const currentScore = gameState.score + (isCorrect ? 1 : 0);
        const progress = Math.round((nextIdx / wordsQueue.length) * 100);

        if (playerRole === 'student') {
            sendToHost(PeerMessageType.UPDATE_SCORE, { score: currentScore, progress });
        }

        setTimeout(() => {
            if (nextIdx >= wordsQueue.length) {
                confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
                playSound('end');
                if (playerRole === 'student') sendToHost(PeerMessageType.GAME_OVER, {});
                setView('summary');
            } else {
                setGameState(prev => ({ ...prev, currentQuestionIndex: nextIdx, score: currentScore }));
                setSpellingInput(""); // Reset input explicitly
                const nextWord = wordsQueue[nextIdx] as Word | undefined;
                if (gameState.mode === 'spelling' || gameState.mainCategory === 'orthography') initSpellingQuestion(nextWord);
                if (nextWord) {
                    const distractors = shuffle(wordsQueue.filter((w: Word) => w.en !== (nextWord as Word).en)).slice(0, 3);
                    setCurrentHintOptions(shuffle([
                        (nextWord as Word).en,
                        ...distractors.map((d: Word) => d.en)
                    ]));
                }
            }
            setIsCooldown(false);
            setSelectedOption(null);
        }, 2000);
    };

    const handleExitToMenu = () => {
        document.getElementById('main-body')?.classList.remove('boss-bg');
        document.getElementById('main-body')?.classList.add('animated-bg');
        
        if (peer) {
            peer.destroy();
            setPeer(null);
        }
        setConns([]);
        setConn(null);
        setRemotePlayers([]);
        setPlayerRole('single');
        setView('menu');
        setIsReconnecting(false);
        setIsConnectingToRoom(false);
    };

    const buyPowerUp = (type: keyof PowerUps, cost: number) => {
        const currentXP = xpData[currentSubject] || 0;
        if (currentXP < cost) { alert("Za mało XP!"); return; }
        setXpData(prev => ({ ...prev, [currentSubject]: prev[currentSubject] - cost }));
        setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
    };

    const sortedPlayers = useMemo(() => {
        return [...remotePlayers].sort((a, b) => b.score - a.score || b.progress - a.progress);
    }, [remotePlayers]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            {isReconnecting && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-6 py-2 rounded-full font-black text-xs shadow-xl flex items-center gap-2 animate-bounce">
                    <span>📡</span> UTRACONO POŁĄCZENIE. PONAWIANIE...
                </div>
            )}
            
            <Card className="w-full max-w-lg min-h-[780px] flex flex-col relative overflow-hidden">
                
                {view === 'menu' && (
                    <div className="flex flex-col gap-4 items-center text-center py-4 flex-1 overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between w-full px-2">
                            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                                <span className="text-lg">🔥</span>
                                <span className="font-black text-orange-600 text-xs">{streak} DNI</span>
                            </div>
                            <Button variant="ghost" onClick={() => setView('shop')} className="!px-3 !py-1 bg-amber-50 border border-amber-200 rounded-full">
                                <span className="text-lg">🛒</span>
                                <span className="font-black text-amber-700 text-[10px]">SKLEP</span>
                            </Button>
                        </div>

                        <h1 className="text-5xl font-black text-indigo-700 mt-2">Słówka Pro</h1>
                        
                        <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-1 rounded-2xl border border-white mt-2">
                            {['Angielski', 'Hiszpański'].map(s => (
                                <button key={s} onClick={() => setCurrentSubject(s as Subject)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentSubject === s ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>{s.toUpperCase()}</button>
                            ))}
                        </div>

                        <div className="w-full max-w-[280px] mt-4">
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${xpPercentage}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                                <p className="text-[10px] font-black text-gray-400">LVL {playerLevel}</p>
                                <p className="text-[10px] font-black text-indigo-500">{xpData[currentSubject]} XP</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full mt-4">
                             <Button variant="boss" onClick={() => {
                                 const langData = MULTI_LANG_DATA[gameState.appLanguage] as any;
                                 const catData = langData?.[gameState.mainCategory] || {};
                                 const allWords = Object.values(catData).flat() as Word[];
                                 startGame(gameState.mainCategory, "BOSS_CHALLENGE", true, shuffle(allWords).slice(0, 15));
                             }} className="h-16">WYZWANIE BOSSA</Button>
                             <Button variant="ai" onClick={() => setView('ai-prompt')} className="h-16">GENERUJ Z AI</Button>
                             <Button variant="multi" onClick={() => setView('multi-menu')} className="h-16 col-span-2">GRAJ Z INNYMI</Button>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-2xl w-full mt-4 border-2 border-white">
                            <button onClick={() => setEngSubMode('path')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${engSubMode === 'path' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>ŚCIEŻKA PRZYGODY</button>
                            <button onClick={() => setEngSubMode('classic')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${engSubMode === 'classic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>KATEGORIE</button>
                        </div>

                        <div className="w-full space-y-4 pb-12 overflow-y-auto scrollbar-hide flex-1 mt-4 px-2">
                            {engSubMode === 'path' ? (
                                <div className="flex flex-col items-center gap-10 relative">
                                    <div className="absolute top-0 bottom-0 w-2 bg-indigo-50 left-1/2 -translate-x-1/2 rounded-full" />
                                    {(currentSubject === 'Angielski' ? ENGLISH_CHAPTERS : SPANISH_CHAPTERS).map((chapter) => (
                                        <button key={chapter.id} onClick={() => {
                                            if (playerRole === 'student') {
                                                alert("Jesteś w trybie Multiplayer jako uczeń. Musisz wyjść, aby grać samemu.");
                                                return;
                                            }
                                            setPendingChapter({ mainCat: chapter.mainCategory, subCat: chapter.category, icon: chapter.icon, title: chapter.title });
                                            setView('start');
                                        }} className="relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center text-3xl shadow-xl border-4 bg-white border-indigo-500 hover:scale-110 active:scale-90 transition-all">
                                            {chapter.icon}
                                            <span className="absolute -bottom-6 w-32 text-[8px] font-black text-indigo-900 uppercase">{chapter.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.keys((MULTI_LANG_DATA[gameState.appLanguage] as any)[gameState.mainCategory] || {}).map(cat => (
                                        <Button key={cat} onClick={() => {
                                            if (playerRole === 'student') {
                                                alert("Jesteś w trybie Multiplayer jako uczeń. Musisz wyjść, aby grać samemu.");
                                                return;
                                            }
                                            setPendingChapter({ mainCat: gameState.mainCategory, subCat: cat, title: cat.replace('_', ' ').toUpperCase() });
                                            setView('start');
                                        }} variant="secondary" className="h-14 flex justify-between px-6 rounded-2xl">
                                            <span>{cat.replace('_', ' ').toUpperCase()}</span>
                                            <span>→</span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'multi-menu' && (
                    <div className="flex flex-col gap-6 items-center justify-center flex-1 p-4">
                        <h2 className="text-3xl font-black text-fuchsia-600 uppercase">Multiplayer</h2>
                        <input 
                            placeholder="Twój Nick..." 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full p-4 rounded-2xl border-2 border-fuchsia-100 font-bold outline-none"
                            disabled={isConnectingToRoom}
                        />
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button 
                                variant="multi" 
                                onClick={() => {
                                    if (!nickname.trim()) { alert("Wpisz nick!"); return; }
                                    initPeer(true);
                                }} 
                                disabled={isConnectingToRoom || isInitializingPeer}
                            >
                                {isInitializingPeer && playerRole !== 'student' ? "ŁĄCZENIE..." : "STWÓRZ POKÓJ"}
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => {
                                    if (!nickname.trim()) { alert("Wpisz nick!"); return; }
                                    setPlayerRole('student');
                                    initPeer(false);
                                }} 
                                disabled={isConnectingToRoom || isInitializingPeer}
                            >
                                {isInitializingPeer && playerRole === 'student' ? "ŁĄCZENIE..." : "DOŁĄCZ DO GRY"}
                            </Button>
                        </div>
                        {playerRole === 'student' && (
                            <div className="w-full flex flex-col gap-2">
                                <input 
                                    placeholder="KOD POKOJU (4 litery)..." 
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 font-bold outline-none text-center text-2xl tracking-widest"
                                    maxLength={4}
                                    disabled={isConnectingToRoom}
                                />
                                <Button 
                                    variant="primary" 
                                    onClick={connectToPeer} 
                                    disabled={isConnectingToRoom || !targetId}
                                    className={isConnectingToRoom ? "animate-pulse" : ""}
                                >
                                    {isConnectingToRoom ? "ŁĄCZENIE..." : "POŁĄCZ"}
                                </Button>
                            </div>
                        )}
                        <Button variant="ghost" onClick={() => handleExitToMenu()} disabled={isConnectingToRoom}>ANULUJ</Button>
                    </div>
                )}

                {view === 'lobby' && (
                    <div className="flex flex-col gap-6 items-center justify-center flex-1 p-4 text-center">
                        <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center text-4xl mb-4">🏠</div>
                        <h2 className="text-2xl font-black text-indigo-900 uppercase">Pokój Oczekiwania</h2>
                        <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50 w-full mb-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase">KOD POKOJU:</p>
                            <p className="text-5xl font-black text-indigo-600 tracking-widest">{myId || "..."}</p>
                        </div>
                        
                        <div className="w-full space-y-2">
                            <p className="text-left font-black text-[10px] uppercase text-indigo-500">Gracze ({remotePlayers.length}):</p>
                            <div className="p-4 bg-gray-50 rounded-2xl text-left font-bold flex flex-col gap-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                                {remotePlayers.length === 0 && <p className="text-gray-300 italic text-center text-xs">Czekanie na graczy...</p>}
                                {remotePlayers.map(p => (
                                    <div key={p.id} className="flex items-center gap-2">🔵 {p.nick}</div>
                                ))}
                            </div>
                        </div>

                        {playerRole === 'teacher' ? (
                            <div className="w-full flex flex-col gap-2 mt-4">
                                <p className="text-xs text-gray-400 font-bold italic">Wybierz lekcję z menu głównego, aby zacząć!</p>
                                <Button variant="primary" onClick={() => setView('menu')}>WYBIERZ LEKCJĘ</Button>
                            </div>
                        ) : (
                            <p className="mt-8 animate-pulse font-black text-fuchsia-500">Host zaraz zacznie grę...</p>
                        )}
                        
                        <Button variant="ghost" onClick={handleExitToMenu}>WYJDŹ</Button>
                    </div>
                )}

                {view === 'multi-leaderboard' && (
                    <div className="flex flex-col gap-4 flex-1 p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-indigo-900 uppercase">Ranking na żywo</h2>
                            <span className="bg-fuchsia-100 text-fuchsia-600 px-3 py-1 rounded-full text-[10px] font-black">HOST</span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
                            {sortedPlayers.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                                    <div className="text-5xl">🔭</div>
                                    <p className="font-bold">Brak graczy...</p>
                                </div>
                            )}
                            {sortedPlayers.map((p, idx) => (
                                <div key={p.id} className={`p-4 rounded-2xl flex flex-col gap-2 transition-all border-2 ${p.status === 'finished' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-indigo-50 shadow-sm'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                                                {idx + 1}
                                            </span>
                                            <span className="font-black text-indigo-900">{p.nick} {p.status === 'finished' ? '✅' : ''}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-indigo-600">{p.score} pkt</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${p.status === 'finished' ? 'bg-emerald-500' : 'bg-fuchsia-500'}`} style={{ width: `${p.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="danger" onClick={handleExitToMenu} className="w-full">ZAKOŃCZ SESJĘ</Button>
                    </div>
                )}

                {view === 'start' && pendingChapter && (
                    <div className="flex flex-col gap-6 items-center justify-center flex-1 py-8 px-4 text-center">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white mb-2">
                            {pendingChapter.icon || '📚'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-indigo-900 uppercase">{pendingChapter.title}</h2>
                            <p className="text-xs font-bold text-gray-400 mt-1">Ustawienia gry</p>
                        </div>

                        <div className="w-full space-y-4">
                            <p className="text-[10px] font-black text-indigo-500 text-left uppercase tracking-widest">Trudność</p>
                            <div className="flex gap-2">
                                {(['easy', 'normal', 'hard'] as Difficulty[]).map(diff => (
                                    <button 
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] transition-all border-2 ${selectedDifficulty === diff 
                                            ? (diff === 'easy' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg' : diff === 'normal' ? 'bg-amber-500 border-amber-600 text-white shadow-lg' : 'bg-rose-500 border-rose-600 text-white shadow-lg') 
                                            : 'bg-white text-gray-400 border-gray-100'}`}
                                    >
                                        {diff.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <p className="text-[10px] font-black text-indigo-500 text-left uppercase tracking-widest mt-6">Tryb Gry</p>
                            <div className="flex bg-gray-100 p-1 rounded-2xl w-full border-2 border-white">
                                <button 
                                    onClick={() => setSelectedMode('translation')} 
                                    className={`flex-1 py-3 rounded-xl font-black text-[10px] ${selectedMode === 'translation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    TŁUMACZENIE
                                </button>
                                <button 
                                    onClick={() => setSelectedMode('spelling')} 
                                    className={`flex-1 py-3 rounded-xl font-black text-[10px] ${selectedMode === 'spelling' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    LITEROWANIE
                                </button>
                            </div>
                        </div>

                        <div className="w-full pt-8 flex flex-col gap-2">
                            <Button variant="primary" onClick={() => startGame(pendingChapter.mainCat, pendingChapter.subCat, false, customWordsBuffer || undefined)} className="w-full h-16 text-xl">ROZPOCZNIJ</Button>
                            <Button variant="ghost" onClick={() => {
                                setCustomWordsBuffer(null);
                                setView('menu');
                            }}>ANULUJ</Button>
                        </div>
                    </div>
                )}

                {view === 'game' && wordsQueue[gameState.currentQuestionIndex] && (
                    <div className={`flex flex-col h-full gap-4 flex-1 ${isWrongAnswer ? 'animate-shake' : ''}`}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <button onClick={handleExitToMenu} className="text-[10px] font-black text-gray-400 hover:text-red-500">WYJDŹ</button>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        if (powerUps.hints <= 0) return;
                                        setPowerUps(p => ({ ...p, hints: p.hints - 1 }));
                                        const word = wordsQueue[gameState.currentQuestionIndex] as Word | undefined;
                                        if (word && (gameState.mode === 'spelling' || gameState.mainCategory === 'orthography')) {
                                            setSpellingInput(word.en.substring(0, spellingInput.length + 1).toUpperCase());
                                        }
                                    }} disabled={powerUps.hints <= 0} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${powerUps.hints > 0 ? 'bg-amber-100' : 'bg-gray-100 opacity-50'}`}>💡{powerUps.hints}</button>
                                    <button onClick={() => {
                                        if (powerUps.shields <= 0 || gameState.activeShield) return;
                                        setPowerUps(p => ({ ...p, shields: p.shields - 1 }));
                                        setGameState(s => ({ ...s, activeShield: true }));
                                    }} disabled={powerUps.shields <= 0 || gameState.activeShield} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${gameState.activeShield ? 'bg-indigo-500 text-white' : 'bg-blue-100'}`}>🛡️{powerUps.shields}</button>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{gameState.currentQuestionIndex + 1} / {wordsQueue.length}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(gameState.currentQuestionIndex / wordsQueue.length) * 100}%` }} />
                            </div>
                        </div>

                        {gameState.isBossMode && <div className={`text-center py-1 rounded-xl font-black text-2xl border-4 ${bossTimer < 10 ? 'bg-red-500 text-white animate-shake' : 'bg-black text-yellow-400'}`}>⏱️ {bossTimer}s</div>}

                        <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 bg-indigo-50 rounded-3xl flex items-center justify-center text-5xl border-4 border-white shadow-inner mb-4">🧠</div>
                                <button onClick={() => {
                                    const word = wordsQueue[gameState.currentQuestionIndex] as Word | undefined;
                                    if (word) playAudio(word.en);
                                }} className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg shadow-lg">🔊</button>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-4xl font-black text-indigo-900">
                                    {(gameState.mode === 'spelling' || gameState.mainCategory === 'orthography') ? "Posłuchaj i wpisz..." : (wordsQueue[gameState.currentQuestionIndex] as Word | undefined)?.pl}
                                </h2>
                            </div>
                            
                            {(gameState.mode === 'spelling' || gameState.mainCategory === 'orthography') ? (
                                <div className="w-full space-y-4">
                                    <div className="flex flex-wrap justify-center gap-1 min-h-[50px]">
                                        {(wordsQueue[gameState.currentQuestionIndex] as Word | undefined)?.en.toUpperCase().replace(/[^A-Z]/g, "").split("").map((_, i) => {
                                            const word = wordsQueue[gameState.currentQuestionIndex] as Word;
                                            const isCorrect = isCooldown && spellingInput.toLowerCase() === word.en.toLowerCase();
                                            const isWrong = isCooldown && spellingInput.toLowerCase() !== word.en.toLowerCase();
                                            return (
                                                <div key={i} className={`w-8 h-10 rounded-lg border-b-4 flex items-center justify-center text-lg font-black ${isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : isWrong ? 'bg-rose-50 border-rose-500 text-rose-700' : spellingInput[i] ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm' : 'bg-gray-100 border-gray-300 text-transparent'}`}>{spellingInput[i] || ""}</div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 px-2 mt-4">
                                        {spellingTiles.map((char, i) => (
                                            <button key={i} disabled={isCooldown} onClick={() => {
                                                const next = spellingInput + char;
                                                setSpellingInput(next);
                                                const word = wordsQueue[gameState.currentQuestionIndex] as Word | undefined;
                                                if (word) {
                                                    const target = word.en.toUpperCase().replace(/[^A-Z]/g, "");
                                                    if (next.length === target.length) {
                                                        setTimeout(() => handleAnswer(next), 200);
                                                    }
                                                }
                                            }} className={`w-11 h-11 bg-white rounded-xl border-2 border-indigo-50 flex items-center justify-center text-xl font-black shadow-md hover:border-indigo-200 active:scale-90 transition-all text-indigo-800 ${isCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}>{char}</button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 w-full mt-4">
                                        <Button variant="danger" onClick={() => setSpellingInput(prev => prev.slice(0, -1))} className="flex-1" disabled={isCooldown}>COFNIJ</Button>
                                        <Button variant="secondary" onClick={() => setSpellingInput("")} className="flex-1" disabled={isCooldown}>RESET</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 w-full max-w-sm px-4">
                                    {currentHintOptions.map((opt, i) => {
                                        const word = wordsQueue[gameState.currentQuestionIndex] as Word;
                                        const isSelected = selectedOption === opt;
                                        const isCorrect = opt.toLowerCase() === word.en.toLowerCase();
                                        
                                        let variant: any = "secondary";
                                        if (isCooldown) {
                                            if (isCorrect) variant = "success";
                                            else if (isSelected) variant = "danger";
                                        }

                                        return (
                                            <Button 
                                                key={i} 
                                                variant={variant} 
                                                className="h-16 text-lg rounded-2xl shadow-sm" 
                                                onClick={() => handleAnswer(opt)}
                                                disabled={isCooldown}
                                            >
                                                {opt}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'summary' && (
                    <div className="flex flex-col gap-6 text-center items-center justify-center flex-1">
                        <div className="text-8xl animate-bounce">🎊</div>
                        <h2 className="text-4xl font-black text-indigo-700 uppercase italic">Koniec!</h2>
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-50 w-full shadow-inner">
                             <p className="text-3xl font-black text-indigo-600">+{gameState.score * (gameState.isBossMode ? 40 : 20)} XP</p>
                             <p className="text-[10px] font-bold text-gray-400 mt-2">Dobra robota! Wiedza to potęga.</p>
                        </div>
                        <Button onClick={handleExitToMenu} className="w-full h-16 text-xl">MENU GŁÓWNE</Button>
                    </div>
                )}

                {view === 'loading' && (
                    <div className="flex flex-col gap-6 items-center justify-center flex-1">
                        <div className="w-24 h-24 bg-purple-100 rounded-full animate-spin border-8 border-dashed border-purple-400 flex items-center justify-center text-4xl shadow-inner text-purple-600">🚀</div>
                        <h2 className="text-2xl font-black text-purple-700 uppercase">Ładowanie...</h2>
                    </div>
                )}

                {view === 'ai-prompt' && (
                    <div className="flex flex-col gap-6 text-center justify-center flex-1 p-4">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-3xl font-black text-indigo-700 uppercase">Wymyśl temat</h2>
                        <input 
                            placeholder="Np. Podróż na Marsa..." 
                            className="w-full p-6 text-center text-xl font-bold bg-gray-50 rounded-3xl border-4 border-indigo-100 outline-none" 
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    const topic = e.currentTarget.value;
                                    setView('loading');
                                    generateCategoryWords(topic, currentSubject).then(res => {
                                        if (res.isValid) {
                                            setCustomWordsBuffer(res.words);
                                            setPendingChapter({ mainCat: 'words', subCat: topic, title: topic.toUpperCase(), icon: '🤖' });
                                            setView('start');
                                        } else {
                                            alert("Nie udało się wygenerować tematu.");
                                            setView('ai-prompt');
                                        }
                                    });
                                }
                            }} 
                        />
                        <Button onClick={() => setView('menu')} variant="ghost">ANULUJ</Button>
                    </div>
                )}

                {view === 'shop' && (
                    <div className="flex flex-col gap-6 flex-1 py-4">
                         <div className="text-center">
                            <h2 className="text-3xl font-black text-amber-600 uppercase">Sklep</h2>
                            <p className="mt-2 font-black text-indigo-600">{xpData[currentSubject]} XP</p>
                         </div>
                         <div className="space-y-4 flex-1">
                            <div className="p-5 bg-white rounded-3xl border-2 border-indigo-50 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">💡</div>
                                    <p className="font-black text-indigo-900 text-xs">Podpowiedź</p>
                                </div>
                                <Button variant="powerup" onClick={() => buyPowerUp('hints', 100)}>100 XP</Button>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border-2 border-indigo-50 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">🛡️</div>
                                    <p className="font-black text-indigo-900 text-xs">Tarcza</p>
                                </div>
                                <Button variant="powerup" onClick={() => buyPowerUp('shields', 250)}>250 XP</Button>
                            </div>
                         </div>
                         <Button onClick={() => setView('menu')} variant="secondary">POWRÓT</Button>
                    </div>
                )}

            </Card>
        </div>
    );
}
