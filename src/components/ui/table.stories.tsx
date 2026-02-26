import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from './table'
import { Badge } from './badge'

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const vagas = [
  {
    id: 1,
    titulo: 'Desenvolvedor Frontend Senior',
    empresa: 'Nubank',
    local: 'Sao Paulo, SP',
    compatibilidade: 92
  },
  {
    id: 2,
    titulo: 'Engenheiro de Software',
    empresa: 'iFood',
    local: 'Campinas, SP',
    compatibilidade: 85
  },
  {
    id: 3,
    titulo: 'Tech Lead React',
    empresa: 'Mercado Livre',
    local: 'Remoto',
    compatibilidade: 78
  }
]

export const Basic: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vaga</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Local</TableHead>
          <TableHead className="text-right">Compatibilidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vagas.map((vaga) => (
          <TableRow key={vaga.id}>
            <TableCell className="font-medium">{vaga.titulo}</TableCell>
            <TableCell>{vaga.empresa}</TableCell>
            <TableCell>{vaga.local}</TableCell>
            <TableCell className="text-right">{vaga.compatibilidade}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const WithHover: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Passe o mouse sobre as linhas para ver o efeito de borda lateral.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaga</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Desenvolvedor React</TableCell>
            <TableCell>Nubank</TableCell>
            <TableCell>
              <Badge variant="default">Compativel</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Backend Go</TableCell>
            <TableCell>iFood</TableCell>
            <TableCell>
              <Badge variant="secondary">Analisando</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">DevOps Engineer</TableCell>
            <TableCell>Mercado Livre</TableCell>
            <TableCell>
              <Badge variant="destructive">Incompativel</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Lista das vagas mais recentes encontradas.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Vaga</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Local</TableHead>
          <TableHead className="text-right">Compatibilidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vagas.map((vaga) => (
          <TableRow key={vaga.id}>
            <TableCell className="font-medium">{vaga.titulo}</TableCell>
            <TableCell>{vaga.empresa}</TableCell>
            <TableCell>{vaga.local}</TableCell>
            <TableCell className="text-right">{vaga.compatibilidade}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total de vagas</TableCell>
          <TableCell className="text-right">{vagas.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
