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
