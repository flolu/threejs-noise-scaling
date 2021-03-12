// https://github.com/yiwenl/glsl-fbm/blob/master/3d.glsl
const fbm = `
#define NUM_OCTAVES 5

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}


float fbm(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100);
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}
`;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
camera.position.set(-1.5, 0.1, 2.4);
camera.rotation.set(0.1, -1, 0.1);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x444444);
document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff);
light.position.setScalar(10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

let uniforms = {
  tex: {
    value: setGradient(),
  },
};
let m = new THREE.MeshStandardMaterial({
  metalness: 0.25,
  roughness: 0.75,
  onBeforeCompile: (shader) => {
    shader.uniforms.tex = uniforms.tex;
    shader.vertexShader = `
      varying vec3 vPos;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      //vPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vPos = vec3(position);
      `
    );
    //console.log(shader.vertexShader);
    shader.fragmentShader = `
      uniform sampler2D tex;
      varying vec3 vPos;
      ${fbm}
      ${shader.fragmentShader}
    `.replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
      float d = fbm(vPos * 0.5);
      for(int i = 0; i < 4; i++){
        d = fbm(vPos * (float(i) + 1.) * d);
      }

      vec3 col = texture(tex, vec2(d, 0.5)).rgb;
      vec4 diffuseColor = vec4( col, opacity );`
    );
    // console.log(shader.fragmentShader);
  },
});

const g1 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const o1 = new THREE.Mesh(g1, m);
o1.position.x = -1;
scene.add(o1);

const g2 = new THREE.BoxGeometry(1, 1, 1);
const o2 = new THREE.Mesh(g2, m);
scene.add(o2);

const g3 = new THREE.BoxGeometry(10, 10, 10);
const o3 = new THREE.Mesh(g3, m);
o3.position.x = 7;
scene.add(o3);

window.addEventListener("resize", onWindowResize, false);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});

function setGradient() {
  let canvas = document.getElementById("cnvsGradient");
  let ctx = canvas.getContext("2d");

  let gradient = ctx.createLinearGradient(0, 0, 300, 0);

  gradient.addColorStop(0.15, "yellow");
  gradient.addColorStop(0.5, "red");
  gradient.addColorStop(0.85, "blue");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new THREE.CanvasTexture(canvas);
}

function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
}
