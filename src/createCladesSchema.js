import {tree, hierarchy} from 'd3-hierarchy'
import {rgb} from 'd3-color'

import {writeFile, readFileSync} from "fs";
import path from "path";
import {fileURLToPath} from 'url';

// Creates a curved (diagonal) path from parent to the child nodes
const diagonal = (s, d) => `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`;

export function renderSVG(clades, options) {
  const {margin, width, height} = options

  const treemap = tree().size([height, width])
  const root = hierarchy(clades, (d) => d.children)

  // Assigns the x and y position for the nodes
  const treeData = treemap(root)

  // Find bounding-box of node coordinates
  let x0 = Infinity;
  let x1 = -x0;
  let y0 = Infinity;
  let y1 = -y0;
    root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;

    if (d.y > y1) y1 = d.y;
    if (d.y < y0) y0 = d.y;
  });


  const nodes = treeData.descendants()
  const links = treeData.descendants().slice(1)

  const nodeString = nodes.map(d => `
  <g transform="translate(${d.y},${d.x})" class="node">
      <circle class="node" r="15" fill="${rgb(d.data.color).brighter(0.2)}" stroke="${rgb(d.data.color).darker(0.2)}" />
      <text dy=".35em" x="${(d.children || d._children ? -20 : 20)}" text-anchor="${(d.children || d._children ? 'end' : 'start')}" fill="#777" font-weight="700">${d.data.name}</text>
  </g>
  `).join("");

  const linkString = links.map(d => `
  <path fill="none" stroke="#ccc" stroke-width="3px" d="${diagonal(d, d.parent)}"> </path>
  `).join("");

  const svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 ${x0-margin.top} ${y1 - y0 + margin.left + margin.right} ${x1 - x0 + margin.top + margin.bottom}">
<g transform="translate(${margin.left},${margin.top})">
${linkString}
${nodeString}
</g>
</svg>
    `;

  return svgString;
}

// N.B. increase the left or right margins if clade names get longer and are truncated
const margin = {top: 0, right: 200, bottom: 0, left: 75}

// N.B. should only need to change width/height if you want to change the aspect ratio
const width = 1000
const height = 600

const options = {margin, width, height}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clades = JSON.parse(readFileSync(path.resolve(__dirname, "./clades.json"), 'utf-8'))
const svgString = renderSVG(clades, options);
writeFile(path.resolve(__dirname, "../clades.svg"), svgString, () => null);
