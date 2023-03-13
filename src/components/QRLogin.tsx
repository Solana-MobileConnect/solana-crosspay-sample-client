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
  console.log(loginQrRef.current)

  const loginSessionCreated = useRef(false)

  useEffect(() => {

    if(loginSessionCreated.current) {
      return
    } else {
      loginSessionCreated.current = true
    }
    
    (async () => {
      await client.newLoginSession()
    
      const loginQr = client.getLoginQr()

      if (loginQrRef.current) {
        loginQrRef.current.innerHTML = ''
        loginQr.append(loginQrRef.current)
      }

    })().then(null, console.error)
  }, [])

  return  (
    <div>
      <div>Scan QR code to log in</div>
      <div ref={loginQrRef} />
    </div>
  )
}
