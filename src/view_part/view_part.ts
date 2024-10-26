import { Control } from "../control"

const kTweenDuration = 200
const TWEEN = require('@tweenjs/tween.js')

export abstract class ViewPart {
    constructor(public control: Control) {}
    init(args?: any): Promise<void> {
      console.log(args)
      return new Promise((res, _) => {
        setTimeout(() => {
          res()
        })
      })
    }
  
    abstract onstart(args?: any): void
    abstract onstop(args?: any): void
  
    start(args?: any): Promise<void> {
      return new Promise((res, _) => {
        setTimeout(() => {
          this.onstart(args)
          res()
        })
      })
    }
  
    stop(args?: any): Promise<void> {
      return new Promise((res, _) => {
        setTimeout(() => {
          this.onstop(args)
          res()
        })
      })
    }
  
    dispose() {}
  
    update(): void {}
  
    // render() {
    //   this.control.renderer.render(this.control.scene, this.control.camera)
    // }
    onkeydown(_: KeyboardEvent) {
    }
  
    transform( targets: any, objects: any, duration?: number): Promise<void> {
      return new Promise((res) => {
        duration ||= kTweenDuration    
        // TWEEN.removeAll()
        for ( let i = 0; i < objects.length; i++ ) {
          let object = objects[ i ]
          let target = targets[ i ]
          new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start()
  
          new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start()
        }
  
        new TWEEN.Tween( this )
          .to( {}, duration * 2 )
          .onUpdate( () => {
            this.update()
          })
          .onComplete(res)
          .start()
        })
    }
  }
  