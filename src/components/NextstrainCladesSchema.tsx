import React, { RefObject, useCallback, useEffect, useRef } from 'react'

import { saveAs } from 'file-saver'

import clades from '../clades.json'

// @ts-ignore
import { createCladesSchema } from '../createCladesSchema'

export interface CladesJson {
  name: string
  color: string
  children: CladesJson[]
}

export function NextstrainCladesSchema({ d3Ref }: { d3Ref: RefObject<SVGSVGElement> }) {
  const margin = { top: 0, right: 0, bottom: 0, left: 90 }

  const width = 1250 // Change this when the tree grows
  const height = 850 // Change this when the tree grows

  const options = { margin, width, height }

  useEffect(() => {
    if (d3Ref.current) {
      console.log({ options })
      createCladesSchema(d3Ref.current, clades, options)
    }
  })

  return (
    <div style={{ width: '1000px' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="d3-component"
        style={{
          fontFamily: 'sans-serif',
          fontSize: '1.25rem',
        }}
        viewBox={`0 0 ${width} ${height}`}
        ref={d3Ref}
      />
    </div>
  )
}
