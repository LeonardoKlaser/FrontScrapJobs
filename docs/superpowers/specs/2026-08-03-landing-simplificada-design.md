# Landing simplificada e alinhada ao produto — Design

- Data: 2026-08-03
- Status: aprovado em brainstorm
- Repositório: `FrontScrapJobs`

## 1. Objetivo

Simplificar a landing page do ScrapJobs e alinhar todas as promessas ao produto que existe hoje.
A página deve apresentar uma assinatura única com recursos integrados, usar o WhatsApp como porta
principal do funil e manter os preços na seção de planos, sem colocá-los no hero.

A proposta central passa a ser:

> Receba as vagas mais recentes no seu WhatsApp.

O público não fica restrito a tecnologia. A comunicação cobre diferentes áreas profissionais com
vagas disponíveis nas empresas monitoradas pelo ScrapJobs. Os chips do hero permanecem como
exemplos de áreas, pois têm reconhecimento positivo, sem representar uma lista exaustiva.

## 2. Princípios de conteúdo

1. Descrever somente entregas existentes e testáveis.
2. Apresentar Radar, seleção, alertas, análise e prompt como recursos da mesma assinatura.
3. Apresentar Norte e painel web como interfaces para usar o sistema, não como produtos vendidos
   separadamente.
4. Explicar que a consulta inicial pelo WhatsApp é gratuita e que o acesso às vagas e o
   monitoramento contínuo exigem assinatura.
5. Não usar “grátis” como CTA genérico nem sugerir trial.
6. Não prometer currículo reescrito, PDF otimizado, aprovação em ATS, prioridade absoluta ou
   resultado profissional garantido.
7. Usar “empresas monitoradas pelo ScrapJobs”, nunca “todas as empresas” sem esse qualificador.
8. Manter os preços fora do hero e visíveis na landing.

## 3. Verdade do produto

| Capacidade | Promessa permitida |
|---|---|
| Radar de vagas | Monitora páginas de carreira das empresas várias vezes ao dia. |
| Seleção personalizada | Filtra vagas usando área, senioridade, localização e empresas acompanhadas. |
| Alertas | Entrega oportunidades por WhatsApp ou email. |
| Painel | Organiza vagas, empresas monitoradas, currículos e configurações. |
| Currículos | Armazena PDFs e permite selecionar um arquivo principal. |
| Análise | Compara uma vaga com o currículo e mostra compatibilidade, pontos fortes, lacunas, palavras-chave e sugestões. |
| Prompt de otimização | Gera instruções para o usuário adaptar o currículo em ChatGPT, Claude, Gemini ou outra IA junto com o próprio PDF. |
| Norte | Pesquisa vagas, solicita análises, recebe PDF, atualiza preferências, sugere empresas, aciona busca e escala atendimento humano pelo WhatsApp. |

O ScrapJobs não reescreve o currículo nem gera um novo PDF. A landing, os exemplos de conversa,
os textos de planos e os metadados de SEO devem respeitar essa restrição.

## 4. Arquitetura da página

A página seguirá a direção visual “Jornada direta”, nesta ordem:

1. Navbar
2. Hero
3. Faixa de prova dinâmica
4. Como começar pelo WhatsApp
5. Recursos incluídos na assinatura
6. Planos
7. FAQ
8. CTA final
9. Footer

As atuais seções repetitivas de capacidades do Norte e multicanal deixam de existir isoladamente.
Seus conteúdos verdadeiros são incorporados à seção de recursos.

## 5. Navbar

Links em desktop:

- Como funciona
- O que está incluído
- Planos
- FAQ
- Entrar

O CTA usa “Receber vagas” e mantém o comportamento atual:

- mobile: abre o link do WhatsApp diretamente;
- desktop: abre o modal com QR code e alternativa para WhatsApp Web.

A navbar deve continuar compacta no mobile, preservando logo e CTA principal.

## 6. Hero

### Copy em português

- Overline: `Vagas direto das empresas`
- H1: `Receba as vagas mais recentes no seu WhatsApp.`
- Subtítulo: `O ScrapJobs monitora páginas de carreira, encontra oportunidades compatíveis com o seu perfil e envia as novidades diretamente para você.`
- Rótulo dos chips: `Vagas em áreas como`
- Chips: `Tecnologia`, `Marketing`, `Vendas`, `RH`, `Finanças`, `Design`, `Dados`
- CTA: `Receber vagas no WhatsApp`
- Microcopy: `Responda 3 perguntas e descubra quantas vagas encontramos para você.`
- Login: `Já é assinante? Entrar`

Os chips são exemplos. A página não deve afirmar suporte irrestrito a “qualquer área”, pois a
qualificação atual reconhece dez grupos: Desenvolvimento, Design, Dados, Produto, QA, DevOps,
Marketing, RH, Finanças e Comercial.

### Demonstração do WhatsApp

O mock do hero deve mostrar apenas uma entrega real:

