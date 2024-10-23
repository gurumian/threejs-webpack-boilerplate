import * as THREE from 'three'

const enable_light_helper: boolean = false

export class Light {
  dir_light: THREE.DirectionalLight
  dir_light_helper?: THREE.DirectionalLightHelper

  ambient_light: THREE.AmbientLight
  

  constructor(public scene: THREE.Scene) {
    let x = 50
    let y = 50
    let z = 40

    this.dir_light = new THREE.DirectionalLight(0xffffff, 0.8)
    // this.dir_light.color.setHSL( 0.1, 1, 0.95 )
    this.dir_light.position.set(x, y, z)
    // this.dir_light.position.set( 0.001, 0.001, 0.001 );
    // this.dir_light.position.multiplyScalar(2);
    this.dir_light.castShadow = true;

    this.dir_light.shadow.mapSize.width = 4096
    this.dir_light.shadow.mapSize.height = 4096
    this.dir_light.intensity = 3;
    // this.dir_light.opacity = 0.7;
    const d = 50;

    this.dir_light.shadow.camera.left = -d;
    this.dir_light.shadow.camera.right = d;
    this.dir_light.shadow.camera.top = d;
    this.dir_light.shadow.camera.bottom = -d;

    this.dir_light.shadow.camera.near = 1
    this.dir_light.shadow.camera.far = 100000
    // this.dir_light.shadow.bias = - 0.0001
    scene.add(this.dir_light)


    this.ambient_light = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(this.ambient_light)

    if(enable_light_helper) {
      this.dir_light_helper = new THREE.DirectionalLightHelper(this.dir_light, 100);
      scene.add(this.dir_light_helper)
    }
  }

  dispose() {
    if(this.dir_light_helper) this.scene.remove(this.dir_light_helper)
    if(this.dir_light) this.scene.remove(this.dir_light)

    if(this.ambient_light) this.scene.remove(this.ambient_light)
  }
}
