import { useMemo } from 'react'
import { marked } from 'marked'
import { ExternalLinkIcon } from './Icons.jsx'

function MarkdownContent({ content }) {
  const html = useMemo(() => marked.parse(content || ''), [content])
  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function MaterialViewer({ view, material }) {
  if (!view) return null

  switch (view.kind) {
    case 'pdf':
      return (
        <div className="viewer viewer--document">
          <iframe
            className="viewer-frame"
            src={view.url}
            title={material.material_title}
          />
        </div>
      )
    case 'video':
      return (
        <div className="viewer viewer--video">
          <video className="viewer-video" src={view.url} controls />
        </div>
      )
    case 'youtube':
      return (
        <div className="viewer viewer--video">
          <iframe
            className="viewer-frame"
            src={view.url}
            title={material.material_title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    case 'markdown':
      return (
        <div className="viewer viewer--reading">
          <div className="reading-paper">
            <MarkdownContent content={view.content} />
          </div>
        </div>
      )
    case 'file':
      return (
        <div className="viewer viewer--fallback">
          <div className="fallback-card">
            <ExternalLinkIcon className="fallback-icon" />
            <p>This resource opens externally.</p>
            <a href={view.url} target="_blank" rel="noreferrer">
              Open {material.material_title}
            </a>
          </div>
        </div>
      )
    default:
      return null
  }
}
