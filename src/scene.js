import * as THREE from 'three';

export function buildScene(canvas) {
  const W = window.innerWidth, H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040812);
  scene.fog = new THREE.FogExp2(0x040812, 0.038);

  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  camera.position.set(0, 0, 5.5);

  // Lights
  scene.add(new THREE.AmbientLight(0x080d22, 5));
  const sun = new THREE.DirectionalLight(0x4466ff, 4);
  sun.position.set(4, 5, 4);
  scene.add(sun);
  const fill = new THREE.PointLight(0x6622cc, 3, 30);
  fill.position.set(-5, 2, 2);
  scene.add(fill);
  const back = new THREE.PointLight(0x001166, 2, 20);
  back.position.set(0, -4, -4);
  scene.add(back);

  // Stars
  const sPos = new Float32Array(5000 * 3);
  for (let i = 0; i < 5000; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const th = Math.random() * Math.PI * 2;
    const r = 25 + Math.random() * 70;
    sPos[i*3]   = r * Math.sin(phi) * Math.cos(th);
    sPos[i*3+1] = r * Math.sin(phi) * Math.sin(th);
    sPos[i*3+2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xaac4ee, size: 0.07, sizeAttenuation: true, transparent: true, opacity: 0.75,
  }));
  scene.add(stars);

  // Floating nebula dust
  const dPos = new Float32Array(1500 * 3);
  for (let i = 0; i < 1500; i++) {
    dPos[i*3]   = (Math.random() - 0.5) * 20;
    dPos[i*3+1] = (Math.random() - 0.5) * 20;
    dPos[i*3+2] = (Math.random() - 0.5) * 20;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x2233aa, size: 0.03, sizeAttenuation: true, transparent: true, opacity: 0.5,
  }));
  scene.add(dust);

  // Central orb group
  const group = new THREE.Group();
  scene.add(group);

  // Shell material — dark metallic
  const mkMat = () => new THREE.MeshPhongMaterial({
    color: new THREE.Color(0x0c1540),
    emissive: new THREE.Color(0x04091e),
    specular: new THREE.Color(0x1f44cc),
    shininess: 70,
    flatShading: true,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
  });

  // Low-poly sphere split into two halves
  const topGeo = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const botGeo = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI);
  const topHalf = new THREE.Mesh(topGeo, mkMat());
  const botHalf = new THREE.Mesh(botGeo, mkMat());
  group.add(topHalf, botHalf);

  // Edge ring at equator — the "seal"
  const sealGeo = new THREE.TorusGeometry(1, 0.012, 16, 120);
  const seal = new THREE.Mesh(sealGeo, new THREE.MeshBasicMaterial({ color: 0x2244cc, transparent: true, opacity: 0.8 }));
  group.add(seal);

  // Wireframe overlay
  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.01, 1)),
    new THREE.LineBasicMaterial({ color: 0x1833aa, transparent: true, opacity: 0.3 })
  );
  group.add(wire);

  // Core glow layers
  const core = new THREE.Group();
  scene.add(core);

  const innerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x2255ff, transparent: true, opacity: 0 })
  );
  core.add(innerSphere);

  const halos = [0.52, 0.68, 0.88].map((r, i) => {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(r, 24, 24),
      new THREE.MeshBasicMaterial({
        color: [0x1144ee, 0x0a2eaa, 0x060f44][i],
        transparent: true, opacity: 0, depthWrite: false,
      })
    );
    core.add(h);
    return h;
  });

  // Orbital ring + ISS
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.005, 12, 160),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0 })
  );
  orbit.rotation.x = Math.PI / 2.2;
  core.add(orbit);

  const iss = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  core.add(iss);

  // Inner particles
  const cpPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const th = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.55;
    cpPos[i*3]   = r * Math.sin(phi) * Math.cos(th);
    cpPos[i*3+1] = r * Math.sin(phi) * Math.sin(th);
    cpPos[i*3+2] = r * Math.cos(phi);
  }
  const cpGeo = new THREE.BufferGeometry();
  cpGeo.setAttribute('position', new THREE.BufferAttribute(cpPos, 3));
  const coreParticles = new THREE.Points(cpGeo, new THREE.PointsMaterial({
    color: 0x6699ff, size: 0.02, sizeAttenuation: true, transparent: true, opacity: 0,
  }));
  core.add(coreParticles);

  // Resize handler
  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return {
    renderer, scene, camera,
    stars, dust, group, topHalf, botHalf, seal, wire,
    core, innerSphere, halos, orbit, iss, coreParticles,
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}
