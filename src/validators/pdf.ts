import { z } from 'zod'

export const pdfUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.type === 'application/pdf', {
      message: 'Apenas arquivos PDF são aceitos'
    })
    .refine((f) => f.size <= 5 * 1024 * 1024, {
      message: 'Arquivo excede o tamanho máximo de 5MB'
    })
})

export type PdfUploadInput = z.infer<typeof pdfUploadSchema>
