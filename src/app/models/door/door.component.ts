import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-door',
  standalone: true,
  imports: [],
  templateUrl: './door.component.html',
  styleUrl: './door.component.scss'
})
export class DoorComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasRef') private canvasRef!: ElementRef;
  private controls!: OrbitControls;  // Define el control

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  private initThreeJS(): void {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasRef.nativeElement.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    // camera.fov = 80;
    // camera.updateProjectionMatrix();
    scene.add(camera);

    // Integrar OrbitControls
    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.enableDamping = true; // Habilitar amortiguación
    this.controls.dampingFactor = 0.1;
    this.controls.update();

    scene.add(new THREE.AmbientLight(0x666666));
    const light = new THREE.PointLight(0xffffff, 3, 0, 0);
    camera.add(light);
    scene.add(new THREE.AxesHelper(20));

    const loader = new GLTFLoader();
    loader.load('models/car_door.glb', (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      const vertices: THREE.Vector3[] = [];
      model.traverse((child: any) => {
        if (child.isMesh) {
          const position = child.geometry.attributes.position;
          for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
            vertices.push(vertex);
          }
        }
      });

      this.addPoints(scene, vertices);
    });

    // Animación
    renderer.setAnimationLoop(() => {
      this.controls.update();  // Actualizar los controles en cada cuadro
      renderer.render(scene, camera);
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private addPoints(scene: THREE.Scene, vertices: THREE.Vector3[]): void {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textures/disc.png');

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x0080ff,
      map: texture,
      size: 1,
      alphaTest: 0.5
    });

    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);
  }
}
