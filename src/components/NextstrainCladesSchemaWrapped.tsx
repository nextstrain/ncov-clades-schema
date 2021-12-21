import React, { useCallback, useRef } from 'react'

import { saveAs } from 'file-saver'
import { NextstrainCladesSchema } from './NextstrainCladesSchema'

export function NextstrainCladesSchemaWrapped() {
  const d3Ref = useRef<SVGSVGElement>(null)

  const handleSaveToSvg = useCallback(() => {
    if (d3Ref.current) {
      const blob = new Blob([d3Ref.current.outerHTML], {
        type: 'image/svg+xml',
      })
      saveAs(blob, 'clades.svg')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d3Ref.current])

  return (
    <div>
      <NextstrainCladesSchema d3Ref={d3Ref} />
      <button type="button" onClick={handleSaveToSvg}>
        {'Save to SVG'}
      </button>
    </div>
  )
}
