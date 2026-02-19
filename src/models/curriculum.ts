export interface Experience {
  id: string
  company: string
  title: string
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  year: string
}

export interface Curriculum {
  id: number
  title: string
  is_active: boolean
  summary: string
  skills: string
  languages: string
  experiences: Experience[]
  educations: Education[]
}
