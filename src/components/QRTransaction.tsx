import { useRef, useEffect, useState } from 'react'

type Props = Readonly<{
  account: string
}>

export default function QRTransaction({ account }: Props) {

  const txQrRef = useRef<HTMLDivElement>(null)

  const [txSig, setTxSig] = useState<string | undefined>(undefined)

  return  (
    <div>
      <div>
        Logged in as {account}
      </div>
      {
        !txSig ? 
          <>
            <div>
              Scan this QR code to perform a transaction (send 0.01 SOL to a devnet account)
            </div>
            <div ref={txQrRef} />
          </>
          :
          <div>
            Transaction confirmed ✅: {txSig}
          </div>
      }
    </div>
  )
}
