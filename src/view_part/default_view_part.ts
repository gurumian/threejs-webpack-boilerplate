import * as THREE from 'three/tsl'
import { ViewPart } from "./view_part";
import { Light } from '../widget/light';
import { Control } from '../control';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export class DefaultViewPart extends ViewPart {
  light?: Light
  is_animating: boolean = true
  cube: THREE.Mesh

  constructor(public control: Control){  
    super(control)

    this.light = new Light(control.scene)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    })
    this.cube = new THREE.Mesh(geometry, material)
    this.control.scene.add(this.cube)

    this.createCSSObject()
  }

  async init(): Promise<void> {
    return super.init()
  }

  dispose(): void {
    if(this.light) this.light.dispose()
    super.dispose()
  }

  update(): void {
    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01
    super.update()
  }

  onstart(args?: any) {
    console.log(args)
  }

  onstop(args?: any) {
    console.log(args)
  }

  private createCSSObject(): void {
    const element = document.createElement( 'div' );
    element.className = 'element';
    element.innerHTML = "Test"

    const objectCSS = new CSS3DObject( element );
    objectCSS.position.x = 0;
    objectCSS.position.y = 0;
    objectCSS.position.z = -1000;
    this.control.scene.add( objectCSS );
  }
}
