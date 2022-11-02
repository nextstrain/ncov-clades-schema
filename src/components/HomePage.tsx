import React, { useRef } from 'react'
import Head from 'next/head'
import { useResizeDetector } from 'react-resize-detector'
import { SaveMarkupButton } from 'src/components/SaveMarkupButton'
import styled, { createGlobalStyle } from 'styled-components'
import { NextstrainCladeTreeSvg } from 'src/components/NextstrainCladeTreeSvg'
import { Container, Row, Col } from 'reactstrap'

import cladesJson from '../clades.json'

const GlobalStyle = createGlobalStyle`
  html, body, #__next {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
  }
`

const CladeSchemaFigure = styled.figure`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
`

const CladeSchemaPicture = styled.picture`
  display: block;
  width: 1200px;
  height: 800px;
  margin: 0;
  padding: 0;
  border: none;
`

const CladeSchemaFigcaption = styled.figcaption`
  font-family: sans-serif;
`

export function HomePage() {
  const svgRef = useRef<SVGSVGElement>(null)

  const {
    width,
    height,
    ref: pictureRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  return (
    <>
      <Head>
        <title>{'Nextstrain clades'}</title>
        <meta name="description" content="Nextstrain clades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GlobalStyle />

      <Container>
        <Row>
          <Col>
            <CladeSchemaFigure>
              <CladeSchemaPicture ref={pictureRef}>
                <NextstrainCladeTreeSvg cladesJson={cladesJson} width={1200} height={800} innerRef={svgRef} />
              </CladeSchemaPicture>
              <CladeSchemaFigcaption>
                {'Phylogenetic relationships of Nextstrain SARS-CoV-2 clades'}
              </CladeSchemaFigcaption>
            </CladeSchemaFigure>
          </Col>
        </Row>

        <Row>
          <Col>
            <SaveMarkupButton text="Save to SVG" targetRef={svgRef} />
          </Col>
        </Row>
      </Container>
    </>
  )
}
