import React from 'react'

export interface EdgeProps {
  x1: number
  x2: number
  y1: number
  y2: number
}

export function Edge({ x1, x2, y1, y2 }: EdgeProps) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" />
}
