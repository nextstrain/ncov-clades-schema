import React, { ReactElement } from 'react'

import type { Graph, GraphNode } from 'src/graph/graph'
import { cladesTextColor, cladesTextSize, nodeRadius } from './constants'

export interface CladeTreeNodeProps {
  node: GraphNode
  graph: Graph
}

export function Node({ node, graph }: CladeTreeNodeProps): ReactElement {
  const { id, clade, lineages, who, version, otherNames, x, y, color } = node
  return (
    <g>
      <circle cx={x} cy={y} r={nodeRadius} fill={color} />
      <text
        x={x}
        y={y + cladesTextSize / 2 - 1}
        width={nodeRadius * 2}
        height={nodeRadius * 2}
        fill={cladesTextColor}
        fontSize={cladesTextSize}
        textAnchor="middle"
      >
        {clade}
      </text>
    </g>
  )
}
