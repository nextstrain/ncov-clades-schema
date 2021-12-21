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
  const margin = { top: 50, right: 50, bottom: 0, left: 50 }
  const width = 1000 - margin.left - margin.right
  const height = 600 - margin.top - margin.bottom
  const options = { margin, width, height }

  useEffect(() => {
    if (d3Ref.current) {
      console.log({ options })
      createCladesSchema(d3Ref.current, clades, options)
    }
  })

  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="d3-component"
        style={{
          fontFamily: 'sans-serif',
          fontSize: '1.25rem',
        }}
        viewBox={`-70 0 ${width - 70} ${height}`}
        ref={d3Ref}
      />
    </div>
  )
}
