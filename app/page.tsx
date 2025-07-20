"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { socketManager } from '@/lib/socket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Play, Target } from 'lucide-react'

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const router = useRouter()

  const createLobby = () => {
    if (!playerName.trim()) {
      alert('Bitte gib deinen Namen ein')
      return
    }
    
    const socket = socketManager.connect()
    
    socket.on('lobby-created', (data: { lobbyId: string }) => {
      router.push(`/lobby/${data.lobbyId}`)
    })
    
    socket.on('error', (error: { message: string }) => {
      alert(error.message)
    })
    
    socket.emit('create-lobby', { playerName })
  }

  const joinLobby = () => {
    if (!playerName.trim() || !lobbyCode.trim()) {
      alert('Bitte gib deinen Namen und den Lobby-Code ein')
      return
    }
    
    const socket = socketManager.connect()
    
    socket.on('lobby-joined', (data: { lobbyId: string }) => {
      router.push(`/lobby/${data.lobbyId}`)
    })
    
    socket.on('error', (error: { message: string }) => {
      alert(error.message)
    })
    
    socket.emit('join-lobby', { 
      lobbyCode: lobbyCode.toUpperCase(), 
      playerName 
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Target className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Bulls & Cows</h1>
          </div>
          <p className="text-xl text-gray-600">
            Multiplayer Zahlenrätsel-Spiel
          </p>
          <p className="text-gray-500 mt-2">
            Rate die geheime Zahl deiner Mitspieler und finde Bulls (richtige Ziffer an richtiger Stelle) und Cows (richtige Ziffer an falscher Stelle)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Neue Lobby erstellen
              </CardTitle>
              <CardDescription>
                Erstelle eine neue Lobby und lade deine Freunde ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Dein Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Button onClick={createLobby} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Lobby erstellen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-green-600" />
                Lobby beitreten
              </CardTitle>
              <CardDescription>
                Tritt einer bestehenden Lobby mit dem Code bei
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Dein Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Input
                placeholder="6-stelliger Lobby-Code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button onClick={joinLobby} className="w-full" variant="outline">
                Lobby beitreten
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wie funktioniert Bulls & Cows?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Geheime Zahl</h3>
                <p className="text-sm text-gray-600">
                  Jeder Spieler gibt eine geheime Zahl mit eindeutigen Ziffern an einen anderen Spieler
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Raten</h3>
                <p className="text-sm text-gray-600">
                  Alle Spieler raten gleichzeitig die ihnen zugewiesene Zahl
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Bulls & Cows</h3>
                <p className="text-sm text-gray-600">
                  <strong>Bulls:</strong> Richtige Ziffer an richtiger Stelle<br />
                  <strong>Cows:</strong> Richtige Ziffer an falscher Stelle
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}