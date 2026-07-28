// CurriculumFile representa um PDF de currículo armazenado no object storage
// (R2). Substituiu o antigo modelo estruturado `Curriculum` (editor de campos
// + templates), removido na Task 16 junto com o fluxo de extração/geração.
export interface CurriculumFile {
  id: number
  filename: string
  size_bytes: number
  is_principal: boolean
  created_at: string
}
