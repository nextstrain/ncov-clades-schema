import React, { ReactElement, useMemo } from 'react'
import styled from 'styled-components'

import { CladesJson } from 'src/components/NextstrainCladeTreeSvg'
import { cladesTextColor, cladesTextSize, lineagesRectHeight, lineagesTextColor, lineagesTextSize } from './constants'

const Rect = styled.rect`
  border-radius: 3px;
`

export interface CladeTreeNodeProps {
  node: CladesJson
  x: number
  y: number
  nodeWidth: number
  nodeHeight: number
}

export function Node({ node, x, y, nodeWidth, nodeHeight }: CladeTreeNodeProps): ReactElement {
  const { name, color, lineages } = node
  const lineagesText = useMemo(() => node.lineages?.join(', '), [node.lineages])
  return (
    <g>
      <Rect x={x} y={y} width={nodeWidth} height={nodeHeight} fill={color} rx={3} ry={3}></Rect>
      <text
        x={x + nodeWidth / 2}
        y={y + nodeHeight / 2 + cladesTextSize / 2 - 1}
        width={nodeWidth}
        height={nodeHeight}
        fill={cladesTextColor}
        fontSize={cladesTextSize}
        textAnchor="middle"
      >
        {name}
      </text>

      <Rect x={x} y={y + nodeHeight} width={nodeWidth} height={lineagesRectHeight} fill="#ccc"></Rect>
      <text
        x={x + nodeWidth / 2}
        y={y + nodeHeight - lineagesRectHeight + nodeHeight / 2 + cladesTextSize / 2 - 1}
        width={nodeWidth}
        height={nodeHeight}
        fill={lineagesTextColor}
        fontSize={lineagesTextSize}
        textAnchor="middle"
      >
        {lineagesText}
      </text>
    </g>
  )
}
