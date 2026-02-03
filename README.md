# 3dmodelviewer
## 🎥 Demo

A simple demo application is included to showcase how the library can be consumed by a host Angular app.

**Features demonstrated:**
- Loading GLTF/GLB models via URL
- Orbit controls (rotate / zoom)
- Clean standalone component usage

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js)
![License](https://img.shields.io/github/license/your-username/your-repo)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
<img width="1864" height="938" alt="image" src="https://github.com/user-attachments/assets/a0908129-09a3-4484-9633-b1ac8ffeb98e" />
<img width="1864" height="940" alt="image" src="https://github.com/user-attachments/assets/0c3056ed-fc1d-404a-a68a-8f12fba7fb33" />


## 📦 Installation

```bash
npm install product-viewer
```
Import the standalone component:
```
//.ts
import { ProductViewerComponent } from 'product-viewer';
```
## 🔹 Usage (Clear & Simple)

```md
## 🚀 Usage

```html
<lib-product-viewer [modelUrl]="modelUrl"></lib-product-viewer>
```
```ts
//.ts
modelUrl = 'assets/models/product.glb';
```

---

## 🔹 Library API (Nice touch for recruiters)

```md
## 🧩 Component API

### Inputs

| Name | Type | Description |
|----|----|----|
| `modelUrl` | `string` | URL to a GLTF / GLB model |
| `autoRotate` | `boolean` | Enables auto rotation (optional) |
| `backgroundColor` | `string` | Scene background color (optional) |
```
## 🤔 Why This Project?

Most Angular + Three.js examples are:
- tightly coupled to assets
- hardcoded
- not reusable

This project focuses on:
- clean separation of concerns
- Angular standalone architecture
- real-world e-commerce use cases
- library-first design

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests for:
- performance improvements
- new viewer features
- documentation enhancements

## 📄 License

MIT License

