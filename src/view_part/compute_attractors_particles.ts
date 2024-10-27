import * as THREE from 'three/tsl'
import { float, If, PI, color, cos, instanceIndex, Loop, mix, mod, sin, storage, Fn, uint, uniform, uniformArray, hash, vec3, vec4, Node, ShaderNodeObject } from 'three/tsl';
import { Control } from '../control';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const attractorsPositions = uniformArray( [
  new THREE.Vector3( - 1, 0, 0 ),
  new THREE.Vector3( 1, 0, - 0.5 ),
  new THREE.Vector3( 0, 0.5, 1 )
] );
const attractorsRotationAxes = uniformArray( [
  new THREE.Vector3( 0, 1, 0 ),
  new THREE.Vector3( 0, 1, 0 ),
  new THREE.Vector3( 1, 0, - 0.5 ).normalize()
] );

const sphericalToVec3 = Fn( ( [ phi, theta ] :[Node, Node] ) => {

  const sinPhiRadius = sin( phi );

  return vec3(
    sinPhiRadius.mul( sin( theta ) ),
    cos( phi ),
    sinPhiRadius.mul( cos( theta ) )
  );

} );


 
const count = Math.pow( 2, 18 );
    
const positionBuffer = storage(new THREE.StorageInstancedBufferAttribute(count, 3), 'vec3', count);
const velocityBuffer = storage(new THREE.StorageInstancedBufferAttribute(count, 3), 'vec3', count);

const attractorMass = uniform( Number( `1e${7}` ) );
const particleGlobalMass = uniform( Number( `1e${4}` ) );
const timeScale = uniform( 1 );
const spinningStrength = uniform( 2.75 );
const maxSpeed = uniform( 8 );
const gravityConstant = 6.67e-11;
const velocityDamping = uniform( 0.1 );
const scale = uniform( 0.008 );
const boundHalfExtent = uniform( 8 );

const particleMassMultiplier = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).remap( 0.25, 1 ).toVar();
const particleMass = particleMassMultiplier.mul( particleGlobalMass ).toVar();
const attractorsLength = uniform( attractorsPositions.array.length );


const colorA = uniform( color( '#5900ff' ) );
const colorB = uniform( color( '#ffa575' ) );
const material = new THREE.SpriteNodeMaterial( { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false } );


export class ComputeAttractorParticles {
  updateCompute: any
  initCompute: any
  constructor(public control: Control) {

  }

  private init_attractors() {

    // const attractorsLength = uniform( attractorsPositions.array.length );
    const attractors = [];
    const helpersRingGeometry = new THREE.RingGeometry( 1, 1.02, 32, 1, 0, Math.PI * 1.5 );
    const helpersArrowGeometry = new THREE.ConeGeometry( 0.1, 0.4, 12, 1, false );
    const helpersMaterial = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );

