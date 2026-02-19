'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function NotificationsSection() {
  const [notifications, setNotifications] = useState({
    emailVagas: true,
    resumoSemanal: false,
    alertasSeguranca: true
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="email-vagas" className="text-base cursor-pointer">
              Novas vagas encontradas por e-mail
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações quando novas vagas forem encontradas
            </p>
          </div>
          <Switch
            id="email-vagas"
            checked={notifications.emailVagas}
            onCheckedChange={() => handleToggle('emailVagas')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="resumo-semanal" className="text-base cursor-pointer">
              Resumo semanal de atividades
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba um resumo das suas atividades toda semana
            </p>
          </div>
          <Switch
            id="resumo-semanal"
            checked={notifications.resumoSemanal}
            onCheckedChange={() => handleToggle('resumoSemanal')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="alertas-seguranca" className="text-base cursor-pointer">
              Alertas de segurança da conta
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba alertas sobre atividades suspeitas na sua conta
            </p>
          </div>
          <Switch
            id="alertas-seguranca"
            checked={notifications.alertasSeguranca}
            onCheckedChange={() => handleToggle('alertasSeguranca')}
          />
        </div>
      </CardContent>
    </Card>
  )
}
