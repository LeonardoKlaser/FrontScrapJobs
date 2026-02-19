export function ProblemPromiseSection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Problem */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              A busca de emprego não deveria ser um segundo emprego.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Você passa horas navegando entre dezenas de sites de emprego, abrindo abas infinitas,
              adaptando currículos para cada vaga e ainda assim perde oportunidades que surgem
              quando você não está olhando. É frustrante, demorado e ineficiente.
            </p>
          </div>

          {/* Promise */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              Recupere seu tempo.{' '}
              <span className="text-primary">Candidate-se com inteligência.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              A scrapJobs automatiza toda sua busca de emprego, monitorando suas empresas favoritas
              24/7 e enviando alertas inteligentes com análise de IA. Concentre sua energia no que
              realmente importa: preparar-se para as entrevistas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
