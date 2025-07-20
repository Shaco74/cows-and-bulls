import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/lib/types';
import { Lobby, Player, GameState, Guess } from '@/lib/types';
import { generateLobbyCode, calculateBullsAndCows, isValidNumber } from '@/lib/game-logic';

const lobbies = new Map<string, Lobby>();
const games = new Map<string, GameState>();

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    const io = new ServerIO(res.socket.server as any);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('create-lobby', (data: { playerName: string }) => {
        const lobbyId = generateLobbyCode();
        const playerId = socket.id;
        
        const player: Player = {
          id: playerId,
          name: data.playerName,
          socketId: socket.id,
          isHost: true,
          isReady: false
        };

        const lobby: Lobby = {
          id: lobbyId,
          hostId: playerId,
          players: [player],
          settings: {
            numberLength: 4
          },
          status: 'waiting',
          createdAt: new Date()
        };

        lobbies.set(lobbyId, lobby);
        socket.join(lobbyId);

        socket.emit('lobby-created', { lobbyId, lobby });
        console.log(`Lobby ${lobbyId} created by ${data.playerName}`);
      });

      socket.on('join-lobby', (data: { lobbyCode: string; playerName: string }) => {
        const lobby = lobbies.get(data.lobbyCode);
        
        if (!lobby) {
          socket.emit('error', { message: 'Lobby nicht gefunden' });
          return;
        }

        if (lobby.status !== 'waiting') {
          socket.emit('error', { message: 'Lobby ist nicht verfügbar' });
          return;
        }

        const player: Player = {
          id: socket.id,
          name: data.playerName,
          socketId: socket.id,
          isHost: false,
          isReady: false
        };

        lobby.players.push(player);
        socket.join(data.lobbyCode);

        io.to(data.lobbyCode).emit('lobby-updated', lobby);
        socket.emit('lobby-joined', { lobbyId: data.lobbyCode, lobby });
        
        console.log(`${data.playerName} joined lobby ${data.lobbyCode}`);
      });

      socket.on('leave-lobby', (data: { lobbyId: string }) => {
        const lobby = lobbies.get(data.lobbyId);
        if (!lobby) return;

        const playerIndex = lobby.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) return;

        const player = lobby.players[playerIndex];
        lobby.players.splice(playerIndex, 1);

        socket.leave(data.lobbyId);

        if (lobby.players.length === 0) {
          lobbies.delete(data.lobbyId);
          console.log(`Lobby ${data.lobbyId} deleted (empty)`);
        } else {
          if (player.isHost && lobby.players.length > 0) {
            lobby.players[0].isHost = true;
            lobby.hostId = lobby.players[0].id;
          }
          io.to(data.lobbyId).emit('lobby-updated', lobby);
        }

        console.log(`${player.name} left lobby ${data.lobbyId}`);
      });

      socket.on('update-settings', (data: { lobbyId: string; settings: any }) => {
        const lobby = lobbies.get(data.lobbyId);
        if (!lobby) return;

        const player = lobby.players.find(p => p.socketId === socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Nur der Host kann Einstellungen ändern' });
          return;
        }

        lobby.settings = { ...lobby.settings, ...data.settings };
        io.to(data.lobbyId).emit('lobby-updated', lobby);
      });

      socket.on('player-ready', (data: { lobbyId: string; ready: boolean }) => {
        const lobby = lobbies.get(data.lobbyId);
        if (!lobby) return;

        const player = lobby.players.find(p => p.socketId === socket.id);
        if (!player) return;

        player.isReady = data.ready;
        io.to(data.lobbyId).emit('lobby-updated', lobby);

        if (lobby.players.length >= 2 && lobby.players.every(p => p.isReady)) {
          startGame(data.lobbyId, io);
        }
      });

      socket.on('submit-secret-number', (data: { gameId: string; secretNumber: string }) => {
        const game = games.get(data.gameId);
        const lobby = lobbies.get(data.gameId);
        if (!game || !lobby) return;

        if (!isValidNumber(data.secretNumber, lobby.settings.numberLength)) {
          socket.emit('error', { message: 'Ungültige Zahl' });
          return;
        }

        const player = game.players.find(p => p.id === socket.id);
        if (!player) return;

        player.secretNumber = data.secretNumber;

        // Check if all players have set their secret numbers
        if (game.players.every(p => p.secretNumber)) {
          // Assign numbers to players
          assignNumbers(game);
          game.status = 'playing';
          io.to(data.gameId).emit('game-updated', game);
        } else {
          io.to(data.gameId).emit('game-updated', game);
        }
      });

      socket.on('make-guess', (data: { gameId: string; guess: string }) => {
        const game = games.get(data.gameId);
        const lobby = lobbies.get(data.gameId);
        if (!game || !lobby) return;

        if (!isValidNumber(data.guess, lobby.settings.numberLength)) {
          socket.emit('error', { message: 'Ungültige Zahl' });
          return;
        }

        const player = game.players.find(p => p.id === socket.id);
        if (!player || !player.assignedNumber || player.hasWon) return;

        const result = calculateBullsAndCows(data.guess, player.assignedNumber);
        
        const guess: Guess = {
          number: data.guess,
          bulls: result.bulls,
          cows: result.cows,
          timestamp: new Date()
        };

        player.guesses.push(guess);

        // Check if player won
        if (result.bulls === lobby.settings.numberLength) {
          player.hasWon = true;
          game.status = 'finished';
          game.winner = player.id;
          io.to(data.gameId).emit('game-finished', { winner: player.name, gameState: game });
        } else {
          io.to(data.gameId).emit('game-updated', game);
        }
      });

      socket.on('new-game', (data: { gameId: string }) => {
        const lobby = lobbies.get(data.gameId);
        if (!lobby) return;

        // Reset game state
        const gameState: GameState = {
          id: data.gameId,
          lobbyId: data.gameId,
          players: lobby.players.map(p => ({
            id: p.id,
            name: p.name,
            guesses: [],
            hasWon: false
          })),
          status: 'setup',
          startedAt: new Date()
        };

        games.set(data.gameId, gameState);
        lobby.status = 'playing';
        
        // Reset player ready states
        lobby.players.forEach(p => p.isReady = false);
        
        io.to(data.gameId).emit('game-started', { gameState });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        for (const [lobbyId, lobby] of lobbies.entries()) {
          const playerIndex = lobby.players.findIndex(p => p.socketId === socket.id);
          if (playerIndex !== -1) {
            const player = lobby.players[playerIndex];
            lobby.players.splice(playerIndex, 1);

            if (lobby.players.length === 0) {
              lobbies.delete(lobbyId);
              games.delete(lobbyId);
            } else {
              if (player.isHost && lobby.players.length > 0) {
                lobby.players[0].isHost = true;
                lobby.hostId = lobby.players[0].id;
              }
              io.to(lobbyId).emit('lobby-updated', lobby);
            }
            break;
          }
        }
      });
    });

    setInterval(() => {
      const now = Date.now();
      for (const [lobbyId, lobby] of lobbies.entries()) {
        if (now - lobby.createdAt.getTime() > 24 * 60 * 60 * 1000) {
          lobbies.delete(lobbyId);
        }
      }
    }, 60 * 60 * 1000);
  }

  res.end();
}

function startGame(lobbyId: string, io: ServerIO) {
  const lobby = lobbies.get(lobbyId);
  if (!lobby) return;

  lobby.status = 'playing';
  
  const gameState: GameState = {
    id: lobbyId,
    lobbyId: lobbyId,
    players: lobby.players.map(p => ({
      id: p.id,
      name: p.name,
      guesses: [],
      hasWon: false
    })),
    status: 'setup',
    startedAt: new Date()
  };

  games.set(lobbyId, gameState);
  io.to(lobbyId).emit('game-started', { gameState });
  
  console.log(`Game started for lobby ${lobbyId}`);
}

function assignNumbers(game: GameState) {
  const players = game.players;
  
  // Create a simple circular assignment
  // Each player gets the secret number from the next player
  for (let i = 0; i < players.length; i++) {
    const nextIndex = (i + 1) % players.length;
    players[i].assignedNumber = players[nextIndex].secretNumber;
    players[i].assignedBy = players[nextIndex].id;
  }
  
  console.log('Numbers assigned to players');
}