    for ( let i = 0; i < attractorsPositions.array.length; i ++ ) {

      const attractor = {} as any;

      attractor.position = attractorsPositions.array[ i ];
      attractor.orientation = attractorsRotationAxes.array[ i ];
      attractor.reference = new THREE.Object3D();
      attractor.reference.position.copy( attractor.position );
      attractor.reference.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), attractor.orientation );
      this.control.scene.add( attractor.reference );

      attractor.helper = new THREE.Group();
      attractor.helper.scale.setScalar( 0.325 );
      attractor.reference.add( attractor.helper );

      attractor.ring = new THREE.Mesh( helpersRingGeometry, helpersMaterial );
      attractor.ring.rotation.x = - Math.PI * 0.5;
      attractor.helper.add( attractor.ring );

      attractor.arrow = new THREE.Mesh( helpersArrowGeometry, helpersMaterial );
      attractor.arrow.position.x = 1;
      attractor.arrow.position.z = 0.2;
      attractor.arrow.rotation.x = Math.PI * 0.5;
      attractor.helper.add( attractor.arrow );

      attractor.controls = new TransformControls( this.control.camera, this.control.renderer.domElement );
      attractor.controls.mode = 'rotate';
      attractor.controls.size = 0.5;
      attractor.controls.attach( attractor.reference );
      attractor.controls.visible = true;
      attractor.controls.enabled = attractor.controls.visible;
      this.control.scene.add( attractor.controls.getHelper() );
  
      // Define the event interface
      interface TransformControlsDraggingChangedEvent {
        type: 'dragging-changed';
        target: TransformControls;
        value: boolean;
      }

      attractor.controls.addEventListener( 'dragging-changed', ( event: TransformControlsDraggingChangedEvent ) => {
        this.control.controls.enabled = ! event.value;
      } );
  
      attractor.controls.addEventListener( 'change', () => {

        attractor.position.copy( attractor.reference.position );
        attractor.orientation.copy( new THREE.Vector3( 0, 1, 0 ).applyQuaternion( attractor.reference.quaternion ) );
  
      } );

      attractors.push( attractor );
  
    }
  }
  
  private init_compute() {

    const init = Fn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);
    
      const basePosition = vec3(
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
      ).sub(0.5).mul(vec3(5, 0.2, 5));
      position.assign(basePosition);
    
      const phi = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI).mul(2);
      const theta = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI);
      const baseVelocity = sphericalToVec3(phi, theta).mul(0.05);
      velocity.assign(baseVelocity);
    
      // Return an empty Node to satisfy TypeScript
      return new Node(); // Adjust based on how to create an empty Node in your context
    });



    this.initCompute = (init() as any).compute( count );

    const reset = () => {

      this.control.renderer.compute( this.initCompute );
  
    };
    reset();
  }


  private update_compute() {
    const update = Fn( () => {
      // const delta = timerDelta().mul( timeScale ).min( 1 / 30 ).toVar();
      const delta = float( 1 / 60 ).mul( timeScale ).toVar(); // uses fixed delta to consistant result
      const position = positionBuffer.element( instanceIndex );
      const velocity = velocityBuffer.element( instanceIndex );

      // force
      const force = vec3( 0 ).toVar();

      Loop( attractorsLength, ( { i }: { i: any } ) => {

        const attractorPosition = attractorsPositions.element( i );
        const attractorRotationAxis = attractorsRotationAxes.element( i );
        const toAttractor = attractorPosition.sub( position );
        const distance = toAttractor.length();
        const direction = toAttractor.normalize();

        // gravity
        const gravityStrength = attractorMass.mul( particleMass ).mul( gravityConstant ).div( distance.pow( 2 ) ).toVar();
        const gravityForce = direction.mul( gravityStrength );
        force.addAssign( gravityForce );

        // spinning
        const spinningForce = attractorRotationAxis.mul( gravityStrength ).mul( spinningStrength );
        const spinningVelocity = spinningForce.cross( toAttractor );
        force.addAssign( spinningVelocity );
  
      });

      // velocity

      velocity.addAssign( force.mul( delta ) );
      const speed = velocity.length();
      If( speed.greaterThan( maxSpeed ), () => {

        velocity.assign( velocity.normalize().mul( maxSpeed ) );
  
      });
      velocity.mulAssign( velocityDamping.oneMinus() );

      // position

      position.addAssign( velocity.mul( delta ) );

      // box loop

      const halfHalfExtent = boundHalfExtent.div( 2 ).toVar();
      position.assign( mod( position.add( halfHalfExtent ), boundHalfExtent ).sub( halfHalfExtent ) );
  

      return new Node();
    } );
    this.updateCompute = (update() as any).compute( count );
 
  }


  init_nodes() {

    material.positionNode = (positionBuffer as any).toAttribute();

    material.colorNode = Fn( () => {

      const velocity = (velocityBuffer as any).toAttribute();
      const speed = velocity.length();
      const colorMix = speed.div( maxSpeed ).smoothstep( 0, 0.5 );
      const finalColor = mix( colorA, colorB, colorMix );

      return vec4( finalColor, 1 );
  
    } )();

    material.scaleNode = (particleMassMultiplier as any).mul( scale );

  }

  
  init_mesh() {
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const mesh = new THREE.InstancedMesh( geometry, material, count );
    this.control.scene.add( mesh );
  }

  init() {
    this.init_attractors()
    this.init_compute()
    this.update_compute()

    this.init_nodes()
    this.init_mesh()
  }


  update() {
    this.control.renderer.compute( this.updateCompute );
  }
}