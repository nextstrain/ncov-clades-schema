import { omit, sortBy } from 'lodash'
import fs from 'fs-extra'

main().catch(console.error)

export interface OldNode {
  color: string
  name: string
  children?: OldNode[]
}

export interface GraphNode extends Omit<OldNode, 'children' | 'name'> {
  id: string
  clade: string
  lineages?: string[]
  who?: string
  version?: string
  otherNames?: string[]
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export async function main() {
  const cladesJson = await fs.readJSON('src/clades.json')

  let nodes: GraphNode[] = []
  let edges: GraphEdge[] = []
  flattenCladeTree(cladesJson, nodes, edges)
  nodes = sortBy(nodes, (node) => node.clade)

  verifyGraph(nodes, edges)

  console.log(require('util').inspect({ nodes, edges }, { colors: true, depth: null, maxArrayLength: null }))

  fs.writeJson('src/clades2.json', { nodes, edges }, { spaces: 2 })
}

// Convert tree node hierarhy into flat lists of nodes and edges
function flattenCladeTree(node: OldNode, nodes: GraphNode[], edges: GraphEdge[]) {
  const { clade, lineages, who, version, otherNames } = splitName(node.name)

  const id = node.name

  nodes.push({
    id,
    color: node.color,
    clade,
    lineages,
    who,
    version,
    otherNames,
  })

  const children = node.children ?? []

  children.forEach((child) => {
    edges.push({ id: edges.length.toString(), source: node.name, target: child.name })
    flattenCladeTree(child, nodes, edges)
  })
}

function splitName(name: string) {
  // Extract clade (outside parentheses) and details string (the thing in parenteses)
  const matches = name.match(/^(?<clade>.*?)( \((?<details>[^)]*)\))?$/)
  if (!matches) {
    throw new Error(`Unable to parse name '${name}'`)
  }

  const clade = matches.groups?.clade
  if (!clade) {
    throw new Error(`Unable to extract clade from name '${name}'`)
  }

  const details = matches.groups?.details
  if (!details) {
    return { clade }
  }

  // Decompose details string (the thing in parenteses),
  // for example "(B.1)", "(Omicron, B.1.1.529), "(Beta, V2, B.1.351)", "(EU1)""
  const components = details.split(',').map((component) => component.trim())
  if (components.length === 0) {
    throw new Error(`Unable to make sense of the name '${name}': details string is present but is empty`)
  }

  const who = findExactlyOne(components, isWhoVariant)
  const version = findExactlyOne(components, isVersion)
  const lineages = components.filter((c) => isPangoLineage(c))
  const otherNames = components.filter((c) => c != who && c != version && !lineages.includes(c))
  return { clade, lineages, who, version, otherNames }

  throw new Error(
    `Unable to make sense of the name '${name}': details string does not follow any known format: '${details}'`,
  )
}

function isPangoLineage(s: string) {
  return s.match(/^(\~)?(A|B|C|D|BA|BQ|P|XBB|)(\.\d+?(\/\d+)?)*$/) !== null
}

function isWhoVariant(s: string) {
  return !WHO_EXCEPTIONS.includes(s) && GREEK_LETTERS.includes(s)
}

function isVersion(s: string) {
  return s.match(/^V\d$/) !== null
}

const GREEK_LETTERS = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'Rho',
  'Sigma',
  'Tau',
  'Upsilon',
  'Phi',
  'Chi',
  'Psi',
  'Omega',
]

const WHO_EXCEPTIONS = ['EU1']

function findExactlyOne(components: string[], predicate: (s: string) => boolean) {
  const candidates = components.filter(predicate)
  if (candidates.length > 1) {
    throw new Error(`Expected to find exactly one element, but found: ${candidates.map((s) => `"${s}"`).join(',')}`)
  }
  return candidates[0]
}

function verifyGraph(nodes: GraphNode[], edges: GraphEdge[]) {
  edges.forEach((edge) => {
    if (edge.target == edge.source) {
      throw new Error(`Graph is invalid: invalid edge: the target node '${edge.target}' is the same as source node`)
    }

    if (!nodes.find((node) => edge.target == node.id)) {
      throw new Error(`Graph is invalid: invalid edge: the target node '${edge.target}' does not exist`)
    }

    if (!nodes.find((node) => edge.source == node.id)) {
      throw new Error(`Graph is invalid: invalid edge: the source node '${edge.source}' does not exist`)
    }
  })
}
