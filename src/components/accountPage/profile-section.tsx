"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ProfileSection() {
  const [name, setName] = useState("Leonardo Klaser")

  const handleSave = () => {
    console.log("Saving profile:", { name })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative group">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Leonardo Klaser" />
              <AvatarFallback className="text-2xl">LK</AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
              Alterar foto
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máx 2MB.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value="leonardo@exemplo.com" disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado. Entre em contato com o suporte se necessário.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  )
}
