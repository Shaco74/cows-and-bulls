"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { socketManager } from '@/lib/socket'
import { Lobby, Player } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Settings, Play, Copy, Check } from 'lucide-react'

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const lobbyId = params?.lobbyId as string
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const socket = socketManager.connect()
    
    socket.on('lobby-updated', (updatedLobby: Lobby) => {
      setLobby(updatedLobby)
      const player = updatedLobby.players.find(p => p.socketId === socket.id)
      setCurrentPlayer(player || null)
    })

    socket.on('lobby-joined', (data: { lobbyId: string; lobby: Lobby }) => {
      setLobby(data.lobby)
      const player = data.lobby.players.find(p => p.socketId === socket.id)
      setCurrentPlayer(player || null)
    })

    socket.on('game-started', (data: { gameState: any }) => {
      router.push(`/game/${lobbyId}`)
    })

    socket.on('error', (error: { message: string }) => {
      alert(error.message)
      router.push('/')
    })

    return () => {
      socket.off('lobby-updated')
      socket.off('lobby-joined')
      socket.off('game-started')
      socket.off('error')
    }
  }, [lobbyId, router])

  const leaveLobby = () => {
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('leave-lobby', { lobbyId })
    }
    router.push('/')
  }

  const toggleReady = () => {
    const socket = socketManager.getSocket()
    if (socket && currentPlayer) {
      socket.emit('player-ready', { 
        lobbyId, 
        ready: !currentPlayer.isReady 
      })
    }
  }

  const updateNumberLength = (length: number) => {
    const socket = socketManager.getSocket()
    if (socket && currentPlayer?.isHost) {
      socket.emit('update-settings', { 
        lobbyId, 
        settings: { numberLength: length } 
      })
    }
  }

  const copyLobbyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobbyId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy lobby code')
    }
  }

  if (!lobby || !currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lade Lobby...</p>
        </div>
      </div>
    )
  }

  const canStartGame = lobby.players.length >= 2 && lobby.players.every(p => p.isReady)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lobby: {lobbyId}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-600">Lobby-Code teilen:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyLobbyCode}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {lobbyId}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Spieler ({lobby.players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lobby.players.map((player) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.id === currentPlayer.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{player.name}</span>
                      {player.isHost && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Host
                        </span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      player.isReady 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {player.isReady ? 'Bereit' : 'Nicht bereit'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Spiel-Einstellungen
              </CardTitle>
              <CardDescription>
                {currentPlayer.isHost 
                  ? 'Du kannst die Einstellungen anpassen' 
                  : 'Nur der Host kann Einstellungen ändern'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anzahl Ziffern
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6].map((length) => (
                      <Button
                        key={length}
                        variant={lobby.settings.numberLength === length ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateNumberLength(length)}
                        disabled={!currentPlayer.isHost}
                      >
                        {length}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={leaveLobby}>
            Lobby verlassen
          </Button>
          
          <Button 
            onClick={toggleReady}
            variant={currentPlayer.isReady ? "outline" : "default"}
          >
            {currentPlayer.isReady ? 'Nicht mehr bereit' : 'Bereit'}
          </Button>
          
          {currentPlayer.isHost && (
            <Button 
              onClick={() => {
                if (canStartGame) {
                  // Game will start automatically when all players are ready
                } else {
                  alert('Alle Spieler müssen bereit sein um zu starten (mindestens 2 Spieler)')
                }
              }}
              disabled={!canStartGame}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {canStartGame ? 'Spiel startet automatisch' : 'Warten auf Spieler'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}