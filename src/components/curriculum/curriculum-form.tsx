"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, Loader2 } from "lucide-react"
import type { Curriculum, Experience, Education } from "@/models/curriculum"
import { curriculoService } from "@/services/curriculumService"

interface CurriculumFormProps {
  curriculum?: Curriculum
  isEditing: boolean
}

const emptyFormData: Omit<Curriculum, "id"> = {
  title: "",
  is_active: false,
  summary: "",
  skills: "",
  languages: "",
  experiences: [{ id: crypto.randomUUID(), company: "", title: "", description: "" }],
  educations: [{ id: crypto.randomUUID(), institution: "", degree: "", year: "" }],
}

export function CurriculumForm({ curriculum, isEditing }: CurriculumFormProps) {
  const [formData, setFormData] = useState(emptyFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [languageInput, setLanguageInput] = useState("")

  useEffect(() => {
    if (curriculum) {
      setFormData({
        title: curriculum.title,
        is_active: false,
        summary: curriculum.summary,
        skills: curriculum.skills,
        languages: curriculum.languages,
        experiences: curriculum.experiences,
        educations: curriculum.educations,
      })
    } else {
      setFormData(emptyFormData)
    }
  }, [curriculum])

  const handleSave = async () => {
    setIsSaving(true)
    await curriculoService.newCurriculum(formData)
    setIsSaving(false)
    console.log("Saving curriculum:", formData)
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, { id: crypto.randomUUID(), company: "", title: "", description: "" }],
    })
  }

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((exp) => exp.id !== id),
    })
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [...formData.educations, { id: crypto.randomUUID(), institution: "", degree: "", year: "" }],
    })
  }

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      educations: formData.educations.filter((edu) => edu.id !== id),
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData({
      ...formData,
      educations: formData.educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault()
      const newSkills = formData.skills ? `${formData.skills}, ${skillInput.trim()}` : skillInput.trim()
      setFormData({ ...formData, skills: newSkills })
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== skillToRemove)
    setFormData({ ...formData, skills: skillsArray.join(", ") })
  }

  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && languageInput.trim()) {
      e.preventDefault()
      const newLanguages = formData.languages ? `${formData.languages}, ${languageInput.trim()}` : languageInput.trim()
      setFormData({ ...formData, languages: newLanguages })
      setLanguageInput("")
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    const languagesArray = formData.languages
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l !== languageToRemove)
    setFormData({ ...formData, languages: languagesArray.join(", ") })
  }

  const skillsArray = formData.skills
    ? formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  const languagesArray = formData.languages
    ? formData.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditing ? `Editando: ${curriculum?.title}` : "Criar Novo Currículo"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome do Currículo */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Currículo</Label>
          <Input
            id="name"
            placeholder="Ex: Currículo para Vaga Front-end"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Resumo Profissional */}
        <div className="space-y-2">
          <Label htmlFor="summary">Resumo Profissional</Label>
          <Textarea
            id="summary"
            placeholder="Descreva sua experiência e objetivos profissionais..."
            className="min-h-[120px] resize-y"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        {/* Habilidades */}
        <div className="space-y-2">
          <Label htmlFor="skills">Habilidades</Label>
          <Input
            id="skills"
            placeholder="Digite uma habilidade e pressione Enter ou vírgula"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
          {skillsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skillsArray.map((skill, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Idiomas */}
        <div className="space-y-2">
          <Label htmlFor="languages">Idiomas</Label>
          <Input
            id="languages"
            placeholder="Digite um idioma e pressione Enter ou vírgula"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyDown={handleLanguageKeyDown}
          />
          {languagesArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {languagesArray.map((language, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeLanguage(language)}
                >
                  {language}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Experiências Profissionais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Experiências Profissionais</Label>
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Experiência
            </Button>
          </div>

          {formData.experiences.map((experience, index) => (
            <Card key={experience.id} className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-muted-foreground">Experiência {index + 1}</h4>
                  {formData.experiences.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(experience.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`company-${experience.id}`}>Empresa</Label>
                  <Input
                    id={`company-${experience.id}`}
                    placeholder="Nome da empresa"
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`title-${experience.id}`}>Cargo</Label>
                  <Input
                    id={`title-${experience.id}`}
                    placeholder="Seu cargo"
                    value={experience.title}
                    onChange={(e) => updateExperience(experience.id, "title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${experience.id}`}>Descrição</Label>
                  <Textarea
                    id={`description-${experience.id}`}
                    placeholder="Descreva suas responsabilidades e conquistas..."
                    className="min-h-[100px] resize-y"
                    value={experience.description}
                    onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formação Acadêmica */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Formação Acadêmica</Label>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Formação
            </Button>
          </div>

          {formData.educations.map((education, index) => (
            <Card key={education.id} className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-muted-foreground">Formação {index + 1}</h4>
                  {formData.educations.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(education.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`institution-${education.id}`}>Instituição</Label>
                  <Input
                    id={`institution-${education.id}`}
                    placeholder="Nome da instituição"
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, "institution", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`degree-${education.id}`}>Curso/Grau</Label>
                  <Input
                    id={`degree-${education.id}`}
                    placeholder="Ex: Bacharelado em Ciência da Computação"
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, "degree", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`year-${education.id}`}>Ano de Conclusão</Label>
                  <Input
                    id={`year-${education.id}`}
                    placeholder="Ex: 2020"
                    value={education.year}
                    onChange={(e) => updateEducation(education.id, "year", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving || !formData.title} className="w-full" size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Currículo"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
