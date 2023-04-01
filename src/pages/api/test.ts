
import { NextApiRequest, NextApiResponse } from "next";
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionInstruction, Cluster } from "@solana/web3.js"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    console.log("Test")

  const connection = new Connection(clusterApiUrl('mainnet-beta'))

  const latestBlockhash = await connection.getLatestBlockhash()
  
  res.status(200).json({blockhash: latestBlockhash})

}