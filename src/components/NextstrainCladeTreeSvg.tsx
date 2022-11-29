import React, { forwardRef, useMemo } from 'react'
import { calculateGraphLayout, GraphEdge, GraphNodeRaw } from 'src/graph/graph'
import styled from 'styled-components'

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
  nodes: GraphNodeRaw[]
  edges: GraphEdge[]
}

export interface CladeTreeSvgProps {
  cladesJson: CladesJson
  width: number
  height: number
}

// eslint-disable-next-line react/display-name
export const NextstrainCladeTreeSvg = forwardRef<SVGSVGElement, CladeTreeSvgProps>(
  ({ cladesJson, width, height, ...restProps }, ref) => {
    const { nodeComponents, edgeComponents } = useMemo(() => {
      if (!width || !height) {
        return { nodeComponents: [], edgeComponents: [] }
      }

      const graph = calculateGraphLayout({ nodes: cladesJson.nodes, edges: cladesJson.edges }, width, height)

      const nodeComponents = graph.nodes.map((node) => <Node key={node.id} graph={graph} node={node} />)
      const edgeComponents = graph.edges.map((edge) => <Edge key={edge.id} graph={graph} edge={edge} />)

      return { nodeComponents, edgeComponents }
    }, [cladesJson.edges, cladesJson.nodes, height, width])

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
