import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PATHS } from '@/router/paths'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to={PATHS.landing}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
          Termos de Uso
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: Fevereiro de 2026
        </p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o ScrapJobs, você concorda com estes Termos de Uso. Se você não
              concordar com qualquer parte destes termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Descrição do Serviço</h2>
            <p>
              O ScrapJobs é uma plataforma de monitoramento de vagas de emprego que coleta
              informações públicas de páginas de carreiras de empresas e utiliza inteligência
              artificial para analisar a compatibilidade entre o currículo do usuário e as vagas
              encontradas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o serviço, você deve criar uma conta fornecendo informações verídicas e
              atualizadas. Você é responsável por manter a confidencialidade de sua senha e por
              todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Planos e Pagamentos</h2>
            <p>
              O ScrapJobs oferece planos de assinatura com diferentes níveis de funcionalidade. Os
              pagamentos são processados por meio de parceiros autorizados. A assinatura é válida
              pelo período contratado e não há reembolso para períodos já pagos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Uso Aceitável</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Utilizar o serviço para fins ilegais ou não autorizados</li>
              <li>Tentar acessar áreas restritas do sistema sem autorização</li>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Utilizar bots ou scripts automatizados para acessar o serviço</li>
              <li>Reproduzir, duplicar ou revender o serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Propriedade Intelectual
            </h2>
            <p>
              Todo o conteúdo do ScrapJobs, incluindo textos, gráficos, logotipos, ícones e
              software, é de propriedade do ScrapJobs ou de seus licenciadores e é protegido pelas
              leis de propriedade intelectual aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Limitação de Responsabilidade
            </h2>
            <p>
              O ScrapJobs não garante a precisão, completude ou atualidade das informações de vagas
              coletadas. As análises de IA são fornecidas como referência e não constituem
              aconselhamento profissional. O uso das informações é de responsabilidade exclusiva do
              usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cancelamento</h2>
            <p>
              Você pode excluir sua conta a qualquer momento pela página de configurações. Após a
              exclusão, seus dados serão mantidos por 30 dias para fins de recuperação e
              posteriormente removidos conforme nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Alterações nos Termos
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações
              entram em vigor imediatamente após a publicação. O uso continuado do serviço após
              alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato pelo email:{' '}
              <span className="text-foreground">contato@scrapjobs.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
