import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class App {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  pad?: Gamepad
  topics?: []
  camera: THREE.PerspectiveCamera
  current: number = 0
  cube: THREE.Mesh
  controls: OrbitControls
  
  constructor() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.position.z = 2

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    })
    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  public init() {
    this.renderer.setSize( window.innerWidth, window.innerHeight )
    document.getElementById( 'container' )!.appendChild( this.renderer.domElement );

    window.addEventListener( 'resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight
			this.camera.updateProjectionMatrix()
			this.renderer.setSize( window.innerWidth, window.innerHeight )
			this.render()
		}, false )
  }

  update(): void {
    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01
    this.controls?.update()
    this.render()
  }
}
