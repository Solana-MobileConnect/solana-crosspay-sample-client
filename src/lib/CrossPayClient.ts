import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'
import { Transaction } from '@solana/web3.js'

type TransactionState = {
  state: "init" | "requested" | "timeout" | "confirmed" | "finalized",
  err?: string | null,
  signature?: string
}


export default class CrossPayClient {
  static pollingInterval = 1000

  loginCallback: ((public_key: string) => void) | undefined
  loginSessionId: string | undefined
  transactionSessions: { [index: string]: any }
  host: string

  constructor(host : string) {
    this.host = host

    this.loginCallback = undefined

    this.transactionSessions = {}

    setInterval(() => this.poll().then(null, console.error), CrossPayClient.pollingInterval)
  }

  async newLoginSession(loginCallback: (public_key: string) => void) {

    const responseRaw = await fetch(this.host + '/login_session', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })

    const response = await responseRaw.json()

    console.log(response)
    
    this.loginSessionId = response.login_session_id
    this.loginCallback = loginCallback

  }

  // TODO: pass styles
  getLoginQr() {
    if(!this.loginSessionId)
      throw new Error("No login session id yet")

    const url = `${this.host}/user_login?login_session_id=${this.loginSessionId}`

    const urlFields: TransactionRequestURLFields = {
      link: new URL(url),
    }

    const loginUrl = encodeURL(urlFields)

    console.log(loginUrl)
    
    const loginQr = createQR(loginUrl, 400, 'transparent')

    return loginQr
  }

  async newTransactionSession(transaction: Transaction, stateCallback: (state: TransactionState) => void): Promise<string> {

    const serializedTx = transaction.serialize({requireAllSignatures: false}).toString('base64')

    const responseRaw = await fetch(this.host + '/transaction_session', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'transaction': serializedTx})
    })

    const response = await responseRaw.json()

    console.log(response)

    this.transactionSessions[response.transaction_session_id] = {
      stateCallback: stateCallback,
      state: { state: "init" } as TransactionState
    }

    return response.transaction_session_id
  }

  getTransactionQr(txSessionId: string) {
    if(!(txSessionId in this.transactionSessions))
      throw new Error("Invalid transaction session id")
    
    const url = `${this.host}/get_transaction?transaction_session_id=${txSessionId}`

    const urlFields: TransactionRequestURLFields = {
      link: new URL(url),
    }

    const txUrl = encodeURL(urlFields)

    console.log(txUrl)
    
    const txQr = createQR(txUrl, 400, 'transparent')

    return txQr
  }

  async poll() {

    // There is an active login session going on
    if(this.loginSessionId) {

      console.log("Poll login session...")

      const responseRaw = await fetch(`${this.host}/login_session?login_session_id=${this.loginSessionId}`)

      if (!responseRaw.ok) {
        console.log("Request failed")
      } else {
        const response = await responseRaw.json()
        console.log(response)

        if (response['state'] == 'set') {
          console.log("Logged in as:", response['public_key'])

          this.loginCallback(response['public_key'])

          this.loginCallback = undefined
          this.loginSessionId = undefined
        }

      }
    }
    
    for(const txSessionId in this.transactionSessions) {
      const txSession = this.transactionSessions[txSessionId]
      if(txSession.state.state == "finalized")
        continue
      
      console.log(`Poll transaction session ${txSessionId}...`)

      const responseRaw = await fetch(`${this.host}/transaction_session?transaction_session_id=${txSessionId}`)

      if (!responseRaw.ok) {
        console.log("Request failed")
      } else {
        const response = await responseRaw.json()
        console.log(response)
        
        Object.assign(this.transactionSessions[txSessionId], response['state'])

        console.log(this.transactionSessions[txSessionId])
      }
    }
  }
}
