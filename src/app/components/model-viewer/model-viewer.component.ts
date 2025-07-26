import { 
  Component, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { v4 as uuidv4 } from 'uuid';
import { Annotation, CameraMode } from '../../app';

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.css'
})
export class ModelViewerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  // Input properties
  @Input() annotations: Annotation[] = [];
  @Input() showAnnotations: boolean = true;
  @Input() timeOfDay: number = 12;
  @Input() nightLightsEnabled: boolean = true;
  @Input() isNight: boolean = false;
  @Input() modelFile: File | null = null;
  @Input() cameraMode: CameraMode = 'orbit';

  // Output events
  @Output() addAnnotation = new EventEmitter<Annotation>();
  @Output() editAnnotation = new EventEmitter<{id: string, title: string, description: string}>();

  // Three.js objects
  public scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private orbitControls!: OrbitControls;
  private pointerLockControls!: PointerLockControls;
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private nightLights: THREE.PointLight[] = [];

  // Model and annotations
  private loadedModel: THREE.Object3D | null = null;
  private annotationMarkers: Map<string, THREE.Mesh> = new Map();
  private hdriTexture: THREE.Texture | null = null;

  // State
  public isPlacingAnnotation = false;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // First person movement
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private clock = new THREE.Clock();

  constructor() {
    // Initialize raycaster and mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  ngOnInit() {
    this.initThreeJS();
    this.setupEventListeners();
    this.loadHDRI();
    this.animate();
  }

  ngAfterViewInit() {
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelFile'] && this.modelFile) {
      this.loadModel(this.modelFile);
    }
    if (changes['timeOfDay'] || changes['isNight']) {
      this.updateLighting();
    }
    if (changes['nightLightsEnabled']) {
      this.updateNightLights();
    }
    if (changes['cameraMode']) {
      this.switchCameraMode();
    }
    if (changes['annotations'] || changes['showAnnotations']) {
      this.updateAnnotationMarkers();
    }
  }

  private initThreeJS() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.containerRef.nativeElement.clientWidth / this.containerRef.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(
      this.containerRef.nativeElement.clientWidth,
      this.containerRef.nativeElement.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.screenSpacePanning = false;
    this.orbitControls.minDistance = 1;
    this.orbitControls.maxDistance = 100;
    this.orbitControls.maxPolarAngle = Math.PI / 2;

    this.pointerLockControls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.scene.add(this.pointerLockControls.getObject());

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 7.5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.scene.add(this.directionalLight);

    // Add a ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add a default cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b35 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 0.5;
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.scene.add(cube);

    this.updateLighting();
  }

  private setupEventListeners() {
    // Mouse events
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Keyboard events for first person controls
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Pointer lock events
    this.pointerLockControls.addEventListener('lock', () => {
      console.log('Pointer locked');
    });
    this.pointerLockControls.addEventListener('unlock', () => {
      console.log('Pointer unlocked');
    });
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private switchCameraMode() {
    if (this.cameraMode === 'orbit') {
      this.orbitControls.enabled = true;
      this.pointerLockControls.disconnect();
    } else {
      this.orbitControls.enabled = false;
      // Note: PointerLockControls will be activated when user clicks
    }
  }

  private loadModel(file: File) {
    if (this.loadedModel) {
      this.scene.remove(this.loadedModel);
    }

    const url = URL.createObjectURL(file);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.obj')) {
      const loader = new OBJLoader();
      loader.load(url, (object: THREE.Group) => {
        this.loadedModel = object;
        this.scene.add(object);
        this.centerModel(object);
        URL.revokeObjectURL(url);
      });
    } else if (fileName.endsWith('.fbx')) {
      const loader = new FBXLoader();
      loader.load(url, (object: THREE.Group) => {
        this.loadedModel = object;
        this.scene.add(object);
        this.centerModel(object);
        URL.revokeObjectURL(url);
      });
    }
  }

  private centerModel(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    object.position.sub(center);
    object.position.y = size.y / 2;

    // Adjust camera position based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    this.camera.position.set(distance, distance, distance);
    this.camera.lookAt(new THREE.Vector3(0, size.y / 2, 0));
    this.orbitControls.target.set(0, size.y / 2, 0);
    this.orbitControls.update();
  }

  private loadHDRI() {
    const loader = new RGBELoader();
    loader.load('/hdri/venice_sunset_1k.hdr', (texture: THREE.Texture) => {
      this.hdriTexture = texture;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
    });
  }

  private updateLighting() {
    const sunParams = this.getSunParams(this.timeOfDay);
    
    // Update directional light (sun)
    this.directionalLight.position.set(sunParams.position[0], sunParams.position[1], sunParams.position[2]);
    this.directionalLight.color.setHex(sunParams.color);
    this.directionalLight.intensity = sunParams.intensity;

    // Update ambient light
    const ambientIntensity = this.isNight ? 0.15 : 0.4;
    const ambientColor = this.isNight ? 0x222233 : 0xffffff;
    this.ambientLight.intensity = ambientIntensity;
    this.ambientLight.color.setHex(ambientColor);

    // Update sky color
    if (!this.hdriTexture) {
      const skyColor = this.isNight ? 0x001122 : 0x87ceeb;
      this.scene.background = new THREE.Color(skyColor);
    }
  }

  private getSunParams(timeOfDay: number) {
    const t = (timeOfDay - 6) / 12;
    const angle = Math.PI * t;
    const sunY = Math.max(Math.sin(angle), 0.05) * 10;
    const sunX = Math.cos(angle) * 10;
    const color = t < 0.2 || t > 0.8 ? 0xffb347 : 0xfffbe6;
    const intensity = t < 0 || t > 1 ? 0 : Math.max(Math.sin(angle), 0);
    
    return {
      position: [sunX, sunY, 7.5],
      color,
      intensity
    };
  }

  private updateNightLights() {
    // Remove existing night lights
    this.nightLights.forEach(light => this.scene.remove(light));
    this.nightLights = [];

    // Add night lights if enabled and it's night
    if (this.isNight && this.nightLightsEnabled) {
      const light1 = new THREE.PointLight(0xaaaaff, 0.7, 8);
      light1.position.set(0, 2, 0);
      this.scene.add(light1);
      this.nightLights.push(light1);

      const light2 = new THREE.PointLight(0xffffff, 0.5, 6);
      light2.position.set(2, 2, 2);
      this.scene.add(light2);
      this.nightLights.push(light2);

      const light3 = new THREE.PointLight(0xffffff, 0.5, 6);
      light3.position.set(-2, 2, -2);
      this.scene.add(light3);
      this.nightLights.push(light3);
    }
  }

  private updateAnnotationMarkers() {
    // Clear existing markers
    this.annotationMarkers.forEach(marker => this.scene.remove(marker));
    this.annotationMarkers.clear();

    // Add new markers
    if (this.showAnnotations) {
      this.annotations.forEach(annotation => {
        const marker = this.createAnnotationMarker(annotation);
        this.scene.add(marker);
        this.annotationMarkers.set(annotation.id, marker);
      });
    }
  }

  private createAnnotationMarker(annotation: Annotation): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.5
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(...annotation.position);
    return marker;
  }

  private onMouseClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (this.isPlacingAnnotation && intersects.length > 0) {
      const intersect = intersects[0];
      const annotation: Annotation = {
        id: uuidv4(),
        position: [intersect.point.x, intersect.point.y, intersect.point.z],
        title: 'New Annotation',
        description: ''
      };
      this.addAnnotation.emit(annotation);
      this.isPlacingAnnotation = false;
    } else if (this.cameraMode === 'firstPerson' && !this.pointerLockControls.isLocked) {
      this.pointerLockControls.lock();
    }
  }

  private onMouseMove(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onKeyDown(event: KeyboardEvent) {
    if (this.cameraMode === 'firstPerson' && this.pointerLockControls.isLocked) {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    if (this.cameraMode === 'firstPerson') {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
      }
    }
  }

  private updateFirstPersonMovement() {
    if (this.cameraMode === 'firstPerson' && this.pointerLockControls.isLocked) {
      const delta = this.clock.getDelta();
      const speed = 5.0;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * speed * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * speed * delta;
      }

      this.pointerLockControls.moveRight(-this.velocity.x * delta);
      this.pointerLockControls.moveForward(-this.velocity.z * delta);
    }
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    if (this.cameraMode === 'orbit') {
      this.orbitControls.update();
    } else {
      this.updateFirstPersonMovement();
    }

    this.renderer.render(this.scene, this.camera);
  }

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.hdriTexture) {
      this.hdriTexture.dispose();
    }
    
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  // Public methods called from template
  startPlacingAnnotation() {
    this.isPlacingAnnotation = true;
  }

  resetCamera() {
    if (this.cameraMode === 'orbit') {
      this.camera.position.set(0, 2, 5);
      this.camera.lookAt(0, 0, 0);
      this.orbitControls.target.set(0, 0, 0);
      this.orbitControls.update();
    } else {
      this.pointerLockControls.getObject().position.set(0, 2, 5);
    }
  }
} 