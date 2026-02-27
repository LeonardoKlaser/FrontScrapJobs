import type React from 'react'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/common/section-header'
import {
  PlusCircle,
  Trash2,
  Loader2,
  Briefcase,
  GraduationCap,
  Save,
  X,
  CheckCircle
} from 'lucide-react'
import type { Curriculum, Experience, Education } from '@/models/curriculum'
import { curriculumService } from '@/services/curriculumService'
import { useUpdateCurriculum } from '@/hooks/useCurriculum'
import { useQueryClient } from '@tanstack/react-query'
import { useButtonState } from '@/hooks/useButtonState'
import { toast } from 'sonner'

interface CurriculumFormProps {
  curriculum?: Curriculum
  isEditing: boolean
}

function createEmptyFormData(): Omit<Curriculum, 'id'> {
  return {
    title: '',
    is_active: false,
    summary: '',
    skills: '',
    languages: '',
    experiences: [{ id: crypto.randomUUID(), company: '', title: '', description: '' }],
    educations: [{ id: crypto.randomUUID(), institution: '', degree: '', year: '' }]
  }
}

export function CurriculumForm({ curriculum, isEditing }: CurriculumFormProps) {
  const { t } = useTranslation('curriculum')
  const [formData, setFormData] = useState(createEmptyFormData)
  const {
    buttonState,
    setLoading: setBtnLoading,
    setSuccess: setBtnSuccess,
    setError: setBtnError,
    isDisabled: isBtnDisabled
  } = useButtonState()
  const [skillInput, setSkillInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')
  const { mutate: updateCurriculum, isPending: isUpdating } = useUpdateCurriculum()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (curriculum) {
      setFormData({
        title: curriculum.title,
        is_active: false,
        summary: curriculum.summary,
        skills: curriculum.skills,
        languages: curriculum.languages,
        experiences: curriculum.experiences,
        educations: curriculum.educations
      })
    } else {
      setFormData(createEmptyFormData())
    }
  }, [curriculum])

  const handleSave = async () => {
    setBtnLoading()
    try {
      if (isEditing && curriculum) {
        updateCurriculum(
          { ...formData, id: curriculum.id },
          {
            onSuccess: () => {
              setBtnSuccess()
              toast.success(t('form.saveSuccess'))
            },
            onError: () => {
              setBtnError()
              toast.error(t('form.saveError'))
            }
          }
        )
      } else {
        await curriculumService.newCurriculum(formData)
        queryClient.invalidateQueries({ queryKey: ['curriculumList'] })
        setBtnSuccess()
        toast.success(t('form.createSuccess'))
      }
    } catch {
      setBtnError()
      toast.error(t('form.saveError'))
    }
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...formData.experiences,
        { id: crypto.randomUUID(), company: '', title: '', description: '' }
      ]
    })
  }

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((exp) => exp.id !== id)
    })
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [
        ...formData.educations,
        { id: crypto.randomUUID(), institution: '', degree: '', year: '' }
      ]
    })
  }

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      educations: formData.educations.filter((edu) => edu.id !== id)
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData({
      ...formData,
      educations: formData.educations.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    })
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const newSkills = formData.skills
        ? `${formData.skills}, ${skillInput.trim()}`
        : skillInput.trim()
      setFormData({ ...formData, skills: newSkills })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== skillToRemove)
    setFormData({ ...formData, skills: skillsArray.join(', ') })
  }

  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && languageInput.trim()) {
      e.preventDefault()
      const newLanguages = formData.languages
        ? `${formData.languages}, ${languageInput.trim()}`
        : languageInput.trim()
      setFormData({ ...formData, languages: newLanguages })
      setLanguageInput('')
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    const languagesArray = formData.languages
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l !== languageToRemove)
    setFormData({ ...formData, languages: languagesArray.join(', ') })
  }

  const skillsArray = formData.skills
    ? formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  const languagesArray = formData.languages
    ? formData.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
    : []

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">
          {isEditing ? t('form.editing', { title: curriculum?.title }) : t('form.createNew')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Nome do Currículo */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-muted-foreground">
            {t('form.nameLabel')}
          </Label>
          <Input
            id="name"
            placeholder={t('form.namePlaceholder')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Resumo Profissional */}
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-muted-foreground">
            {t('form.summaryLabel')}
          </Label>
          <Textarea
            id="summary"
            placeholder={t('form.summaryPlaceholder')}
            className="min-h-[120px] resize-y"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        {/* Habilidades */}
        <div className="space-y-2">
          <Label htmlFor="skills" className="text-muted-foreground">
            {t('form.skillsLabel')}
          </Label>
          <Input
            id="skills"
            placeholder={t('form.skillsPlaceholder')}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
          {skillsArray.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skillsArray.map((skill) => (
                <Badge
                  key={skill}
                  variant="default"
                  className="cursor-pointer gap-1 pr-1.5 hover:bg-primary/20"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3 opacity-60" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Idiomas */}
        <div className="space-y-2">
          <Label htmlFor="languages" className="text-muted-foreground">
            {t('form.languagesLabel')}
          </Label>
          <Input
            id="languages"
            placeholder={t('form.languagesPlaceholder')}
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyDown={handleLanguageKeyDown}
          />
          {languagesArray.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {languagesArray.map((language) => (
                <Badge
                  key={language}
                  variant="default"
                  className="cursor-pointer gap-1 pr-1.5 hover:bg-primary/20"
                  onClick={() => removeLanguage(language)}
                >
                  {language}
                  <X className="h-3 w-3 opacity-60" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Experiências Profissionais */}
        <div className="space-y-4">
          <SectionHeader title={t('form.experience.title')} icon={Briefcase}>
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              {t('actions.add', { ns: 'common' })}
            </Button>
          </SectionHeader>

          <div className="space-y-3">
            {formData.experiences.map((experience, index) => (
              <Card key={experience.id} className="border-border/30 bg-muted/30">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('form.experience.label', { index: index + 1 })}
                    </span>
                    {formData.experiences.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeExperience(experience.id)}
                        aria-label={t('form.experience.remove')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`company-${experience.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.experience.companyLabel')}
                      </Label>
                      <Input
                        id={`company-${experience.id}`}
                        placeholder={t('form.experience.companyPlaceholder')}
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`title-${experience.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.experience.roleLabel')}
                      </Label>
                      <Input
                        id={`title-${experience.id}`}
                        placeholder={t('form.experience.rolePlaceholder')}
                        value={experience.title}
                        onChange={(e) => updateExperience(experience.id, 'title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`description-${experience.id}`}
                      className="text-muted-foreground text-xs"
                    >
                      {t('form.experience.descriptionLabel')}
                    </Label>
                    <Textarea
                      id={`description-${experience.id}`}
                      placeholder={t('form.experience.descriptionPlaceholder')}
                      className="min-h-[80px] resize-y"
                      value={experience.description}
                      onChange={(e) =>
                        updateExperience(experience.id, 'description', e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Formação Acadêmica */}
        <div className="space-y-4">
          <SectionHeader title={t('form.education.title')} icon={GraduationCap}>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              {t('actions.add', { ns: 'common' })}
            </Button>
          </SectionHeader>

          <div className="space-y-3">
            {formData.educations.map((education, index) => (
              <Card key={education.id} className="border-border/30 bg-muted/30">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('form.education.label', { index: index + 1 })}
                    </span>
                    {formData.educations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEducation(education.id)}
                        aria-label={t('form.education.remove')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`institution-${education.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.education.institutionLabel')}
                      </Label>
                      <Input
                        id={`institution-${education.id}`}
                        placeholder={t('form.education.institutionPlaceholder')}
                        value={education.institution}
                        onChange={(e) =>
                          updateEducation(education.id, 'institution', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`degree-${education.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.education.degreeLabel')}
                      </Label>
                      <Input
                        id={`degree-${education.id}`}
                        placeholder={t('form.education.degreePlaceholder')}
                        value={education.degree}
                        onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`year-${education.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.education.yearLabel')}
                      </Label>
                      <Input
                        id={`year-${education.id}`}
                        placeholder={t('form.education.yearPlaceholder')}
                        value={education.year}
                        onChange={(e) => updateEducation(education.id, 'year', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isUpdating || isBtnDisabled || !formData.title}
            variant={buttonState === 'success' ? 'outline' : 'glow'}
            className={`w-full ${buttonState === 'success' ? 'animate-success-flash border-primary/50 text-primary' : ''}`}
            size="lg"
          >
            {buttonState === 'loading' || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('actions.saving', { ns: 'common' })}
              </>
            ) : buttonState === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('actions.saved', { ns: 'common' })}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('form.saveButton')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
