import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUploadCurriculumFile } from '@/hooks/useCurriculumFiles'
import { curriculumFileErrorKey } from '@/lib/curriculumFileErrorKey'

interface UploadCurriculumButtonProps {
  fileCount: number
}

export const MAX_CURRICULUM_FILES = 5
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function UploadCurriculumButton({ fileCount }: UploadCurriculumButtonProps) {
  const { t } = useTranslation('curriculum')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: upload, isPending } = useUploadCurriculumFile()
  const limitReached = fileCount >= MAX_CURRICULUM_FILES

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(t('errors.too_large'))
      return
    }

    upload(file, {
      onSuccess: () => toast.success(t('upload.success')),
      onError: (error) => toast.error(t(curriculumFileErrorKey(error)))
    })
  }

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => fileInputRef.current?.click()}
      disabled={limitReached || isPending}
      aria-label={t('upload.button')}
      className="gap-2"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {isPending ? t('upload.uploading') : t('upload.button')}
      </span>
    </Button>
  )

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      {limitReached ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          <TooltipContent>{t('errors.limit_reached')}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </>
  )
}
