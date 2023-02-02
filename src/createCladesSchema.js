import * as d3 from 'd3'

export function createCladesSchema(svgElem, clades, options) {
  const { margin, width, height } = options

  const svg = d3.select(svgElem)
  svg.selectAll('*').remove()

  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  svg = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // declares a tree layout and assigns the size
  const treemap = d3.tree().size([height, width])

  // Assigns parent, children, height, depth
  const root = d3.hierarchy(clades, (d) => d.children)
  root.x0 = height / 2
  root.y0 = 0

  const i = 0

  update(root)

  function update(source) {
    // Assigns the x and y position for the nodes
    const treeData = treemap(root)

    // Compute the new tree layout.
    const nodes = treeData.descendants()
    const links = treeData.descendants().slice(1)

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 240
    })

    // ****************** Nodes section ***************************

    // Update the nodes...
    const node = svg.selectAll('g.node').data(nodes, (d) => d.id || (d.id = ++i))

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${source.y0},${source.x0})`)

    // Add Circle for the nodes
    nodeEnter
      .append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style('fill', (d) => d3.rgb(d.data.color).brighter(0.2))
      .style('stroke', (d) => d3.rgb(d.data.color).darker(0.2))

    // Add labels for the nodes
    nodeEnter
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => (d.children || d._children ? -20 : 20))
      .attr('text-anchor', (d) => (d.children || d._children ? 'end' : 'start'))
      .attr('fill', '#777')
      .attr('font-weight', '700')
      .text((d) => d.data.name)

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node)

    // Transition to the proper position for the node
    nodeUpdate.attr('transform', (d) => `translate(${d.y},${d.x})`)

    // Update the node attributes and style
    nodeUpdate
      .select('circle.node')
      .attr('r', 15)
      .style('fill', (d) => d3.rgb(d.data.color).brighter(0.2))
      .style('stroke', (d) => d3.rgb(d.data.color).darker(0.2))

    // Remove any exiting nodes
    const nodeExit = node
      .exit()
      .attr('transform', (d) => `translate(${source.y},${source.x})`)
      .remove()

    // On exit reduce the node circles size to 0
    nodeExit.select('circle').attr('r', 1e-6)

    // On exit reduce the opacity of text labels
    nodeExit.select('text').style('fill-opacity', 1e-6)

    // ****************** links section ***************************

    // Update the links...
    const link = svg.selectAll('path.link').data(links, (d) => d.id)

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', '3px')
      .attr('d', (d) => {
        const o = { x: source.x0, y: source.y0 }
        return diagonal(o, o)
      })
    // .remove()

    // UPDATE
    const linkUpdate = linkEnter.merge(link)

    // Transition back to the parent element position
    linkUpdate.attr('d', (d) => diagonal(d, d.parent))

    // Remove any exiting links
    const linkExit = link
      .exit()
      .attr('d', (d) => {
        const o = { x: source.x, y: source.y }
        return diagonal(o, o)
      })
      .remove()

    // Store the old positions for transition.
    nodes.forEach((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`
    }
  }
}
