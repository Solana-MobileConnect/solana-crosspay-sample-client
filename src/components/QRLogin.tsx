import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'

import { useRef, useEffect, useState } from 'react'

import CrossPayClient from '../lib/CrossPayClient'

type Props = Readonly<{
  setAccount(account: string): void,
  network: string,
  setNetwork(network: string): void,
}>

export default function QRLogin({ setAccount, network, setNetwork }: Props) {

  const loginQrRef = useRef<HTMLDivElement>(null)

  const loginSessionCreated = useRef(false)

  useEffect(() => {

    if(loginSessionCreated.current) {
      return
    } else {
      loginSessionCreated.current = true
    }
    
    (async () => {

      //const client = new CrossPayClient('http://localhost:3001')
      const client = new CrossPayClient('https://crosspay-server.onrender.com', network)

      await client.newLoginSession(public_key => {
        console.log("Logged in:", public_key)
        setAccount(public_key)
      })
    
      const loginQr = client.getLoginQr()

      if (loginQrRef.current) {
        loginQrRef.current.innerHTML = ''
        loginQr.append(loginQrRef.current)
      }

    })().then(null, console.error)
  }, [setAccount, network])

  return  (
    <div id="main">
      <h1>CrossPay sample client</h1>
      <h2>Logging in</h2>
      <p>Open a wallet that supports Solana Pay (Phantom, Solflare, Glow etc.) on your phone</p>
      {
         <p>Choose a network: <b>{network}</b> (<a onClick={() => setNetwork(network == 'devnet' ? 'mainnet-beta' : 'devnet')} href="#">switch</a>)</p>
      }
      <p>Make sure you selected the right network on your phone!</p>
      <p>Scan the QR code below to log in:</p>
      <div className="qr-code" ref={loginQrRef} />
    </div>
  )
}