1. Norte informa que encontrou vagas novas desde o último envio.
2. Norte resume quantidade e cargos ou áreas.
3. Usuário pede para ver.
4. Norte entrega o link do digest.

O mock não pode mostrar o Norte criando, reescrevendo ou enviando currículo otimizado.

No desktop, hero e conversa ficam em duas colunas. No mobile, a ordem é texto, CTA e conversa.

## 7. Faixa de prova

Manter logos e estatísticas vindos das APIs públicas existentes. Os números devem ser sempre
dinâmicos; nenhuma quantidade fica escrita estaticamente no componente.

Formato:

> `{empresas} empresas monitoradas · {vagas} vagas disponíveis`

Se apenas logos ou apenas estatísticas estiverem disponíveis, renderizar o conteúdo existente. Se
as duas APIs falharem, ocultar a faixa sem deixar espaço vazio.

## 8. Como começar pelo WhatsApp

- Overline: `Comece pelo WhatsApp`
- Título: `Descubra suas oportunidades em poucos minutos`
- Descrição: `A conversa inicial identifica o que você procura e mostra o volume de vagas antes de você escolher um plano.`

Três passos:

1. **Conte o que você procura** — informe área, nível de experiência e regiões de interesse.
2. **Veja o resultado** — o ScrapJobs consulta as vagas disponíveis e mostra quantas combinam
   com o perfil.
3. **Escolha seu plano** — assine para acessar as oportunidades encontradas e receber as próximas
   automaticamente.

Nota de transparência:

> A conversa e a consulta inicial são gratuitas. O acesso às vagas e o monitoramento contínuo
> fazem parte da assinatura.

## 9. Recursos incluídos

- Overline: `Uma assinatura, todo o sistema`
- Título: `Da descoberta à candidatura`
- Descrição: `Cada recurso resolve uma parte da busca por emprego. Juntos, eles reduzem o trabalho repetitivo e ajudam você a decidir onde vale a pena aplicar.`

A sequência visual é:

```text
Radar de vagas → Seleção personalizada → Alertas de vagas
               → Análise de compatibilidade → Prompt de otimização
```

### Cards da jornada

1. **Radar de vagas** — monitora páginas de carreira várias vezes ao dia.
2. **Seleção personalizada** — filtra vagas de acordo com perfil e preferências.
3. **Alertas de vagas** — entrega oportunidades pelo WhatsApp ou por email.
4. **Análise de compatibilidade** — compara vaga e currículo e aponta forças, lacunas e
   palavras-chave.
5. **Prompt de otimização** — gera instruções para adaptar o currículo no ChatGPT, Claude ou
   Gemini.

### Interfaces

- **Norte no WhatsApp** — pesquise vagas, peça análises, envie currículo e altere preferências
  conversando.
- **Painel ScrapJobs** — acompanhe vagas, empresas monitoradas, currículos e configurações.

Nota obrigatória do prompt:

> O prompt prepara instruções personalizadas para você usar junto com seu PDF em outra IA. O
> ScrapJobs não reescreve nem gera um novo currículo.

## 10. Planos

- Overline: `Planos`
- Título: `Escolha quanto você quer acompanhar`
- Descrição: `Ambos incluem alertas, painel, Norte, análise de compatibilidade e prompt de otimização.`

### Profissional — R$ 19,90/mês

Badge: `Melhor para começar`

- monitoramento de até 40 empresas;
- 20 análises de compatibilidade por mês;
- prompt de otimização após cada análise;
- alertas por WhatsApp e email;
- acesso ao painel ScrapJobs;
- CTA: `Assinar Profissional`.

### Ultra — R$ 29,90/mês

- monitoramento de todas as empresas disponíveis no ScrapJobs;
- 50 análises de compatibilidade por mês;
- prompt de otimização após cada análise;
- alertas por WhatsApp e email;
- suporte prioritário;
- CTA: `Assinar Ultra`.

Rodapé dos cards:

> Cobrança mensal · sem fidelidade · cancele quando quiser pelo painel

Os preços, nomes, limites e features continuam vindo da API. A copy fixa deve explicar as
diferenças sem substituir esses dados. Se a API de planos falhar, mostrar um estado de erro com
ação de tentar novamente; não renderizar uma seção aparentemente vazia.

Os CTAs dos planos mantêm o caminho direto de cadastro com `?plan=<id>` e devem registrar plano,
posição e origem no evento de analytics.

## 11. FAQ

Manter seis perguntas:

1. **De onde vêm as vagas?** Das páginas de carreira das empresas monitoradas, consultadas várias
   vezes ao dia.
2. **A conversa inicial é gratuita?** Sim. A pessoa responde três perguntas e vê a quantidade de
   vagas. O acesso e o monitoramento contínuo exigem assinatura.
3. **Preciso usar WhatsApp?** O início e a verificação acontecem pelo WhatsApp. Depois, alertas por
   email e painel web também ficam disponíveis.
4. **O ScrapJobs modifica meu currículo?** Não. Ele analisa a compatibilidade e gera um prompt para
   uso em outra IA junto com o PDF.
