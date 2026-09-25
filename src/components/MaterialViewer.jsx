import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const TYPE_CONFIG = {
  pdf: { label: 'PDF Reading', icon: 'PDF' },
  video: { label: 'Lecture Video', icon: '▶' },
  youtube: { label: 'External Video', icon: '▶' },
  md: { label: 'Assignment', icon: '¶' },
}

export default function MaterialViewer({ material }) {
  if (!material) return null

  const config = TYPE_CONFIG[material.kind] || { label: 'Resource', icon: '•' }
  const typeLabel =
    material.material_type === 'md'
      ? 'Markdown Assignment'
      : config.label

  return (
    <div className="material-viewer">
      <div className="material-viewer-head">
        <div>
          <span className="material-type">
            <span className="material-icon">{config.icon}</span>
            {typeLabel}
          </span>
          <h2>{material.material_title}</h2>
        </div>
        {material.url && (
          <a
            href={material.url}
            target="_blank"
            rel="noreferrer"
            className="open-external"
          >
            Open in new tab ↗
          </a>
        )}
      </div>

      <div className="material-viewer-body">
        {renderContent(material)}
      </div>
    </div>
  )
}

function renderContent(material) {
  const { kind, url, content } = material

  if (kind === 'md' && content) {
    return (
      <div className="markdown-doc">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    )
  }

  if (kind === 'youtube') {
    const embedId = extractYouTubeId(url)
    if (embedId) {
      return (
        <div className="video-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${embedId}`}
            title={material.material_title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
          <a href={url} target="_blank" rel="noreferrer" className="video-fallback">
            Open video on YouTube ↗
          </a>
        </div>
      )
    }
    return (
      <div className="video-embed">
        <a href={url} target="_blank" rel="noreferrer" className="video-fallback-card">
          ▶ Watch external video on YouTube
        </a>
      </div>
    )
  }

  if (kind === 'video') {
    return (
      <div className="video-embed">
        <video src={url} controls preload="metadata" />
      </div>
    )
  }

  if (kind === 'pdf') {
    return (
      <iframe
        src={url}
        title={material.material_title}
        className="pdf-frame"
      />
    )
  }

  if (kind === 'image' || /\.(jpe?g|png|gif|webp|svg)$/i.test(url || '')) {
    return (
      <figure className="image-figure">
        <img src={url} alt={material.material_title} />
      </figure>
    )
  }

  return (
    <div className="unsupported">
      <a href={url} target="_blank" rel="noreferrer">
        Open resource ↗
      </a>
    </div>
  )
}

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  )
  return match ? match[1] : null
}