"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SecuritySection() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handlePasswordChange = () => {
    console.log("Changing password")
  }

  const handleEnable2FA = () => {
    console.log("Enabling 2FA")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input
              id="current-password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Confirme sua nova senha"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePasswordChange}>Atualizar Senha</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
            </div>
            <Badge variant="secondary">Desativado</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleEnable2FA}>Ativar 2FA</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
