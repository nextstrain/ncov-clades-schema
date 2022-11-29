import React, { LegacyRef, MutableRefObject, Ref, RefObject, useCallback } from 'react'
import { saveAs } from 'file-saver'

export interface SaveButtonProps<T extends HTMLElement | SVGSVGElement> {
  text: string
  targetRef?: RefObject<T> | MutableRefObject<T> | null
}

export function SaveMarkupButton<T extends HTMLElement | SVGSVGElement>({ text, targetRef }: SaveButtonProps<T>) {
  const handleSaveToSvg = useCallback(() => {
    console.log(targetRef?.current)

    if (targetRef?.current) {
      const blob = new Blob([targetRef.current.outerHTML], {
        type: 'image/svg+xml',
      })
      saveAs(blob, 'clades.svg')
    }
  }, [targetRef])

  return (
    <button type="button" onClick={handleSaveToSvg}>
      {text}
    </button>
  )
}
