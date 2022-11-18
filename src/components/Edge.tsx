import React, { useMemo } from 'react'

import { getNodesForEdge, GraphEdge, GraphNodeDisplay } from '../graph/graph'
import { nodeRadius } from './constants'

export interface EdgeProps {
  nodes: GraphNodeDisplay[]
  edge: GraphEdge
}

export function Edge({ nodes, edge }: EdgeProps) {
  const { x1, x2, y1, y2 } = useMemo(() => {
    const { source, target } = getNodesForEdge(nodes, edge)
    const y1 = source.y + nodeRadius / 2
    const y2 = target.y + nodeRadius / 2
    const x1 = source.x + nodeRadius / 2
    const x2 = target.x + nodeRadius / 2
    return { x1, x2, y1, y2 }
  }, [edge, nodes])

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" />
}
