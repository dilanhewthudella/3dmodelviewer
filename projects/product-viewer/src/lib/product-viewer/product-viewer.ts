import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'lib-product-viewer',
  standalone: true,
  imports: [],
  templateUrl: './product-viewer.html',
  styleUrl: './product-viewer.scss',
})
export class ProductViewer implements AfterViewInit, OnDestroy {
  @Input() modelUrl!: string;
  @ViewChild('canvasContainer', { static: true })
  container!: ElementRef<HTMLDivElement>;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private hotspots: THREE.Mesh[] = [];
  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Implementation for AfterViewInit
    this.initScene();
    this.loadModel();
    this.addLights();
    this.addHotspot();

    this.setupClickListener();
    this.startRenderingLoop();
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    // Implementation for OnDestroy
    this.renderer.domElement.removeEventListener('click', this.setupClickListener);
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    const { clientWidth, clientHeight } = this.container.nativeElement;

    this.camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    //this.container.nativeElement.appendChild(this.renderer.domElement);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(this.modelUrl, (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      this.scene.add(model);
      this.fitCameraToObject(model);
    });
  }

  private addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 7);

    this.scene.add(ambient, directional);
  }

  private addHotspot() {
    const geometry = new THREE.SphereGeometry(0.03, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hotspot = new THREE.Mesh(geometry, material);

    hotspot.position.set(0, 0.8, 0); // adjust to your model
    hotspot.userData = {
      title: 'Material Info',
      description: 'Made from reinforced carbon fiber',
    };

    this.scene.add(hotspot);
    this.hotspots.push(hotspot);
  }

  private startRenderingLoop() {
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    });
  }

  private onResize = () => {
    const { clientWidth, clientHeight } = this.container.nativeElement;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };

  private setupClickListener() {
    this.renderer.domElement.addEventListener('click', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.hotspots);

      if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        alert(`${data['title']}\n${data['description']}`);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);

    this.loadModelFromUrl(url);
  }

  private loadModelFromUrl(url: string) {
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        // Optional: clear previous model
        this.clearScene();

        const model = gltf.scene;
        this.scene.add(model);

        // Optional: auto center & scale
        this.fitCameraToObject(model);
      },
      undefined,
      (error) => {
        console.error('Error loading model', error);
      },
    );
  }

  private clearScene() {
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).geometry) {
        (object as THREE.Mesh).geometry.dispose();
      }

      if ((object as THREE.Mesh).material) {
        const material = (object as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });

    // Keep lights, camera helpers, hotspots if needed
    this.scene.children = this.scene.children.filter(
      (obj) => obj instanceof THREE.Light || this.hotspots.includes(obj as THREE.Mesh),
    );
  }
  private fitCameraToObject(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    this.controls.reset();

    object.position.sub(center);

    this.camera.near = size / 100;
    this.camera.far = size * 100;
    this.camera.updateProjectionMatrix();

    this.camera.position.set(0, size / 2, size);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
