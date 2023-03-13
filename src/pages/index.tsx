import { useState } from 'react'
import Head from 'next/head'

import QRLogin from '../components/QRLogin'
import QRTransaction from '../components/QRTransaction'

export default function Home() {

  const [account, setAccount] = useState<string | undefined>(undefined)

  return (
    <>
      <Head>
        <title>CrossPay Client</title>
      </Head>
      {
        !account ?
          <QRLogin setAccount={setAccount} /> :
          <QRTransaction account={account} /> 
      }
    </>
  )
}
