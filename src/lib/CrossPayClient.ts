import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'

export default class CrossPayClient {
  static pollingInterval = 1000

  loginSessionId: string | undefined
  transactionSessionIds: string[]

  constructor(host : string) {
    this.host = host

    this.transactionSessionIds = []

    setInterval(() => this.poll(), CrossPayClient.pollingInterval)
  }

  async newLoginSession() {

    const responseRaw = await fetch(this.host + '/login_session', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })

    const response = await responseRaw.json()

    console.log(response)
    
    this.loginSessionId = response.login_session_id

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

  poll() {
  }
}
