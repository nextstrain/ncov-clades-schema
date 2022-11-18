import { max, min, cloneDeep } from 'lodash'
import { horizontalSeparationBetweenNodes, nodeRadius } from '../components/constants'

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

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

export function calculateGraphLayout(graph_: Graph, width: number, height: number): Graph {
  const graph = cloneDeep(graph_)

  // Position roots at the left of viewport
  const roots = getRoots(graph)
  roots.forEach((root) => {
    root.x = nodeRadius / 2
  })

  traverseBreadthFirst(graph, ({ node, children, parents, siblings, isLeaf, isRoot, depth }) => {
    children.forEach(([child, _]) => {
      // Spread nodes across horizontal axis
      // TODO: calculate separation dynamically from viewport width
      child.x = node.x + nodeRadius / 2 + horizontalSeparationBetweenNodes
    })
    return node
  })

  // Spread leaves along vertical axis
  const leaves = getLeaves(graph)
  const leafSpacing = height / (leaves.length - 1)
  leaves.forEach((leaf, i) => {
    leaf.y = i * (leafSpacing - nodeRadius)
  })

  // Spread parents in the vertical space defined by their children
  traverseBreadthFirstBackwards(graph, ({ node, children, parents, siblings, isLeaf, isRoot, depth }) => {
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
  })

  console.log(require('util').inspect(graph.nodes, { colors: true, depth: null, maxArrayLength: null }))

  return graph
}

export interface ExplorerParams {
  node: GraphNode
  children: [GraphNode, GraphEdge][]
  parents: [GraphNode, GraphEdge][]
  siblings: GraphNode[]
  isLeaf: boolean
  isRoot: boolean
  depth: number
}

// Explore graph in breadth-first fashion given an explorer function.
export function traverseBreadthFirst<T>(
  graph: Graph,
  explorer: (params: ExplorerParams) => T,
  options?: { backward?: boolean },
): T[] {
  // First frontier is all the roots or all the leaves depending on direction of traversal
  const frontier = options?.backward ? getLeaves(graph) : getRoots(graph)

  // Fill queue with the first frontier
  const queue: { node: GraphNode; depth: number }[] = frontier.map((node) => ({ node, depth: 0 }))

  // Mark first frontier as explored
  const explored = new Set<string>(frontier.map((node) => node.id))

  const results: T[] = []

  while (queue.length > 0) {
    const item = queue.shift()
    if (!item) {
      return results
    }

    const { node, depth } = item

    let parents: [GraphNode, GraphEdge][] = getParents(graph, node.id)
    parents = !options?.backward ? parents.reverse() : parents

    let children: [GraphNode, GraphEdge][] = getChildren(graph, node.id)
    children = !options?.backward ? children.reverse() : children

    let siblings: GraphNode[] = getSiblings(graph, node.id)
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

// Explore graph in breadth-first fashion, backwards
export function traverseBreadthFirstBackwards<T>(
  graph: Graph,
  explorer: (params: ExplorerParams) => T,
  options?: { backward?: boolean },
): T[] {
  return traverseBreadthFirst(graph, explorer, { ...options, backward: true })
}

export function getNodesForEdge(graph: Graph, edge: GraphEdge) {
  const source = getNodeById(graph, edge.source)
  const target = getNodeById(graph, edge.target)
  return { source, target }
}

export function getNodeById(graph: Graph, id: string): GraphNode {
  const node = graph.nodes.find((node) => node.id === id)
  if (!node) {
    throw new Error(`Node '${id}' not found`)
  }
  return node
}

export function getParents(graph: Graph, nodeId: string): [GraphNode, GraphEdge][] {
  // Parent nodes are source nodes of edges where this node is the target
  return graph.edges
    .filter((edge) => nodeId === edge.target)
    .flatMap((edge) => {
      const parents = graph.nodes.filter((node) => node.id === edge.source)
      const pairs: [GraphNode, GraphEdge][] = parents.map((parent) => [parent, edge])
      return pairs
    })
}

export function getChildren(graph: Graph, nodeId: string): [GraphNode, GraphEdge][] {
  // Child nodes are target nodes of edges where this node is the source
  return graph.edges
    .filter((edge) => nodeId === edge.source)
    .flatMap((edge) => {
      const children = graph.nodes.filter((node) => node.id === edge.target)
      const pairs: [GraphNode, GraphEdge][] = children.map((node) => [node, edge])
      return pairs
    })
}

export function getSiblings(graph: Graph, nodeId: string): GraphNode[] {
  // Sibling nodes are all the child nodes of all parents
  return getParents(graph, nodeId).flatMap(([parent, _]) => getChildren(graph, parent.id).map(([child, _]) => child))
}

export function getRoots(graph: Graph) {
  // Roots are the nodes that have no parents, i.e. each node which is never a target of an edge
  const targetNodeIds = new Set(graph.edges.map((edge) => edge.target))
  return graph.nodes.filter((node) => !targetNodeIds.has(node.id))
}

export function getLeaves(graph: Graph) {
  // Leaves are the nodes that have no children, i.e. each node which is never a source of an edge
  const sourceNodeIds = new Set(graph.edges.map((edge) => edge.source))
  return graph.nodes.filter((node) => !sourceNodeIds.has(node.id))
}
