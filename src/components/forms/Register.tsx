import { ArrowRightIcon, Loader2Icon } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function RegisterForm() {
  const loading = false

  return (
    <form className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm">
          Nome
        </label>
        <Input id="name" type="text" placeholder="seu nome completo" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cpf" className="text-sm">
          CPF
        </label>
        <Input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm">
          E-mail
        </label>
        <Input id="email" type="email" placeholder="seu@email.com" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">
          Senha
        </label>
        <Input id="password" type="password" placeholder="senha" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirm-password" className="text-sm">
          Confirmar senha
        </label>
        <Input id="confirm-password" type="password" placeholder="repita a senha" />
      </div>

      <Button disabled={loading}>
        {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : 'Cadastrar'}
        {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  )
}
