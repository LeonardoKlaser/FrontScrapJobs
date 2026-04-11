// Miniature visual previews of each PDFMonkey resume template.
// Renders abstract shapes (colored bars, circles, rectangles) at full A4 scale,
// then the parent scales them down with CSS transform.

function TextBar({ width, height = 8, color = '#d1d5db', mt = 0 }: { width: string; height?: number; color?: string; mt?: number }) {
  return <div style={{ width, height, background: color, borderRadius: 4, marginTop: mt }} />
}

export function ModernoPreview() {
  const accent = '#0f9d8f'
  const accentLight = '#e6f7f5'
  const accentMid = '#c8ece8'
  const ink = '#1a1f2e'
  const muted = '#e2e5ec'

  return (
    <div style={{ width: 794, height: 1123, background: '#fff', padding: '40px 48px 48px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 260, height: 22, background: ink, borderRadius: 4 }} />
        <div style={{ width: 140, height: 12, background: accent, borderRadius: 4, marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
          <div style={{ width: 100, height: 8, background: muted, borderRadius: 4 }} />
        </div>
      </div>

      {/* Summary section */}
      <SectionModerno label={180} accent={accent} accentMid={accentMid} />
      <TextBar width="95%" mt={4} />
      <TextBar width="88%" mt={6} />
      <TextBar width="72%" mt={6} />

      {/* Skills section */}
      <div style={{ marginTop: 22 }}>
        <SectionModerno label={130} accent={accent} accentMid={accentMid} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {[72, 88, 60, 96, 68, 80].map((w, i) => (
            <div key={i} style={{ width: w, height: 22, background: accentLight, border: `1px solid ${accentMid}`, borderRadius: 20 }} />
          ))}
        </div>
      </div>

      {/* Experience section */}
      <div style={{ marginTop: 22 }}>
        <SectionModerno label={220} accent={accent} accentMid={accentMid} />
        {[0, 1].map((i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 180, height: 12, background: ink, borderRadius: 4 }} />
              <div style={{ width: 120, height: 10, background: accent, borderRadius: 4 }} />
            </div>
            <TextBar width="92%" mt={6} />
            <TextBar width="85%" mt={5} />
            <TextBar width="60%" mt={5} />
          </div>
        ))}
      </div>

      {/* Education section */}
      <div style={{ marginTop: 22 }}>
        <SectionModerno label={190} accent={accent} accentMid={accentMid} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 200, height: 12, background: ink, borderRadius: 4 }} />
          <div style={{ width: 50, height: 10, background: '#8b92a5', borderRadius: 4 }} />
        </div>
        <TextBar width="160px" mt={4} color="#8b92a5" />
      </div>

      {/* Languages section */}
      <div style={{ marginTop: 22 }}>
        <SectionModerno label={100} accent={accent} accentMid={accentMid} />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[70, 80].map((w, i) => (
            <div key={i} style={{ width: w, height: 22, background: '#f5f0ff', border: '1px solid #e8e0f7', borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionModerno({ label, accent, accentMid }: { label: number; accent: string; accentMid: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <div style={{ width: label, height: 10, background: accent, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, ${accentMid}, transparent)`, borderRadius: 1 }} />
    </div>
  )
}

export function ClassicoPreview() {
  const navy = '#1b2640'
  const gold = '#c4a35a'
  const ink = '#2c2c2c'
  const muted = '#d1d5db'

  return (
    <div style={{ width: 794, height: 1123, background: '#fff', fontFamily: 'Georgia, serif' }}>
      {/* Navy header */}
      <div style={{ background: navy, padding: '36px 48px 30px', textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 280, height: 22, background: '#fff', borderRadius: 4, margin: '0 auto' }} />
        <div style={{ width: 160, height: 10, background: gold, borderRadius: 4, margin: '8px auto 0' }} />
        <div style={{ width: 120, height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 4, margin: '10px auto 0' }} />
        {/* Gold bottom line */}
        <div style={{ position: 'absolute', bottom: 0, left: 48, right: 48, height: 3, background: gold }} />
      </div>

      {/* Content */}
      <div style={{ padding: '32px 48px 48px' }}>
        {/* Summary */}
        <SectionClassico label={200} navy={navy} />
        <TextBar width="94%" mt={4} />
        <TextBar width="87%" mt={6} />
        <TextBar width="70%" mt={6} />

        {/* Experience */}
        <div style={{ marginTop: 24 }}>
          <SectionClassico label={240} navy={navy} />
          {[0, 1].map((i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ width: 180, height: 12, background: ink, borderRadius: 4 }} />
              <div style={{ width: 130, height: 10, background: navy, borderRadius: 4, marginTop: 4, opacity: 0.6 }} />
              <TextBar width="90%" mt={6} />
              <TextBar width="82%" mt={5} />
            </div>
          ))}
        </div>

        {/* Education */}
        <div style={{ marginTop: 24 }}>
          <SectionClassico label={200} navy={navy} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 200, height: 12, background: ink, borderRadius: 4 }} />
            <div style={{ width: 50, height: 10, background: muted, borderRadius: 4 }} />
          </div>
          <TextBar width="150px" mt={4} color="#888" />
        </div>

        {/* Two columns: Skills + Languages */}
        <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
          <div style={{ flex: 1 }}>
            <SectionClassico label={120} navy={navy} />
            <TextBar width="90%" mt={4} />
            <TextBar width="75%" mt={5} />
          </div>
          <div style={{ flex: 1 }}>
            <SectionClassico label={100} navy={navy} />
            <TextBar width="85%" mt={4} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionClassico({ label, navy }: { label: number; navy: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ width: label, height: 14, background: navy, borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 2, background: navy }} />
    </div>
  )
}

export function CriativoPreview() {
  const sidebarFrom = '#0c4a42'
  const sidebarTo = '#0a7566'
  const sidebarAccent = '#4eecd5'
  const sidebarDivider = 'rgba(255,255,255,0.15)'
  const ink = '#1a1f2e'
  const accent = '#0c8c78'

  return (
    <div style={{ width: 794, height: 1123, background: '#fff', display: 'flex', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '35%', minHeight: '100%', background: `linear-gradient(170deg, ${sidebarFrom} 0%, ${sidebarTo} 100%)`, padding: '40px 28px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Avatar */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: `2px solid ${sidebarAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 32, height: 18, background: sidebarAccent, borderRadius: 4 }} />
        </div>

        {/* Contact section */}
        <SidebarSectionCriativo accent={sidebarAccent} divider={sidebarDivider} labelWidth={80} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ width: 100, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 4 }} />
        </div>

        {/* Skills section */}
        <SidebarSectionCriativo accent={sidebarAccent} divider={sidebarDivider} labelWidth={110} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: sidebarAccent, flexShrink: 0 }} />
            <div style={{ width: 80 + (i % 3) * 15, height: 8, background: 'rgba(255,255,255,0.45)', borderRadius: 4 }} />
          </div>
        ))}

        {/* Languages section */}
        <div style={{ marginTop: 16 }}>
          <SidebarSectionCriativo accent={sidebarAccent} divider={sidebarDivider} labelWidth={90} />
          {[0, 1].map((i) => (
            <div key={i} style={{ width: 70 + i * 20, height: 9, background: 'rgba(255,255,255,0.45)', borderRadius: 4, marginBottom: 8 }} />
          ))}
        </div>
      </div>

      {/* Main column */}
      <div style={{ width: '65%', padding: '40px 40px 48px' }}>
        {/* Name */}
        <div style={{ width: 240, height: 22, background: ink, borderRadius: 4 }} />
        <div style={{ width: 140, height: 11, background: accent, borderRadius: 4, marginTop: 6 }} />
        <div style={{ width: 48, height: 3, background: accent, borderRadius: 2, margin: '20px 0' }} />

        {/* Summary */}
        <MainSectionCriativo accent={accent} labelWidth={190} />
        <TextBar width="94%" mt={4} />
        <TextBar width="86%" mt={5} />
        <TextBar width="68%" mt={5} />

        {/* Experience */}
        <div style={{ marginTop: 24 }}>
          <MainSectionCriativo accent={accent} labelWidth={230} />
          {[0, 1].map((i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ width: 170, height: 12, background: ink, borderRadius: 4 }} />
              <div style={{ width: 120, height: 10, background: accent, borderRadius: 4, marginTop: 3 }} />
              <TextBar width="90%" mt={5} />
              <TextBar width="80%" mt={4} />
              <TextBar width="55%" mt={4} />
            </div>
          ))}
        </div>

        {/* Education */}
        <div style={{ marginTop: 24 }}>
          <MainSectionCriativo accent={accent} labelWidth={200} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 180, height: 11, background: ink, borderRadius: 4 }} />
            <div style={{ width: 44, height: 9, background: '#aaa', borderRadius: 4 }} />
          </div>
          <TextBar width="140px" mt={4} color="#8b92a5" />
        </div>
      </div>
    </div>
  )
}

function SidebarSectionCriativo({ accent, divider, labelWidth }: { accent: string; divider: string; labelWidth: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ width: labelWidth, height: 8, background: accent, borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 1, background: divider }} />
    </div>
  )
}

function MainSectionCriativo({ accent, labelWidth }: { accent: string; labelWidth: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ width: 3, height: 14, background: accent, borderRadius: 2, marginRight: 11 }} />
      <div style={{ width: labelWidth, height: 11, background: accent, borderRadius: 4 }} />
    </div>
  )
}