5. **Posso cancelar quando quiser?** Sim, sem fidelidade, diretamente pelo painel.
6. **Posso pedir outra empresa?** Sim. A pessoa envia a página de carreiras, e o time avalia se ela
   pode entrar no monitoramento.

Remover a afirmação de “criptografia de ponta a ponta” da landing. Qualquer texto de segurança
deve apontar para a política de privacidade e limitar-se às medidas efetivamente documentadas.

## 12. CTA final e footer

- Título: `Pare de procurar vaga todos os dias.`
- Descrição: `Conte o que você busca e deixe o ScrapJobs acompanhar as páginas das empresas para você.`
- CTA: `Receber vagas no WhatsApp`
- Microcopy: `Comece com 3 perguntas e veja o resultado antes de escolher um plano.`

O footer mantém Termos, Privacidade, email de contato, copyright e disclaimer sobre marcas.

## 13. Interações e dados

### CTAs do WhatsApp

Continuar usando o componente compartilhado para navbar, hero e CTA final. Preservar:

- detecção mobile;
- modal desktop;
- QR gerado no cliente;
- links com marcadores `#lp`, `#lpq` e `#lpw`;
- eventos `lp_whatsapp_click` com seção, dispositivo e método.

Ausência de `VITE_NORTE_WA_NUMBER` não pode produzir um link silenciosamente inválido. O build ou
o deploy deve validar a variável; como proteção adicional, a UI deve impedir a ação e informar
indisponibilidade temporária.

### Analytics

Medir pelo menos:

- clique no CTA do WhatsApp por seção e método;
- abertura do modal QR;
- clique em WhatsApp Web;
- clique em cada plano;
- abertura de FAQ;
- erro no carregamento dos planos.

Os eventos do frontend devem continuar correlacionáveis às fontes `lp`, `lp_qr` e `lp_web` do
backend.

## 14. SEO, acessibilidade e movimento

- Atualizar title, description, Open Graph e Twitter para remover “CV otimizado”.
- Usar a proposta de alertas de vagas no WhatsApp nos metadados.
- Adicionar imagem social apropriada quando houver asset aprovado; não usar mock de entrega falsa.
- Preservar apenas um `h1` e hierarquia sequencial de headings.
- Dar nome acessível à navegação e evitar texto duplicado no logo.
- Marcar mock de conversa como demonstração ou torná-lo ignorável por leitor de tela.
- Adicionar `scroll-margin-top` às seções ancoradas por causa da navbar fixa.
- Manter suporte a `prefers-reduced-motion` no carrossel, contadores e animações.
- Garantir foco visível e navegação por teclado no modal, FAQ e CTAs.

## 15. Componentes e limites de implementação

Reutilizar componentes existentes sempre que possível. A implementação pode:

- reescrever `HeroNorteSection`, `HowItWorksStrip`, `PricingSection`, `FaqSection` e
  `CtaFinalSection`;
- transformar `NorteCapabilitiesSection` em seção da jornada integrada;
- incorporar o conteúdo verdadeiro de `MulticanalSection` à seção de recursos;
- remover componentes e chaves de tradução que ficarem sem consumidores;
- manter `ProofBandSection`, `WhatsAppCtaButton`, `NorteChat`, `SectionWrapper` e o footer com
  ajustes pontuais.

Não fazem parte deste trabalho:

- alterar o funil do backend;
- adicionar novas áreas ao matching;
- criar geração de currículo ou PDF;
- alterar preços, planos ou cotas;
- criar testemunhos ou métricas de resultado sem dados reais;
- redesenhar páginas internas do aplicativo.

## 16. Testes e critérios de aceite

### Testes

- Atualizar testes unitários das seções e traduções.
- Cobrir falha e retry da API de planos.
- Cobrir CTA bloqueado quando o número do WhatsApp estiver ausente.
- Preservar testes mobile, modal desktop, QR e marcadores de origem.
- Atualizar E2E da landing para nova navegação, copy, planos e CTA.
- Verificar responsividade em mobile e desktop.
- Rodar lint, testes unitários, build e E2E da landing.

### Aceite

1. Nenhum texto afirma que o ScrapJobs reescreve ou gera currículo.
2. O hero comunica recebimento de vagas no WhatsApp e mantém chips de áreas.
3. O hero não mostra preço nem usa “Começar grátis”.
4. O funil de três perguntas e a necessidade de assinatura ficam explícitos antes dos planos.
5. Todos os recursos aparecem como parte de uma única assinatura.
6. Os limites dos planos correspondem aos dados atuais do backend.
7. Os CTAs do WhatsApp e dos planos continuam funcionais e mensuráveis.
8. Falhas de planos ou configuração do WhatsApp não criam ações vazias ou silenciosamente
   inválidas.
9. Metadados, FAQ e exemplos de conversa respeitam a mesma verdade do produto.
10. Copy nova existe em pt-BR e en-US.
