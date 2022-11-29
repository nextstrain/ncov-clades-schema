import { max, min, cloneDeep, sumBy, meanBy, last, first, minBy } from 'lodash'
import { horizontalSeparationBetweenNodes, nodeRadius } from '../components/constants'

export interface GraphRaw {
  nodes: GraphNodeRaw[]
  edges: GraphEdge[]
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphNodeRaw {
  id: string
  clade: string
  lineages?: string[]
  who?: string
  version?: string
  otherNames?: string[]
  color?: string
}

export interface GraphNode extends GraphNodeRaw {
  x: number
  y: number
  layout: {
    numLeaves: number
    meanDepth: number
    minDepth: number
    maxDepth: number
    meanRank: number
    minRank: number
    maxRank: number
    yTBarStart: number
    xTBarStart: number
    yTBarEnd: number
    xTBarEnd: number
  }
}

export function convertNodeToInternal(nodeRaw: GraphNodeRaw): GraphNode {
  return {
    ...nodeRaw,
    x: 0,
    y: 0,
    layout: {
      numLeaves: 0,
      meanDepth: 0,
      minDepth: 0,
      maxDepth: 0,
      meanRank: 0,
      minRank: 0,
      maxRank: 0,
      yTBarStart: 0,
      xTBarStart: 0,
      yTBarEnd: 0,
      xTBarEnd: 0,
    },
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export function calculateGraphLayout(graphRaw: GraphRaw, width: number, height: number): Graph {
  const graph: Graph = { ...cloneDeep(graphRaw), nodes: graphRaw.nodes.map(convertNodeToInternal) }

  let rank = 0
  traverseDepthFirstPostOrder(graph, ({ node, children, parents, siblings, isLeaf, isRoot }) => {
    if (isLeaf) {
      node.layout.numLeaves = 1
      rank += 1
      node.layout.meanRank = rank
      node.layout.minRank = rank
      node.layout.maxRank = rank
    } else {
      node.layout.numLeaves = sumBy(children, ([child, _]) => child.layout.numLeaves)
      node.layout.meanRank = meanBy(children, ([child, _]) => child.layout.meanRank)
      node.layout.minRank = min(children.map(([child, _]) => child.layout.meanRank)) ?? 0
      node.layout.maxRank = max(children.map(([child, _]) => child.layout.meanRank)) ?? 0
    }
    return node
  })

  traverseDepthFirstPreOrder(graph, ({ node, children, parents, siblings, isLeaf, isRoot }) => {
    if (isRoot) {
      node.layout.meanDepth = 0
      node.layout.maxDepth = 0
      node.layout.minDepth = 0
    } else {
      node.layout.meanDepth = meanBy(parents, ([parent]) => parent.layout.meanDepth) + 1
      node.layout.minDepth = (min(parents.map(([parent, _]) => parent.layout.meanDepth)) ?? 0) + 1
      node.layout.maxDepth = (max(parents.map(([parent, _]) => parent.layout.meanDepth)) ?? 0) + 1
    }
    return node
  })

  traverseDepthFirstPreOrder(graph, ({ node, children, parents, siblings, isLeaf, isRoot }) => {
    node.y = node.layout.meanRank * 40
    node.x = node.layout.meanDepth * 100
    if (!isLeaf) {
      node.layout.yTBarStart = node.layout.minRank
      node.layout.xTBarStart = node.layout.meanDepth
      node.layout.yTBarEnd = node.layout.maxRank
      node.layout.xTBarEnd = node.layout.meanDepth
    }
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
    const result = explorer({ node, children, parents, siblings, isLeaf, isRoot })
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

export enum DepthFirstTraversalOrder {
  Pre,
  Post,
}

// Explore graph in breadth-first fashion, backwards
export function traverseBreadthFirstBackwards<T>(
  graph: Graph,
  explorer: (params: ExplorerParams) => T,
  options?: { backward?: boolean },
): T[] {
  return traverseBreadthFirst(graph, explorer, { ...options, backward: true })
}

// Explore graph in depth-first pre-order fashion
export function traverseDepthFirstPreOrder<T>(graph: Graph, explorer: (params: ExplorerParams) => T) {
  const results: T[] = []
  const explored = new Set<string>()
  return getRoots(graph).forEach((node) => {
    traverseDepthFirstRecursively(graph, node, explorer, results, explored, DepthFirstTraversalOrder.Pre)
  })
  return results
}

// Explore graph in depth-first post-order fashion
export function traverseDepthFirstPostOrder<T>(graph: Graph, explorer: (params: ExplorerParams) => T) {
  const results: T[] = []
  const explored = new Set<string>()
  return getRoots(graph).forEach((node) => {
    traverseDepthFirstRecursively(graph, node, explorer, results, explored, DepthFirstTraversalOrder.Post)
  })
  return results
}

// Implements graph traversal in depth-first pre-order or post-order fashion. Recursive implementation.
function traverseDepthFirstRecursively<T>(
  graph: Graph,
  node: GraphNode,
  explorer: (params: ExplorerParams) => T,
  results: T[],
  explored: Set<string>,
  order: DepthFirstTraversalOrder,
) {
  const parents: [GraphNode, GraphEdge][] = getParents(graph, node.id)
  const children: [GraphNode, GraphEdge][] = getChildren(graph, node.id)
  const siblings: GraphNode[] = getSiblings(graph, node.id)
  const isLeaf = children.length === 0 // Leaf is the node that has no children
  const isRoot = parents.length === 0 // Root is the node that has no parents

  // Explore current node if pre-order
  if (order === DepthFirstTraversalOrder.Pre) {
    explored.add(node.id)
    results.push(explorer({ node, children, parents, siblings, isLeaf, isRoot }))
  }

  // Explore child nodes recursively
  children.forEach(([child]) => traverseDepthFirstRecursively(graph, child, explorer, results, explored, order))

  // Explore current node if post-order
  if (order === DepthFirstTraversalOrder.Post) {
    explored.add(node.id)
    results.push(explorer({ node, children, parents, siblings, isLeaf, isRoot }))
  }
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
