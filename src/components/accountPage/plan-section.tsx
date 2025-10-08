import { Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { User } from "@/models/user"

export function PlanSection({user}: { user: User | undefined}) {
  const currentUsage = 2
  const maxUsage = user?.plan?.max_sites ?? 0
  const usagePercentage = (currentUsage / maxUsage) * 100

  const benefits = user?.plan?.features ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Meu Plano Atual</CardTitle>
          <Badge className="bg-primary text-primary-foreground">{user?.plan?.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Plano {user?.plan?.name}</h3>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">URLs monitoradas</span>
            <span className="font-medium text-foreground">
              {currentUsage} de {maxUsage}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="w-full sm:w-auto bg-transparent">
          Gerenciar Assinatura
        </Button>
        <Button className="w-full sm:w-auto">Fazer Upgrade</Button>
      </CardFooter>
    </Card>
  )
}
