import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'

import { useRef, useEffect, useState } from 'react'

import CrossPayClient from '../lib/CrossPayClient'

//const client = new CrossPayClient('http://localhost:3001')
const client = new CrossPayClient('https://crosspay-server.onrender.com')

type Props = Readonly<{
  setAccount(account: string): void
}>

export default function QRLogin({ setAccount }: Props) {

  const loginQrRef = useRef<HTMLDivElement>(null)

  const loginSessionCreated = useRef(false)

  useEffect(() => {

    if(loginSessionCreated.current) {
      return
    } else {
      loginSessionCreated.current = true
    }
    
    (async () => {
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
  }, [setAccount])

  return  (
    <div id="main">
      <p>Scan QR code to log in</p>
      <div ref={loginQrRef} />
    </div>
  )
}
