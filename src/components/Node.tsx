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
      <circle cx={x + nodeRadius / 2} cy={y + nodeRadius / 2} r={nodeRadius} fill={color} />
      <text
        x={x + nodeRadius / 2}
        y={y + nodeRadius / 2 + cladesTextSize / 2 - 1}
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
