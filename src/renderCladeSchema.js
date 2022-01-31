// import * as fs from 'fs'
// import { createElement, useCallback, useRef } from 'react'
//
// // @ts-ignore
// import { renderToStaticMarkup } from 'react-dom/cjs/react-dom-server.node.production.min.js'
//
// // import * as d3 from 'd3'
// import { JSDOM } from 'jsdom'

// // @ts-ignore
// import { NextstrainCladesSchema } from './components/NextstrainCladesSchema.tsx'
//
// // export function NextstrainCladesSchemaForServer() {
// //   const d3Ref = useRef<SVGSVGElement>(null)
// //   return <NextstrainCladesSchema d3Ref={d3Ref} />
// // }
// //
//
// // <NextstrainCladesSchemaForServer />
//
// // @ts-ignore
// const rendered = renderToStaticMarkup(createElement(NextstrainCladesSchema, {}, null))
// console.log(rendered)

// const { createCladesSchema } = require('./createCladesSchema')

// const { JSDOM } = require('jsdom')
// import { JSDOM } from 'jsdom'
import { createCladesSchema } from '/workdir/src/createCladesSchema.js'
import fs from 'fs-extra'

import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'
const window = createSVGWindow()
const document = window.document

// register window and document
registerWindow(window, document)

const clades = fs.readJsonSync('src/clades.json')

let width = 400
let height = 300

const margin = { top: 50, right: 50, bottom: 0, left: 50 }
width = 1000 - margin.left - margin.right
height = 600 - margin.top - margin.bottom
const options = { margin, width, height }

// const dom = new JSDOM(
//   `
// <!DOCTYPE html>
//   <body>
//     <svg xmlns="http://www.w3.org/2000/svg"
//       class="d3-component"
//       style="fontFamily: 'sans-serif'; fontSize: '1.25rem'"
//       viewBox='-70 0 ${width - 70} ${height}'}
//     />
//   </body>
// </html>
// `,
//   {
//     pretendToBeVisual: true,
//     contentType: 'text/html',
//     includeNodeLocations: true,
//     resources: 'usable',
//     runScripts: 'dangerously',
//   },
// )
//
// global.window = dom.window
// global.document = dom.window.document

const canvas = SVG(document.documentElement)

console.log(canvas.dom)

global.document = document

// let body = d3.select(dom.window.document.querySelector('.d3-component'))

// console.log(document.querySelector('svg'))

// const svg = dom.window.document.querySelector('.d3-component')

// document.querySelector('svg')

createCladesSchema(canvas.node, clades, options)
// console.log(svg.outerHTML)

// var jsdom = require('jsdom')
//
// jsdom.env('<html><body></body></html>', ['http://d3js.org/d3.v3.min.js'], function (err, window) {
//   var svg = window.d3.select('body').append('svg').attr('width', 100).attr('height', 100)
//
//   svg.append('rect').attr('x', 10).attr('y', 10).attr('width', 80).attr('height', 80).style('fill', 'orange')
//   // PRINT OUT:
//   console.log(window.d3.select('body').html())
//   //  fs.writeFileSync('out.svg', window.d3.select("body").html()); // or this
// })
