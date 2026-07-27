export interface Experience {
  id?: string
  company: string
  title: string
  startDate: string
  endDate: string
  description: string[]
}

export interface Education {
  id?: string
  institution: string
  degree: string
  startDate: string
  endDate: string
}

export interface Curriculum {
  id: number
  title: string
  summary: string
  skills: string
  languages: string
  experiences: Experience[]
  educations: Education[]
}

// CurriculumFile representa um PDF de currículo armazenado no object storage
// (R2). Substitui o modelo estruturado `Curriculum` acima, que sera removido
// na Task 16 apos a migracao completa do fluxo de currículo pra PDFs.
export interface CurriculumFile {
  id: number
  filename: string
  size_bytes: number
  is_principal: boolean
  created_at: string
}
