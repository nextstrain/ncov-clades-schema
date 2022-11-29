import React from 'react'

import { ServerStyleSheet } from 'styled-components'
import NextDocument, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

import { createGlobalStyle } from 'styled-components'

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({ enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />) })

      const initialProps = await NextDocument.getInitialProps(ctx)

      const styles = [initialProps.styles, sheet.getStyleElement()]

      return {
        ...initialProps,
        styles,
      }
    } finally {
      sheet.seal()
    }
  }
}
