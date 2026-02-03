import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three-stdlib';

@Component({
  selector: 'lib-amazon-product-viewer',
  standalone: true,
  templateUrl: './amazon-product-viewer.html',
  styleUrls: ['./amazon-product-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmazonProductViewer implements AfterViewInit, OnDestroy {
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
  selectedHotspot: any = null;

  private modelGroup: THREE.Group | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Implementation for AfterViewInit
    this.initScene();
    this.addLights();
    this.addHotspot();
    this.loadInitialModel();
    this.setupPointerEvents();
    this.startRenderingLoop();
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    // Implementation for OnDestroy
    // Stop animation
    if (this.animationId) cancelAnimationFrame(this.animationId);

    // Remove event listeners
    window.removeEventListener('resize', this.onResize);

    // Dispose renderer safely
    if (this.renderer) this.renderer.dispose();

    // Dispose all geometries & materials safely
    if (this.scene) {
      this.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;

        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        if (mesh.material) {
          const mat = mesh.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
    }

    // Clear references
    this.hotspots = [];
    this.modelGroup = null;
  }

  /* ---------------- SCENE SETUP ---------------- */

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f7f7f7');

    const { clientWidth, clientHeight } = this.container.nativeElement;

    this.camera = new THREE.PerspectiveCamera(35, clientWidth / clientHeight, 0.1, 100);
    this.camera.position.set(0, 0.6, 2.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 4;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 1.8;
  }

  /* ---------------- LIGHTING ---------------- */

  private addLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(5, 5, 5);

    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-5, 2, 5);

    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(0, 5, -5);

    this.scene.add(key, fill, rim);
  }

  /* ---------------- MODEL LOADING ---------------- */

  private loadInitialModel() {
    const loader = new GLTFLoader();
    loader.load(this.modelUrl, (gltf) => {
      this.setModel(gltf.scene);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Create browser-safe temporary URL
    const url = URL.createObjectURL(file);

    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        this.setModel(gltf.scene);

        // Release memory after load
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error('Failed to load model:', error);
      },
    );
  }

  private setModel(model: THREE.Group) {
    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
    }

    this.modelGroup = model;
    this.scene.add(model);
    this.fitCameraToObject(model);
  }

  private fitCameraToObject(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    object.position.sub(center);

    this.controls.reset();

    this.camera.near = size / 100;
    this.camera.far = size * 10;
    this.camera.updateProjectionMatrix();

    this.camera.position.set(0, size * 0.4, size * 1.2);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /* ---------------- HOTSPOTS ---------------- */

  private addHotspot() {
    const geometry = new THREE.CircleGeometry(0.04, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff5a5f,
      transparent: true,
      opacity: 0.9,
    });

    const hotspot = new THREE.Mesh(geometry, material);
    hotspot.position.set(0, 0.8, 0);
    hotspot.userData = {
      title: 'Material',
      description: 'Reinforced carbon fiber body',
    };

    this.scene.add(hotspot);
    this.hotspots.push(hotspot);
  }

  /* ---------------- INTERACTION ---------------- */

  private setupPointerEvents() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousemove', (event) => {
      this.setMouse(event);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.hotspots);
      canvas.style.cursor = hits.length ? 'pointer' : 'default';
    });

    canvas.addEventListener('click', (event) => {
      this.setMouse(event);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.hotspots);

      if (hits.length) {
        this.ngZone.run(() => {
          this.selectedHotspot = hits[0].object.userData;
        });
      }
    });
  }

  private setMouse(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /* ---------------- RENDER LOOP ---------------- */

  private startRenderingLoop() {
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.animationId = requestAnimationFrame(animate);

        this.hotspots.forEach((h) => h.lookAt(this.camera.position));

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    });
  }

  /* ---------------- RESIZE ---------------- */

  private onResize = () => {
    const { clientWidth, clientHeight } = this.container.nativeElement;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };

  // --------------- SCENE CLEANUP ---------------- //
  private clearScene() {
    this.scene.children.forEach((obj) => {
      // Only dispose geometry if exists
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }

      // Only dispose material if exists
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    });

    // Remove everything except lights / camera
    this.scene.children = this.scene.children.filter((obj) => obj instanceof THREE.Light);
  }
}
