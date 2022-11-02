import React, { forwardRef, LegacyRef, RefObject, SVGProps, useMemo } from 'react'
import type { HierarchyPointNode } from 'd3-hierarchy'
import { hierarchy, tree } from 'd3-hierarchy'
import styled from 'styled-components'

import { nodeHeight, nodeWidth } from 'src/components/constants'
import { Edge } from 'src/components/Edge'
import { Node } from 'src/components/Node'

const Svg = styled.svg`
  font-family: sans-serif;
  font-size: 1.25rem;
  margin: 0;
  padding: 0;
  border: none;
`

export interface CladesJson {
  color: string
  name: string
  lineages?: string[]
  children?: CladesJson[]
}

export interface CladeTreeSvgProps {
  cladesJson: CladesJson
  width: number
  height: number
}

export function shift<T>(node: HierarchyPointNode<T>, { dx, dy }: { dx?: number; dy?: number }) {
  return { ...node, x: node.x + (dx ?? 0), y: node.y + (dy ?? 0) }
}

// eslint-disable-next-line react/display-name
export const NextstrainCladeTreeSvg = forwardRef<SVGSVGElement, CladeTreeSvgProps>(
  ({ cladesJson, width, height, ...restProps }, ref) => {
    const { nodeComponents, edgeComponents } = useMemo(() => {
      // NOTE: x/y and width/height are swapped here, because we want to render the tree sideways, not top to bottom
      const root = hierarchy(cladesJson, (d) => d.children)
      const t = tree().size([height - nodeHeight, width - nodeWidth])

      const tm = t(root) as HierarchyPointNode<CladesJson>
      const nodes = tm.descendants()
      const edges = tm.links()

      const nodeComponents = nodes.map((node) => (
        <Node
          key={node.data.name}
          node={node.data}
          x={node.y}
          y={node.x}
          nodeWidth={nodeWidth}
          nodeHeight={nodeHeight}
        />
      ))

      const edgeComponents = edges.map((edge) => (
        <Edge
          key={edge.target.data.name}
          x1={edge.source.y + nodeWidth / 2}
          x2={edge.target.y + nodeWidth / 2}
          y1={edge.source.x + nodeHeight / 2}
          y2={edge.target.x + nodeHeight / 2}
        />
      ))

      return { nodeComponents, edgeComponents }
    }, [cladesJson, height, width])

    if (!width || !height) {
      return null
    }

    return (
      <Svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} ref={ref} {...restProps}>
        {edgeComponents}
        {nodeComponents}
      </Svg>
    )
  },
)
