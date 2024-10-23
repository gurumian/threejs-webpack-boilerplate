import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DefaultViewPart } from './view_part/default_view_part'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import * as TWEEN from '@tweenjs/tween.js';
import EventEmitter from 'events';

const css3d_support: boolean = false


export class Control extends EventEmitter{
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  css3d_renderer?: CSS3DRenderer

  camera: THREE.PerspectiveCamera
  //   cube: THREE.Mesh
  controls: OrbitControls

  view_part: DefaultViewPart

  is_control_started: boolean = false

  element: HTMLElement | null = null

  constructor() {
    super()
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x666666)
    this.scene.fog = new THREE.Fog(new THREE.Color(0x666666), 1000, 50000)


    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
    // this.renderer = new THREE.WebGPURenderer( { antialias: true } );
    // this.renderer.toneMapping = THREE.NeutralToneMapping;
    // // this.renderer.setAnimationLoop( this.update );
    // this.renderer.setPixelRatio( window.devicePixelRatio );
    // this.renderer.shadowMap.enabled = true
    // this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    if(css3d_support) {
      this.css3d_renderer = new CSS3DRenderer
      this.css3d_renderer.setSize(window.innerWidth, window.innerHeight)
      this.css3d_renderer.domElement.style.position = 'absolute'
      this.css3d_renderer.domElement.style.top = '0px'
      this.css3d_renderer.domElement.style.pointerEvents = 'none'
      this.css3d_renderer.domElement.style.zIndex = '1'
      this.css3d_renderer.domElement.style.background = 'none'
    }

    this.element = document.getElementById('container')
    if(this.element) {
      this.element.setAttribute('data-long-press-delay', '500') // long-press-event
      this.element.appendChild(this.renderer.domElement)
    }

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    // this.camera.position.x = -60
    // this.camera.position.y = 10
    // this.camera.position.z = 60
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 5

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true // Add smooth damping effect
    this.controls.dampingFactor = 0.05

    this.controls.maxPolarAngle = Math.PI / 2 - 0.1 ;
    this.controls.addEventListener('start', () => {
      console.log('start! control')
      this.is_control_started = true
      this.emit('dragstart')
    });
    this.controls.addEventListener('end', () => {
      console.log('end! control')
      this.is_control_started = false
      this.emit('dragend')
    });

    this.view_part = new DefaultViewPart(this)
    this.view_part.init()
  }

  render() {
    if(this.css3d_renderer)
      this.css3d_renderer.render(this.scene, this.camera)

    this.renderer.render(this.scene, this.camera)
  }

  public init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    
    if(this.element) {
      this.element.appendChild(this.renderer.domElement)
    }
    else {
      console.warn(`container doesn't exist`)
    }

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.render()
    }, false)

    window.addEventListener('keydown', (event) => {
      this.view_part.onkeydown(event)
    }, false)
  }

  update(): void {
    if(!this.is_control_started) TWEEN.update()
    this.controls?.update()
    this.view_part.update()
    this.render()
  }

  get capture_stream() : MediaStream | undefined {
    if(!this.renderer || !this.renderer.domElement) return undefined
    return this.renderer.domElement.captureStream(60)
  }
}
