import React from 'react'

export function markdownToReact(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeContent = ''
      } else {
        inCodeBlock = false
        elements.push(
          <pre key={i} className="bg-muted p-3 rounded overflow-x-auto mt-2 mb-2">
            <code className="text-sm">{codeContent}</code>
          </pre>
        )
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += line + '\n'
      continue
    }

    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s/, '')
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      elements.push(React.createElement(Tag, { key: i, className: `font-semibold mb-2 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}` }, text))
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={i} className="font-bold mb-2">{line.slice(2, -2)}</p>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={i} className="ml-4 mb-1">{line.slice(2)}</li>)
    } else if (line.match(/^\d+\./)) {
      elements.push(<li key={i} className="ml-4 mb-1">{line}</li>)
    } else if (line.includes('|') && line.includes('---')) {
      // Table header separator - skip
    } else if (line.includes('|') && line.split('|').length > 2) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length > 1) {
        elements.push(
          <div key={i} className="overflow-x-auto my-2">
            <table className="text-sm border-collapse">
              <tbody>
                <tr>
                  {cells.map((cell, j) => (
                    <td key={j} className="border px-2 py-1">{cell}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )
      }
    } else if (line.trim() === '') {
      elements.push(<br key={i} />)
    } else {
      // Handle inline formatting
      const processedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code className="bg-muted px-1 rounded">$1</code>')

      elements.push(<p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />)
    }
  }

  return <div>{elements}</div>
}