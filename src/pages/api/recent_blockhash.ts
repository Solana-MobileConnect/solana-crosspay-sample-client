import { Connection } from "@solana/web3.js"

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cluster = req.query.cluster

  if(!cluster) {
    res.status(400).send('Cluster is required')
    return
  }

  let url;

  if(cluster == 'devnet') {
    url = 'https://api.devnet.solana.com'
  } else if(cluster == 'mainnet-beta') { 
    url = 'https://solana-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY;
  } else {
    res.status(400).send('Invalid cluster')
    return
  }

  const connection = new Connection(url)
  const latestBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  res.status(200).send(latestBlockhash)
}
