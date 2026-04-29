/**
 * Persiste uma intencao de toast em sessionStorage pra ser exibida apos um
 * `window.location.href` reload. Usado pelo interceptor 401 de api.ts: o
 * pattern anterior (`toast.error(msg)` + `setTimeout(700ms)` + redirect)
 * destruia o Toaster antes do usuario ler — fade-in do sonner (~150ms) +
 * janela visivel real (~550ms) era suborbital pra mensagens medias.
 *
 * Uso:
 *   // no interceptor:
 *   setRedirectToast({ type: 'error', msg: 'Sessao expirou' })
 *   window.location.href = '/login?from=...'
 *
 *   // no componente alvo (e.g. Login.tsx) ao montar:
 *   const pending = consumeRedirectToast()
 *   if (pending) toast[pending.type](pending.msg)
 *
 * TTL: descarta intencoes mais velhas que MAX_AGE_MS pra evitar flash de
 * toast stale se user abrir /login dias depois de ter sido deslogado.
 */

const KEY = 'sj_redirect_toast'
const MAX_AGE_MS = 10_000

type ToastType = 'error' | 'success' | 'info' | 'warning'

interface Stored {
  type: ToastType
  msg: string
  ts: number
}

export function setRedirectToast(intent: { type: ToastType; msg: string }): void {
  try {
    const payload: Stored = { type: intent.type, msg: intent.msg, ts: Date.now() }
    sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // sessionStorage pode falhar em modo private/quota cheia — silencioso eh
    // aceitavel (toast eh nice-to-have, nao critical-path).
  }
}

export function consumeRedirectToast(): { type: ToastType; msg: string } | null {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(KEY)
    if (raw) sessionStorage.removeItem(KEY)
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Stored
    if (
      !parsed ||
      typeof parsed.msg !== 'string' ||
      typeof parsed.ts !== 'number' ||
      Date.now() - parsed.ts > MAX_AGE_MS
    ) {
      return null
    }
    return { type: parsed.type, msg: parsed.msg }
  } catch {
    return null
  }
}
