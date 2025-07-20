import { NextApiResponse } from 'next';
import { Server as NetServer, Socket } from 'net';
import { Server as SocketIOServer } from 'socket.io';

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  isReady: boolean;
}

export interface GameSettings {
  numberLength: number;
  maxGuesses?: number;
  timeLimit?: number;
}

export interface Lobby {
  id: string;
  hostId: string;
  players: Player[];
  settings: GameSettings;
  status: 'waiting' | 'configuring' | 'playing' | 'finished';
  createdAt: Date;
}

export interface Guess {
  number: string;
  bulls: number;
  cows: number;
  timestamp: Date;
}

export interface GamePlayer {
  id: string;
  name: string;
  assignedNumber?: string;
  assignedBy?: string;
  secretNumber?: string;
  guesses: Guess[];
  hasWon: boolean;
}

export interface GameState {
  id: string;
  lobbyId: string;
  players: GamePlayer[];
  status: 'setup' | 'playing' | 'finished';
  startedAt: Date;
  winner?: string;
}