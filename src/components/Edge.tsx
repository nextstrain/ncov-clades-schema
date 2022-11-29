import React, { useMemo } from 'react'
import styled from 'styled-components'

import { getNodesForEdge, Graph, GraphEdge } from '../graph/graph'
import { nodeRadius } from './constants'

const PathT = styled.path`
  fill: none;
  stroke-width: 2px;
  stroke: #555555;
  pointer-events: auto;
  cursor: pointer;
`

const PathS = styled.path`
  fill: none;
  stroke-width: 2px;
  stroke: #555555;
  pointer-events: auto;
  cursor: pointer;
  stroke-linecap: round;
`

export interface Point {
  x: number
  y: number
}

export interface EdgeProps {
  edge: GraphEdge
  graph: Graph
}

export function Edge({ edge, graph }: EdgeProps) {
  const pathComponents = useMemo(() => {
    const { source, target } = getNodesForEdge(graph, edge)

    const vertical = (
      <PathT
        key="vertical"
        d={`M ${source.layout.xTBarStart}, ${source.layout.yTBarStart} L ${source.layout.xTBarEnd}, ${source.layout.yTBarEnd}`}
      />
    )

    const horizontal = (
      <PathS key="horizontal" d={`M ${source.layout.xTBarStart}, ${target.y} L ${target.x}, ${target.y}`} />
    )

    return [vertical, horizontal]
  }, [edge, graph])

  return <g>{pathComponents}</g>
}
