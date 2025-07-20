"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { socketManager } from '@/lib/socket'
import { GameState, GamePlayer, Guess } from '@/lib/types'
import { isValidNumber, calculateBullsAndCows } from '@/lib/game-logic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Trophy, Clock, Users, Eye, EyeOff } from 'lucide-react'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params?.gameId as string
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null)
  const [secretNumber, setSecretNumber] = useState('')
  const [currentGuess, setCurrentGuess] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [numberLength, setNumberLength] = useState(4)

  useEffect(() => {
    const socket = socketManager.connect()

    socket.on('game-started', (data: { gameState: GameState }) => {
      setGameState(data.gameState)
      setNumberLength(4) // Default, could get from lobby settings
      const player = data.gameState.players.find(p => p.id === socket.id)
      setCurrentPlayer(player || null)
    })

    socket.on('game-updated', (updatedGameState: GameState) => {
      setGameState(updatedGameState)
      const player = updatedGameState.players.find(p => p.id === socket.id)
      setCurrentPlayer(player || null)
    })

    socket.on('secret-number-set', () => {
      // Refresh game state when secret number is set
    })

    socket.on('guess-result', (data: { playerId: string; guess: Guess }) => {
      // This will be handled by game-updated event
    })

    socket.on('game-finished', (data: { winner: string; gameState: GameState }) => {
      setGameState(data.gameState)
    })

    socket.on('error', (error: { message: string }) => {
      alert(error.message)
    })

    return () => {
      socket.off('game-started')
      socket.off('game-updated')
      socket.off('secret-number-set')
      socket.off('guess-result')
      socket.off('game-finished')
      socket.off('error')
    }
  }, [gameId])

  const submitSecretNumber = () => {
    if (!isValidNumber(secretNumber, numberLength)) {
      alert(`Bitte gib eine gültige ${numberLength}-stellige Zahl mit eindeutigen Ziffern ein`)
      return
    }

    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('submit-secret-number', {
        gameId,
        secretNumber
      })
      setSecretNumber('')
    }
  }

  const makeGuess = () => {
    if (!isValidNumber(currentGuess, numberLength)) {
      alert(`Bitte gib eine gültige ${numberLength}-stellige Zahl mit eindeutigen Ziffern ein`)
      return
    }

    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('make-guess', {
        gameId,
        guess: currentGuess
      })
      setCurrentGuess('')
    }
  }

  const goBackToLobby = () => {
    router.push(`/lobby/${gameId}`)
  }

  const newGame = () => {
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('new-game', { gameId })
    }
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lade Spiel...</p>
        </div>
      </div>
    )
  }

  const isSetupPhase = gameState.status === 'setup'
  const isGameFinished = gameState.status === 'finished'
  const hasSecretNumber = !!currentPlayer.secretNumber
  const hasAssignedNumber = !!currentPlayer.assignedNumber
  const allSecretsSet = gameState.players.every(p => p.secretNumber)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Target className="inline h-8 w-8 mr-2" />
            Bulls & Cows
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {gameState.players.length} Spieler
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {numberLength} Ziffern
            </span>
            {gameState.status === 'finished' && gameState.winner && (
              <span className="flex items-center text-yellow-600 font-semibold">
                <Trophy className="h-4 w-4 mr-1" />
                Gewinner: {gameState.players.find(p => p.id === gameState.winner)?.name}
              </span>
            )}
          </div>
        </div>

        {isSetupPhase && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Geheime Zahlen Setup</CardTitle>
              <CardDescription>
                Jeder Spieler muss eine geheime Zahl eingeben, die andere Spieler erraten werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasSecretNumber ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={`Deine geheime ${numberLength}-stellige Zahl`}
                      value={secretNumber}
                      onChange={(e) => setSecretNumber(e.target.value)}
                      maxLength={numberLength}
                      type={showSecret ? "text" : "password"}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button onClick={submitSecretNumber}>
                    Zahl festlegen
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800">✓ Deine geheime Zahl wurde festgelegt</p>
                  <p className="text-sm text-green-600 mt-1">
                    Warten auf andere Spieler... ({gameState.players.filter(p => p.secretNumber).length}/{gameState.players.length})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {gameState.status === 'playing' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dein Rateversuch</CardTitle>
                <CardDescription>
                  Rate die Zahl von: {gameState.players.find(p => p.id === currentPlayer.assignedBy)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`${numberLength}-stellige Zahl`}
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      maxLength={numberLength}
                      disabled={currentPlayer.hasWon || isGameFinished}
                    />
                    <Button 
                      onClick={makeGuess}
                      disabled={currentPlayer.hasWon || isGameFinished}
                    >
                      Raten
                    </Button>
                  </div>
                  
                  {currentPlayer.hasWon && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-semibold">🎉 Du hast gewonnen!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deine Versuche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {currentPlayer.guesses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Noch keine Versuche</p>
                  ) : (
                    currentPlayer.guesses.map((guess, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-mono text-lg">{guess.number}</span>
                        <div className="flex gap-4">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            {guess.bulls} Bulls
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                            {guess.cows} Cows
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Spieler Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.players.map((player) => (
                <div key={player.id} className={`p-4 rounded-lg border ${
                  player.id === currentPlayer.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{player.name}</span>
                    {player.hasWon && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Versuche: {player.guesses.length}</p>
                    {isSetupPhase && (
                      <p>Geheime Zahl: {player.secretNumber ? '✓' : '⏳'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={goBackToLobby}>
            Zurück zur Lobby
          </Button>
          
          {isGameFinished && (
            <Button onClick={newGame}>
              Neues Spiel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}