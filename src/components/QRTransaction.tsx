import { useRef, useEffect, useState } from 'react'
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionInstruction, Cluster } from "@solana/web3.js"

import CrossPayClient from '../lib/CrossPayClient'

import { v4 as uuid } from 'uuid'

const RECEIVER_ACCOUNT = '4Z9jDh3yJ8Grz2Y1BnQXQpj2RUA3zLTniM2hcsaqmhm6'

type Props = Readonly<{
  account: string,
  network: string,
  setAccount(account: string): void,
}>

export default function QRTransaction({ account, network, setAccount }: Props) {

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

    const client = new CrossPayClient('https://crosspay-server.onrender.com', network as Cluster);
    
    (async () => {

      const tx = new Transaction()

      tx.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey(RECEIVER_ACCOUNT),
          lamports: LAMPORTS_PER_SOL * 0.001
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

      const response = await fetch(`/api/recent_blockhash?cluster=${network}`)
      const blockhash = await response.text()
      console.log("Blockhash:", blockhash)
      tx.recentBlockhash = blockhash

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
  }, [account, network])

  return  (
    <div id="main">
      <h1>CrossPay sample client</h1>
      <h2>Execute a transaction</h2>
      <p>
        Logged in as <b>{account}</b>!
      </p>
      <p>Network: <b>{network}</b></p>
      <p>Transaction: <b>Send 0.001 SOL to {RECEIVER_ACCOUNT.slice(0,10) + "..."}</b></p>
      <p>
        Scan this QR code to execute it
      </p>
      <div className="qr-code" ref={txQrRef}>
        Generating...
      </div>
      <p>State of Transaction: <b>{txState}</b></p>
      <p>Transaction signature: <b>{txSig ? txSig : "Waiting..."}</b></p>
      {
        txSig &&
        <p><a target="_blank" href={`https://explorer.solana.com/tx/${txSig}?cluster=${network}`}>View in Explorer</a></p>
      }
      <p><a href="#" onClick={() => setAccount(undefined)}>Reset</a></p>
    </div>
  )
}
