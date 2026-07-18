export interface PixPaymentResult {
  // Identificador opaco do checkout novo. Opcional para snapshots/respostas
  // legados, que continuam consultando o status pelo e-mail.
  checkout_id?: string
  // PIX EMV string ("copia e cola"). Plain text — no encoding to apply.
  qr_code: string
  // URL HTTPS ou `data:image/png;base64,...` retornada pelo provedor atual.
  // Ambas são cobertas por nginx.conf's `img-src 'self' data: https:`. Se o
  // backend ever switches to a different scheme, update CSP first.
  qr_code_url: string
  expires_at: string
}
