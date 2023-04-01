import { useState, useCallback } from 'react'
import Head from 'next/head'

import QRLogin from '../components/QRLogin'
import QRTransaction from '../components/QRTransaction'

export default function Home() {

  const [account, setAccount] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<string>('devnet')
  
  // Testing
  //const [account, setAccount] = useState<string | undefined>('HDqxxSCNY5goEtFxMJqN7wkXKNMDfxAFiSXhQ1wcg2pV')
  
  const baseReset = useCallback(() => {
    setAccount(undefined)
    setNetwork('devnet')
  }, [setAccount, setNetwork])

  return (
    <>
      <Head>
        <title>CrossPay sample client</title>
      </Head>
      {
        !account ?
          <QRLogin setAccount={setAccount} network={network} setNetwork={setNetwork}/> :
          <QRTransaction account={account} network={network} setAccount={setAccount} baseReset={baseReset}/> 
      }
    </>
  )
}
