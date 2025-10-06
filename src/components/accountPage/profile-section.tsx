"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { User } from "@/models/user"

export function ProfileSection(user : User | undefined) {
  const [name, setName] = useState("")

  const handleSave = () => {
    console.log("Saving profile:", { name })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={user?.user_name} onChange={(e) => setName(e.target.value)} placeholder={user?.user_name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={user?.email} disabled className="bg-muted" />
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
