import React from 'react'

import Head from 'next/head'

import { NextstrainCladesSchemaWrapped } from '../components/NextstrainCladesSchemaWrapped'

export default function Home() {
  return (
    <div>
      <Head>
        <title>{'Nextstrain clades'}</title>
        <meta name="description" content="Nextstrain clades" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NextstrainCladesSchemaWrapped />
    </div>
  )
}
