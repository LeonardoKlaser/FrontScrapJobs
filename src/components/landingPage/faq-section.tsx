import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

export function FaqSection() {
  const faqs = [
    {
      question: 'Meus dados de currículo estão seguros?',
      answer:
        'Sim, usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados nunca são compartilhados com terceiros e você tem controle total sobre suas informações.'
    },
    {
      question: 'Como funciona a análise de IA?',
      answer:
        'Nossa IA compara as palavras-chave e requisitos da vaga com as habilidades e experiências do seu currículo, gerando um score de compatibilidade e sugestões personalizadas para melhorar suas chances.'
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer:
        'Sim, você pode cancelar sua assinatura a qualquer momento, sem complicações. Não há taxas de cancelamento ou períodos de carência.'
    },
    {
      question: 'Quantas empresas posso monitorar?',
      answer:
        'Depende do seu plano! O plano Beta Tester permite até 3 sites, o Profissional até 15 e o Premium até 50 sites.'
    }
  ]

  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Pronto para Acelerar sua Carreira?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Deixe a busca de emprego manual no passado. Concentre sua energia no que realmente
              importa: preparar-se para as entrevistas e conseguir o emprego dos seus sonhos.
            </p>
            <a href="#pricing">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium"
              >
                Iniciar Meu Teste Gratuito
              </Button>
            </a>
          </div>

          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
