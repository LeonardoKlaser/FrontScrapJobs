import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>O que e o ScrapJobs?</AccordionTrigger>
        <AccordionContent>
          O ScrapJobs e uma plataforma que monitora paginas de carreiras, analisa vagas com
          inteligencia artificial e envia notificacoes quando encontra vagas compativeis com o seu
          curriculo.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Como funciona a analise de compatibilidade?</AccordionTrigger>
        <AccordionContent>
          Utilizamos o Google Gemini para comparar seu curriculo com a descricao da vaga. O
          resultado inclui uma pontuacao de compatibilidade, pontos fortes, lacunas e sugestoes de
          melhoria.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Posso monitorar qualquer site?</AccordionTrigger>
        <AccordionContent>
          Sim! Voce pode solicitar a adicao de qualquer pagina de carreiras. Nossa equipe configura
          o scraping e voce comeca a receber notificacoes automaticamente.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-96">
      <AccordionItem value="plano-1">
        <AccordionTrigger>Plano Iniciante</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Ate 3 sites monitorados</li>
            <li>10 analises de IA por mes</li>
            <li>Notificacoes por e-mail</li>
            <li>Gratuito</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="plano-2">
        <AccordionTrigger>Plano Profissional</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Ate 15 sites monitorados</li>
            <li>100 analises de IA por mes</li>
            <li>Notificacoes por e-mail</li>
            <li>R$29,90/mes</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="plano-3">
        <AccordionTrigger>Plano Premium</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Ate 50 sites monitorados</li>
            <li>Analises de IA ilimitadas</li>
            <li>Notificacoes por e-mail</li>
            <li>R$79,90/mes</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
