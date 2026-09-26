import { youtubeId } from '../lib/youtube.js'

function Markdown({ children }) {
  const lines = children.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^\s*$/.test(line)) {
      i++
      continue
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length
      const text = line.replace(/^#+\s*/, '')
      const Tag = `h${level}`
      blocks.push(<Tag key={i}>{inline(text)}</Tag>)
      i++
      continue
    }

    if (/^\s*[-*]\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*]\s/, '')))
        i++
      }
      blocks.push(
        <ul key={i}>
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      )
      continue
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+\.\s/, '')))
        i++
      }
      blocks.push(
        <ol key={i}>
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ol>
      )
      continue
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      const tableLines = []
      while (i < lines.length && /^\s*\|.*\|/.test(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      blocks.push(renderTable(tableLines, i))
      continue
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push(<hr key={i} />)
      i++
      continue
    }

    blocks.push(<p key={i}>{inline(line.trim())}</p>)
    i++
  }

  return <div className="markdown">{blocks}</div>
}

function renderTable(lines, key) {
  const parse = (l) =>
    l
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())
  const header = parse(lines[0])
  const bodyLines = lines.slice(2).filter((l) => !/^\s*\|[\s\-:|]+\|\s*$/.test(l))
  return (
    <table key={key}>
      <thead>
        <tr>
          {header.map((h, idx) => (
            <th key={idx}>{inline(h)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyLines.map((l, rIdx) => (
          <tr key={rIdx}>
            {parse(l).map((c, cIdx) => (
              <td key={cIdx}>{inline(c)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function inline(text) {
  const parts = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0
  let match
  let key = 0
  while ((match = regex.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>)
    }
    last = regex.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function MaterialViewer({ material }) {
  if (!material) {
    return (
      <div className="viewer-placeholder">
        <p>Select a material from the syllabus to view it here.</p>
      </div>
    )
  }

  switch (material.kind) {
    case 'youtube': {
      const id = youtubeId(material.url)
      return (
        <div className="material-video">
          {id ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              title={material.material_title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <p>{material.material_title}</p>
          )}
        </div>
      )
    }
    case 'video':
      return (
        <div className="material-video">
          <video src={material.url} controls />
        </div>
      )
    case 'pdf':
      return (
        <div className="material-pdf">
          <iframe src={material.url} title={material.material_title} />
        </div>
      )
    case 'md':
      return (
        <div className="material-md scroll-area">
          <Markdown>{material.content}</Markdown>
        </div>
      )
    default:
    case 'link':
      return (
        <div className="material-link scroll-area">
          <p>Preview unavailable. Open the resource directly.</p>
          <a href={material.url} target="_blank" rel="noreferrer">
            Open {material.material_title}
          </a>
        </div>
      )
  }
}

export { MaterialViewer, Markdown }