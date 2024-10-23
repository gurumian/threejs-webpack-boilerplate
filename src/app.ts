import { Control } from './control'

export class App {
  control: Control
  
  constructor() {
    this.control = new Control()
  }

  render() {
    this.control.render()
  }

  public init() {
    this.control.init()
  }

  update(): void {
    this.control.update()
    this.render()
  }
}
