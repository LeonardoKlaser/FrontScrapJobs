from __future__ import annotations

import shutil
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'output/pdf/guia-pratico-para-melhorar-seu-curriculo.pdf'
PUBLIC = ROOT / 'public/guides/guia-pratico-para-melhorar-seu-curriculo.pdf'

GRAPHITE = HexColor('#0F172A')
BODY = HexColor('#475569')
GREEN = HexColor('#10B981')
GREEN_DARK = HexColor('#047857')
GREEN_PALE = HexColor('#ECFDF5')
PAGES = [
    {
        'kicker': 'GUIA PRÁTICO - SCRAPJOBS',
        'title': 'Como melhorar seu currículo e passar pelos filtros',
        'intro': (
            'Um roteiro direto para deixar seu CV mais claro, relevante e '
            'fácil de avaliar.'
        ),
        'bullets': [],
    },
    {
        'kicker': 'COMECE AQUI',
        'title': 'O que faz um currículo funcionar?',
        'intro': (
            'Seu CV precisa ajudar uma pessoa - e os sistemas de triagem - a '
            'entender rapidamente seu foco e as evidências que você apresenta.'
        ),
        'bullets': [
            'Clareza antes de criatividade.',
            'Evidência antes de adjetivos.',
            'Relevância para a vaga antes de volume de informação.',
            'Em poucos segundos deve ser possível entender sua área, seu nível e seus resultados.',
        ],
    },
    {
        'kicker': 'ESTRUTURA',
        'title': 'A anatomia de um CV claro',
        'intro': 'Organize o documento em uma ordem previsível e fácil de percorrer.',
        'bullets': [
            'Nome, cidade, telefone, e-mail e links profissionais.',
            'Título alinhado à função que você busca.',
            'Resumo curto, específico e verificável.',
            'Experiências da mais recente para a mais antiga.',
            'Formação e competências realmente relevantes.',
            'Evite foto, barras de nível e colunas complexas quando não forem necessárias.',
        ],
    },
    {
        'kicker': 'EXPERIENCIA',
        'title': 'Troque tarefas por impacto',
        'intro': 'Use a fórmula ação + contexto + resultado para tornar sua contribuição concreta.',
        'bullets': [
            'Antes: Responsável por projetos e contato com clientes.',
            'Depois: Coordenei 4 projetos simultâneos e reduzi atrasos de entrega em 30%.',
            'Sem números? Descreva escala, frequência, complexidade ou a mudança produzida.',
            'Comece cada item com um verbo de ação e retire frases que só repetem o cargo.',
        ],
    },
    {
        'kicker': 'PALAVRAS-CHAVE',
        'title': 'Adapte sem copiar a vaga',
        'intro': (
            'Use a linguagem da função quando ela representar sua experiência '
            'real. Nenhuma palavra-chave garante aprovação.'
        ),
        'bullets': [
            'Encontre competências e ferramentas que aparecem de forma recorrente.',
            'Priorize apenas as que você consegue comprovar.',
            'Distribua termos relevantes no título, resumo e experiências.',
            'Não esconda listas de palavras nem repita termos artificialmente.',
        ],
    },
    {
        'kicker': 'REVISÃO FINAL',
        'title': 'Checklist antes de enviar',
        'intro': 'Revise o arquivo como se você fosse recebê-lo pela primeira vez.',
        'bullets': [
            'Seu foco fica claro em poucos segundos?',
            'As experiências mostram contribuições e resultados?',
            'As palavras-chave refletem experiências verdadeiras?',
            'Datas, links, telefone e ortografia foram conferidos?',
            'O PDF abre no celular e permite selecionar o texto?',
            'O nome segue o formato Nome-Sobrenome-Currículo.pdf?',
        ],
    },
]


def draw_chrome(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(GREEN)
    canvas.rect(0, height - 6 * mm, width, 6 * mm, fill=1, stroke=0)
    canvas.setFillColor(GRAPHITE)
    canvas.setFont('Helvetica-Bold', 9)
    canvas.drawString(18 * mm, 12 * mm, 'Scrap')
    canvas.setFillColor(GREEN)
    canvas.drawString(30 * mm, 12 * mm, 'Jobs')
    canvas.setFillColor(BODY)
    canvas.setFont('Helvetica', 8)
    canvas.drawRightString(width - 18 * mm, 12 * mm, f'{document.page}')
    canvas.restoreState()


def styles():
    sample = getSampleStyleSheet()
    return {
        'kicker': ParagraphStyle(
            'Kicker', parent=sample['Normal'], fontName='Helvetica-Bold',
            fontSize=8, leading=10, textColor=GREEN_DARK, spaceAfter=8,
        ),
        'title': ParagraphStyle(
            'Title', parent=sample['Heading1'], fontName='Helvetica-Bold',
            fontSize=25, leading=30, textColor=GRAPHITE, alignment=TA_LEFT,
            spaceAfter=12,
        ),
        'intro': ParagraphStyle(
            'Intro', parent=sample['BodyText'], fontName='Helvetica',
            fontSize=11.5, leading=17, textColor=BODY, spaceAfter=14,
        ),
        'bullet': ParagraphStyle(
            'Bullet', parent=sample['BodyText'], fontName='Helvetica',
            fontSize=10.5, leading=15, textColor=GRAPHITE,
            leftIndent=12, firstLineIndent=-10, spaceAfter=8,
        ),
        'note': ParagraphStyle(
            'Note', parent=sample['BodyText'], fontName='Helvetica-Bold',
            fontSize=10, leading=15, textColor=GREEN_DARK,
            backColor=GREEN_PALE, borderColor=GREEN, borderWidth=0.5,
            borderPadding=10, spaceBefore=10,
        ),
    }


def page_story(page, page_number, style):
    story = [
        Spacer(1, 12 * mm),
        Paragraph(page['kicker'], style['kicker']),
        Paragraph(page['title'], style['title']),
        Paragraph(page['intro'], style['intro']),
    ]
    for item in page['bullets']:
        story.append(Paragraph(f'- {item}', style['bullet']))
    if page_number == 2:
        story.append(Paragraph(
            'Pergunta-chave: qual é sua área, seu nível e o resultado mais forte que você já gerou?',
            style['note'],
        ))
    if page_number == 5:
        story.append(Paragraph(
            'Importante: nenhum formato garante aprovação. O objetivo é reduzir ruído e mostrar aderência real.',
            style['note'],
        ))
    return story


def build():
    MASTER.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    style = styles()
    document = SimpleDocTemplate(
        str(MASTER), pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=16 * mm, bottomMargin=22 * mm,
        title='Como melhorar seu currículo e passar pelos filtros',
        author='ScrapJobs',
    )
    story = []
    for index, page in enumerate(PAGES, start=1):
        story.extend(page_story(page, index, style))
        if index != len(PAGES):
            story.append(PageBreak())
    document.build(story, onFirstPage=draw_chrome, onLaterPages=draw_chrome)
    shutil.copyfile(MASTER, PUBLIC)


if __name__ == '__main__':
    build()
