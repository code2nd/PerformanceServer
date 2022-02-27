let resolvePromise: (value: unknown) => void

class Subscriber {
  promise: Promise<unknown>
  static instance: Subscriber
  ws: WebSocket

  constructor() {
    this.ws = null
    this.promise = new Promise(function promiseExcutor(resolve) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resolvePromise = resolve
    })
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Subscriber()
    }

    return this.instance
  }

  excutor(ws: WebSocket) {
    this.ws = ws
    /* resolvePromise(value)
    Subscriber.instance = null */
  }
}

export default Subscriber
