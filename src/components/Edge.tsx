import React, { useMemo } from 'react'

import { getNodesForEdge, Graph, GraphEdge } from '../graph/graph'
import { nodeRadius } from './constants'

export interface EdgeProps {
  edge: GraphEdge
  graph: Graph
}

export function Edge({ edge, graph }: EdgeProps) {
  const { x1, x2, y1, y2 } = useMemo(() => {
    const { source, target } = getNodesForEdge(graph, edge)
    const y1 = source.y + nodeRadius / 2
    const y2 = target.y + nodeRadius / 2
    const x1 = source.x + nodeRadius / 2
    const x2 = target.x + nodeRadius / 2
    return { x1, x2, y1, y2 }
  }, [edge, graph])

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" />
}
