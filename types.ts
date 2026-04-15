
export interface Word {
  id: string;
  pl: string;
  en: string; 
  explanation?: string; 
  emoji?: string;
  correct_form?: string; 
  distractors?: string[]; 
  imageUrl?: string; // Wygenerowany obrazek AI
  mnemonic?: string; // Mnemotechnika AI
}

export type ProficiencyLevel = 'zero' | 'intermediate' | 'advanced';
export type AppLanguage = 'EN' | 'ES';
export type MainCategory = 'words' | 'phrases' | 'orthography' | 'math' | 'lesson';
export type GameMode = 'translation' | 'listening' | 'spelling' | 'quiz' | 'mixed';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type PlayerRole = 'teacher' | 'student' | 'single';

export interface PowerUps {
  hints: number;
  shields: number;
  freezes: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface Mistake {
  word: Word;
  userAnswer: string;
  correctAnswer: string;
}

export interface GameState {
  appLanguage: AppLanguage;
  mainCategory: MainCategory;
  currentCategory: string | null;
  difficulty: Difficulty;
  mode: GameMode;
  currentQuestionIndex: number;
  score: number;
  isGameActive: boolean;
  history: Array<{
    word: Word;
    selected: string;
    correct: string;
    isCorrect: boolean;
  }>;
  mistakes: Mistake[];
  isBossMode: boolean;
  activeShield: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  completed: boolean;
  reward: number;
}

export interface PlayerData {
  id: string;
  nick: string;
  score: number;
  progress: number;
  status: 'playing' | 'restart' | 'finished';
  level: number;
}

export enum PeerMessageType {
  JOIN = 'JOIN',
  START_GAME = 'START_GAME',
  UPDATE_SCORE = 'UPDATE_SCORE',
  GAME_OVER = 'GAME_OVER'
}

export interface PeerMessage {
  type: PeerMessageType;
  payload?: any;
}

export interface Chapter {
  id: string;
  title: string;
  category: string;
  mainCategory: MainCategory;
  requiredLevel: number;
  icon: string;
  difficulty: Difficulty;
  description?: string;
}

export type Subject = 'Angielski' | 'Hiszpański';
