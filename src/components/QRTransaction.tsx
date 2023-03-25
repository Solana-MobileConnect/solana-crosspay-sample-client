import { useRef, useEffect, useState } from 'react'
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionInstruction } from "@solana/web3.js"

import CrossPayClient from '../lib/CrossPayClient'

import { v4 as uuid } from 'uuid'

const RECEIVER_ACCOUNT = '77Dn6Xm3MjpUyyAh318WtHFvAcLSPrwUChLbpM2Ngnm3'

type Props = Readonly<{
  account: string
}>

//const client = new CrossPayClient('http://localhost:3001')
const client = new CrossPayClient('https://crosspay-server.onrender.com')

export default function QRTransaction({ account }: Props) {

  const txQrRef = useRef<HTMLDivElement>(null)

  const [txSig, setTxSig] = useState<string | undefined>(undefined)
  const [txState, setTxState] = useState<string | undefined>(undefined)

  const txSessionCreated = useRef(false)

  useEffect(() => {

    if(txSessionCreated.current) {
      return
    } else {
      txSessionCreated.current = true
    }
    
    (async () => {

      const connection = new Connection(clusterApiUrl('devnet'))

      const tx = new Transaction()

      tx.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey(RECEIVER_ACCOUNT),
          lamports: LAMPORTS_PER_SOL * 0.01
        })
      )

      tx.add(
        new TransactionInstruction({
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          keys: [],
          data: Buffer.from(uuid(), 'utf-8')
        })
      )

      tx.feePayer = new PublicKey(account)

      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash

      const txSessionId = await client.newTransactionSession(tx, state => {
        console.log("TX state:", state)

        setTxState(state['state'])

        if('signature' in state) {
          setTxSig(state['signature'])
        }
        
        if('err' in state && state['err'] != null) {
          console.log("Transaction error:", state['err'])
        }
      })
    
      const txQr = client.getTransactionQr(txSessionId)

      if (txQrRef.current) {
        txQrRef.current.innerHTML = ''
        txQr.append(txQrRef.current)
      }

    })().then(null, console.error)
  }, [account])

  return  (
    <div id="main">
      <p>
        Logged in as <b>{account}</b>
      </p>

      <p>
        Scan this QR code to perform a transaction (send 0.01 SOL to a devnet account)
      </p>
      <div ref={txQrRef} />
      <p>State of Transaction: <b>{txState}</b></p>
      <p>Transaction signature: <b>{txSig}</b></p>
    </div>
  )
}
