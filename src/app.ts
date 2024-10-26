import { Parts } from './view_part/parts'
import { Router } from './router'
import { DefaultViewPart } from './view_part/default_view_part'

export enum State {
  none,
  prepared,
  started,
  stopped,
  paused
}

export class App {
  router: Router
  
  constructor() {
    this.router = Router.getInstance()
  }

  public init() {
    this.router.init()
    this.router.register(Parts.default, new DefaultViewPart(this.router.control))

    this.router.requestStart(Parts.default)
  }
  render() {
    this.router.control.render()
  }

  update(): void {
    this.router.update()
    this.render()
  }
}
