import { ViewPart } from "./view_part/view_part";
import { Control } from "./control";
// import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
// import { Camera } from "./camera"
// import { TrackballControls } from "./trackball_controls";


// export class ViewPart {
//   constructor(public control: Control) {
//   }

//   init(): Promise<void> {
//     return new Promise((res, _) => {
//       setTimeout(() => {
//         // this.started = true
//         res()
//       })
//     })
//   }

//   dispose(): void {
//     // this.started = false
//   }

//   update(): void {
//   }

//   onkeydown(event: KeyboardEvent) {
//     if (event.code === 'Space') {
//       // TODO
//     }
//   }
// }


export class Router {
  public static route(p: number, args: any) {
    let monitor = Router.getInstance()
    monitor.requestStart(p, args)
  }

  private static instance: Router;

  parts: {[key:string]: ViewPart} = {}
  current: number = 0
  control: Control

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }

    return Router.instance;
  }

  private constructor() {
    this.control = new Control()
    this.control.init()
  }

  init() {
    if(!this.control)
      throw new Error('missing members')

    window.addEventListener('keydown', (event) => {
      this.parts[this.current].onkeydown(event)
    }, false)
  }

  async register(p: number, viewpart: ViewPart) {
    this.parts[p] = viewpart
    this.parts[p].init()
  }

  async unregister(p: number) {
    this.parts[p].dispose()
    delete this.parts[p]
  }

  async requestStart(p: number, args?: any) {
    console.log(`requestStart ${p}`)
    console.log(args)
    // await this.control.camera?.reset()
    // this.controls?.reset()

    if(this.current) this.requestStop(this.current)
    
    let part = this.parts[p]
    if(!part) throw new Error('no such part')

    console.log(part)
    part.start(args)
    this.current = p
  }

  requestStop(p?: number) {
    console.log(`requestStop ${p}`)
    p = p || this.current
    if(p) {
      let part = this.parts[p]
      if(!part) return
  
      part.stop()
    }
    this.current = 0
  }

  update() {
    this.parts[this.current].update()
    this.control.update()
  }
}
