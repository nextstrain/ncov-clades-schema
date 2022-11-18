import { max, min, cloneDeep } from 'lodash'
import { horizontalSeparationBetweenNodes, nodeRadius } from '../components/constants'

export interface GraphNode {
  id: string
  clade: string
  lineages?: string[]
  who?: string
  version?: string
  otherNames?: string[]
  color?: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export function calculateGraphLayout(
  nodes_: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): GraphNode[] {
  const nodes = cloneDeep(nodes_)

  // Position roots at the left of viewport
  const roots = getRoots(nodes, edges)
  roots.forEach((root) => {
    root.x = nodeRadius / 2
  })

  traverseBreadthFirst(nodes, edges, ({ node, children, parents, siblings, isLeaf, isRoot, depth }) => {
    children.forEach(([child, _]) => {
      // Spread nodes across horizontal axis
      // TODO: calculate separation dynamically from viewport width
      child.x = node.x + nodeRadius / 2 + horizontalSeparationBetweenNodes
    })
    return node
  })

  // Spread leaves along vertical axis
  const leaves = getLeaves(nodes, edges)
  const leafSpacing = height / (leaves.length - 1)
  leaves.forEach((leaf, i) => {
    leaf.y = i * (leafSpacing - nodeRadius)
  })

  // Spread parents in the vertical space defined by their children
  traverseBreadthFirst(
    nodes,
    edges,
    ({ node, children, parents, siblings, isLeaf, isRoot, depth }) => {
      const siblingYs = siblings.map((sibling) => sibling.y)

      // calculate total y-space available to put parents into
      const start = min(siblingYs) ?? 0
      const end = max(siblingYs) ?? 0

      // calculate y-spacing between parents
      const spacing = (end - start) / (parents.length + 1)

      // spread parents in the available y-space
      parents.forEach(([parent, _], i) => {
        parent.y = start + spacing * (i + 1)
      })

      return node
    },
    { backward: true },
  )

  console.log(require('util').inspect({ nodesDisplay: nodes }, { colors: true, depth: null, maxArrayLength: null }))

  return nodes
}

export interface ExplorerParams<N extends { id: string }, E extends { source: string; target: string }> {
  node: N
  children: [N, E][]
  parents: [N, E][]
  siblings: N[]
  isLeaf: boolean
  isRoot: boolean
  depth: number
}

// Explore graph in breadth-first fashion given an explorer function.
export function traverseBreadthFirst<N extends { id: string }, E extends { source: string; target: string }, T>(
  nodes: N[],
  edges: E[],
  explorer: (params: ExplorerParams<N, E>) => T,
  options?: { backward?: boolean },
): T[] {
  // First frontier is all the roots or all the leaves depending on direction of traversal
  const frontier = options?.backward ? getLeaves(nodes, edges) : getRoots(nodes, edges)

  // Fill queue with the first frontier
  const queue: { node: N; depth: number }[] = frontier.map((node) => ({ node, depth: 0 }))

  // Mark first frontier as explored
  const explored = new Set<string>(frontier.map((node) => node.id))

  const results: T[] = []

  while (queue.length > 0) {
    const item = queue.shift()
    if (!item) {
      return results
    }

    const { node, depth } = item

    let parents: [N, E][] = getParents(node.id, nodes, edges)
    parents = !options?.backward ? parents.reverse() : parents

    let children: [N, E][] = getChildren(node.id, nodes, edges)
    children = !options?.backward ? children.reverse() : children

    let siblings: N[] = getSiblings(node.id, nodes, edges)
    siblings = !options?.backward ? siblings.reverse() : siblings

    // Leaf is the node that has no children
    const isLeaf = children.length === 0

    // Root is the node that has no parents
    const isRoot = parents.length === 0

    // Perform the exploration as defined by the caller function
    const result = explorer({ node, children, parents, siblings, isLeaf, isRoot, depth })
    explored.add(node.id)
    results.push(result)

    // Next, proceed with either children or parents, depending on which direction we are traversing
    const successors = options?.backward ? parents : children

    // Enqueue children (unless already explored)
    successors.forEach(([child, _]) => {
      if (!explored.has(child.id)) {
        queue.push({ node: child, depth: depth + 1 })
      }
    })
  }

  return results
}

export function getNodesForEdge<N extends { id: string }, E extends { source: string; target: string }>(
  nodes: N[],
  edge: E,
) {
  const source = getNodeById(nodes, edge.source)
  const target = getNodeById(nodes, edge.target)
  return { source, target }
}

export function getNodeById<N extends { id: string }>(nodes: N[], id: string): N {
  const node = nodes.find((node) => node.id === id)
  if (!node) {
    throw new Error(`Node '${id}' not found`)
  }
  return node
}

export function getParents<N extends { id: string }, E extends { source: string; target: string }>(
  nodeId: string,
  nodes: N[],
  edges: E[],
): [N, E][] {
  // Parent nodes are source nodes of edges where this node is the target
  return edges
    .filter((edge) => nodeId === edge.target)
    .flatMap((edge) => {
      const parents = nodes.filter((node) => node.id === edge.source)
      const pairs: [N, E][] = parents.map((parent) => [parent, edge])
      return pairs
    })
}

export function getChildren<N extends { id: string }, E extends { source: string; target: string }>(
  nodeId: string,
  nodes: N[],
  edges: E[],
): [N, E][] {
  // Child nodes are target nodes of edges where this node is the source
  return edges
    .filter((edge) => nodeId === edge.source)
    .flatMap((edge) => {
      const children = nodes.filter((node) => node.id === edge.target)
      const pairs: [N, E][] = children.map((node) => [node, edge])
      return pairs
    })
}

export function getSiblings<N extends { id: string }, E extends { source: string; target: string }>(
  nodeId: string,
  nodes: N[],
  edges: E[],
): N[] {
  // Sibling nodes are all the child nodes of all parents
  return getParents(nodeId, nodes, edges).flatMap(([parent, _]) =>
    getChildren(parent.id, nodes, edges).map(([child, _]) => child),
  )
}

export function getRoots<N extends { id: string }, E extends { source: string; target: string }>(
  nodes: N[],
  edges: E[],
) {
  // Roots are the nodes that have no parents, i.e. they are the nodes which are never the target of an edge
  const targetNodeIds = new Set(edges.map((edges) => edges.target))
  return nodes.filter((node) => !targetNodeIds.has(node.id))
}

export function getLeaves<N extends { id: string }, E extends { source: string; target: string }>(
  nodes: N[],
  edges: E[],
) {
  // Leaves are the nodes that have no children, i.e. they are the nodes which are never the source of an edge
  const sourceNodeIds = new Set(edges.map((edges) => edges.source))
  return nodes.filter((node) => !sourceNodeIds.has(node.id))
}
