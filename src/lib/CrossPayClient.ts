import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay'

export default class CrossPayClient {
  static pollingInterval = 1000

  loginCallback: (public_key: string) => void | undefined
  loginSessionId: string | undefined
  transactionSessionIds: string[]

  constructor(host : string) {
    this.host = host

    this.transactionSessionIds = []

    setInterval(() => this.poll().then(null, console.error), CrossPayClient.pollingInterval)
  }

  async newLoginSession(loginCallback) {

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
  }
}
