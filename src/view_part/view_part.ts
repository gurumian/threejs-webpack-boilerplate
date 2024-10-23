import { Control } from '../control'

export class ViewPart {
  constructor(public control: Control) {
  }

  init(): Promise<void> {
    return new Promise((res, _) => {
      setTimeout(() => {
        // this.started = true
        res()
      })
    })
  }

  dispose(): void {
    // this.started = false
  }

  update(): void {
  }

  onkeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      // TODO
    }
  }
}
