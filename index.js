window.addEventListener("DOMContentLoaded", () => {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera();

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial();
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  camera.position.z = 5;

  var animate = function () {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.001;
    cube.rotation.y += 0.001;

    renderer.render(scene, camera);
  };

  animate();
});
