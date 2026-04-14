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
import { useCreateCurriculum, useUpdateCurriculum } from '@/hooks/useCurriculum'
import { useButtonState } from '@/hooks/useButtonState'
import { toast } from 'sonner'

interface CurriculumFormProps {
  curriculum?: Curriculum
  isEditing: boolean
  initialData?: Omit<Curriculum, 'id'>
  onSaveSuccess?: () => void
}

function normalizeDescription(desc: string | string[] | undefined): string[] {
  if (!desc) return ['']
  if (typeof desc === 'string') return desc ? [desc] : ['']
  return desc.length > 0 ? desc : ['']
}

function normalizeEducation(edu: Education & { year?: string }): Education {
  if (edu.startDate || edu.endDate) return edu
  if (edu.year) {
    const parts = edu.year.split(' - ')
    return {
      ...edu,
      startDate: parts[0]?.trim() || '',
      endDate: parts[1]?.trim() || ''
    }
  }
  return { ...edu, startDate: '', endDate: '' }
}

function createEmptyFormData(): Omit<Curriculum, 'id'> {
  return {
    title: '',
    summary: '',
    skills: '',
    languages: '',
    experiences: [{ id: crypto.randomUUID(), company: '', title: '', startDate: '', endDate: '', description: [''] }],
    educations: [{ id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '' }]
  }
}

const SUMMARY_MAX_LENGTH = 1200

export function CurriculumForm({ curriculum, isEditing, initialData, onSaveSuccess }: CurriculumFormProps) {
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
  const { mutate: createCurriculum } = useCreateCurriculum()

  useEffect(() => {
    if (curriculum) {
      setFormData({
        title: curriculum.title,
        summary: curriculum.summary,
        skills: curriculum.skills,
        languages: curriculum.languages,
        experiences: curriculum.experiences.map((e) => ({
          ...e,
          id: e.id || crypto.randomUUID(),
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          description: normalizeDescription(e.description)
        })),
        educations: curriculum.educations.map((e) => ({
          ...normalizeEducation(e),
          id: e.id || crypto.randomUUID()
        }))
      })
    } else if (initialData) {
      setFormData({
        title: initialData.title || '',
        summary: initialData.summary || '',
        skills: initialData.skills || '',
        languages: initialData.languages || '',
        experiences: initialData.experiences?.length
          ? initialData.experiences.map((e) => ({
              ...e,
              id: crypto.randomUUID(),
              startDate: e.startDate || '',
              endDate: e.endDate || '',
              description: normalizeDescription(e.description)
            }))
          : [{ id: crypto.randomUUID(), company: '', title: '', startDate: '', endDate: '', description: [''] }],
        educations: initialData.educations?.length
          ? initialData.educations.map((e) => ({
              ...normalizeEducation(e),
              id: crypto.randomUUID()
            }))
          : [{ id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '' }]
      })
    } else {
      setFormData(createEmptyFormData())
    }
  }, [curriculum, initialData])

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
              onSaveSuccess?.()
            },
            onError: () => {
              setBtnError()
              toast.error(t('form.saveError'))
            }
          }
        )
      } else {
        createCurriculum(formData, {
          onSuccess: () => {
            setBtnSuccess()
            toast.success(t('form.createSuccess'))
            onSaveSuccess?.()
          },
          onError: () => {
            setBtnError()
            toast.error(t('form.saveError'))
          }
        })
        return
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
        { id: crypto.randomUUID(), company: '', title: '', startDate: '', endDate: '', description: [''] }
      ]
    })
  }

  const removeExperience = (id: string | undefined) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((exp) => exp.id !== id)
    })
  }

  const updateExperience = (id: string | undefined, field: keyof Omit<Experience, 'description'>, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    })
  }

  const updateBulletPoint = (expId: string | undefined, index: number, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) => {
        if (exp.id !== expId) return exp
        const newDesc = [...exp.description]
        newDesc[index] = value
        return { ...exp, description: newDesc }
      })
    })
  }

  const addBulletPoint = (expId: string | undefined) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === expId ? { ...exp, description: [...exp.description, ''] } : exp
      )
    })
  }

  const removeBulletPoint = (expId: string | undefined, index: number) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) => {
        if (exp.id !== expId || exp.description.length <= 1) return exp
        return { ...exp, description: exp.description.filter((_, i) => i !== index) }
      })
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [
        ...formData.educations,
        { id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '' }
      ]
    })
  }

  const removeEducation = (id: string | undefined) => {
    setFormData({
      ...formData,
      educations: formData.educations.filter((edu) => edu.id !== id)
    })
  }

  const updateEducation = (id: string | undefined, field: keyof Education, value: string) => {
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

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    field: 'skills' | 'languages',
    setInput: (val: string) => void,
    currentInput: string
  ) => {
    const pasted = e.clipboardData.getData('text')
    if (!pasted.includes(',')) return

    e.preventDefault()
    const raw = currentInput.trim() ? currentInput.trim() + pasted : pasted
    const newItems = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const existing = formData[field]
      ? formData[field]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const existingLower = new Set(existing.map((s) => s.toLowerCase()))
    const unique = newItems.filter((item) => !existingLower.has(item.toLowerCase()))

    if (unique.length === 0) return

    const merged = [...existing, ...unique].join(', ')
    setFormData({ ...formData, [field]: merged })
    setInput('')
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
            maxLength={SUMMARY_MAX_LENGTH}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
          <p className={`text-xs text-right ${formData.summary.length > 1100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {t('form.summaryCounter', { count: formData.summary.length, max: SUMMARY_MAX_LENGTH })}
          </p>
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
            onPaste={(e) => handlePaste(e, 'skills', setSkillInput, skillInput)}
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
            onPaste={(e) => handlePaste(e, 'languages', setLanguageInput, languageInput)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`exp-startDate-${experience.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.experience.startDateLabel')}
                      </Label>
                      <Input
                        id={`exp-startDate-${experience.id}`}
                        placeholder={t('form.experience.startDatePlaceholder')}
                        value={experience.startDate}
                        onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`exp-endDate-${experience.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.experience.endDateLabel')}
                      </Label>
                      <Input
                        id={`exp-endDate-${experience.id}`}
                        placeholder={t('form.experience.endDatePlaceholder')}
                        value={experience.endDate}
                        onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      {t('form.experience.descriptionLabel')}
                    </Label>
                    <div className="space-y-2">
                      {experience.description.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2 items-start">
                          <span className="text-muted-foreground text-xs mt-2.5 select-none">&#8226;</span>
                          <Input
                            placeholder={t('form.experience.bulletPlaceholder')}
                            value={bullet}
                            onChange={(e) => updateBulletPoint(experience.id, bulletIndex, e.target.value)}
                            className="flex-1"
                          />
                          {experience.description.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => removeBulletPoint(experience.id, bulletIndex)}
                              aria-label={t('form.experience.removeBullet')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => addBulletPoint(experience.id)}
                    >
                      <PlusCircle className="mr-1 h-3 w-3" />
                      {t('form.experience.addBullet')}
                    </Button>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`edu-startDate-${education.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.education.startDateLabel')}
                      </Label>
                      <Input
                        id={`edu-startDate-${education.id}`}
                        placeholder={t('form.education.startDatePlaceholder')}
                        value={education.startDate}
                        onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`edu-endDate-${education.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        {t('form.education.endDateLabel')}
                      </Label>
                      <Input
                        id={`edu-endDate-${education.id}`}
                        placeholder={t('form.education.endDatePlaceholder')}
                        value={education.endDate}
                        onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
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
