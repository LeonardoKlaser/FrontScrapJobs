import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PATHS } from '@/router/paths'

export default function PrivacyPolicy() {
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
          Política de Privacidade
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: Fevereiro de 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Informações que Coletamos
            </h2>
            <p>Coletamos as seguintes informações quando você utiliza o ScrapJobs:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Dados de cadastro: nome, e-mail, CPF e telefone</li>
              <li>Dados de currículo: experiências, formação, habilidades e idiomas</li>
              <li>Preferências de busca: empresas monitoradas e palavras-chave</li>
              <li>Dados de uso: interações com o serviço e análises realizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Como Utilizamos suas Informações
            </h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fornecer e manter nosso serviço</li>
              <li>Enviar notificações de vagas compatíveis</li>
              <li>Realizar análises de compatibilidade com inteligência artificial</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Melhorar e personalizar a experiência do usuário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Compartilhamento de Dados
            </h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins
              de marketing. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provedores de serviço que auxiliam na operação da plataforma</li>
              <li>Processadores de pagamento para conclusão de transações</li>
              <li>Autoridades legais quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Armazenamento e Segurança
            </h2>
            <p>
              Seus dados são armazenados em servidores seguros com criptografia em trânsito e em
              repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações
              contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou inexatos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar o consentimento para uso dos dados</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Ser informado sobre compartilhamento de dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para autenticação e manutenção da sessão do usuário. Não
              utilizamos cookies de rastreamento ou publicidade de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Retenção de Dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, os
              dados são mantidos por 30 dias para fins de recuperação e então permanentemente
              removidos de nossos sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Alterações nesta Política
            </h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre alterações
              significativas por e-mail ou por aviso no serviço. A data da última atualização será
              sempre indicada no topo desta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em
              contato: <span className="text-foreground">privacidade@scrapjobs.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
