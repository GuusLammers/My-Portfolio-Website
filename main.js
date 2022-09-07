import * as THREE from 'three';
import { gsap } from 'gsap'

const world = {
	plane: {
		width: 150,
		height: 50,
		widthSegments: 90,
		heightSegments: 30,
		r: 0,
		g: 0.15,
		b: 0.2,
		rHover: 0.35,
		gHover: 1,
		bHover: 1
	}
}

// functions
function generatePlane() {
	planeMesh.geometry.dispose()
	planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

	planeMesh.position.setY(-6.5)

	const {array} = planeMesh.geometry.attributes.position
	const randomValues = []
	for (let i = 0; i < array.length; i++) {
		
		if (i % 3 == 0) {
		const x = array[i]
		const y = array[i + 1]
		const z = array[i + 2]

		array[i] = x + Math.random() - 0.5
		array[i + 1] = y + Math.random() - 0.5
		array[i + 2] = z + Math.random()
		}

		randomValues.push((Math.random() - 0.5) * Math.PI * 2)
	}

	planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array
	planeMesh.geometry.attributes.position.randomValues = randomValues

	const colors = []
	for (var i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
		colors.push(world.plane.r, world.plane.g, world.plane.b)
	}

	planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

// scene
const scene = new THREE.Scene();

// raycaster
const raycaster = new THREE.Raycaster()

// camera
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const cameraOriginalXRotation = -0.2;
camera.position.y = 1;
camera.position.z = 5;
camera.rotation.x = cameraOriginalXRotation;

const cameraTransitionPosition = {
	rotX: 0,
	y: 10,
	z: 10
};

// geometries
const planeGeometry = new THREE.PlaneGeometry(100, 50, 60, 30)

const starGeometry = new THREE.BufferGeometry()
const startVertices = []
for (var i = 0; i < 10000; i++) {
	const x = (Math.random() - 0.5) * 2000
	const y = (Math.random() - 0.5) * 2000
	const z = -Math.random() * 2000 - 200

	startVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(startVertices, 3))

// materials
const planeMaterial = new THREE.MeshStandardMaterial(
	{
	 	side: THREE.DoubleSide,
	 	flatShading: THREE.FlatShading,
	 	vertexColors: true
	})
planeMaterial.metalness = 0.3
planeMaterial.roughness = 0.4

const starMaterial = new THREE.PointsMaterial({
	color: 0xFFFFFF
})

// points
const stars = new THREE.Points(starGeometry, starMaterial)

// meshs
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.rotateX(-1.5)
generatePlane()

// lights
const light =  new THREE.DirectionalLight(0xFFFFFF, 0.5)
light.position.set(0, 2, -0.75)

// objects added to scene
scene.add(planeMesh)
scene.add(light)
scene.add(stars)

// mouse position
const mouse = {
	x: 0,
	y: 0
}

const textFade = {
	opacity: 1
}

// renderer
const renderer = new THREE.WebGLRenderer(
	{
		antialias: true
	});
	renderer.setSize(innerWidth, innerHeight);
	renderer.setPixelRatio(devicePixelRatio);
	renderer.antialias = true;
	document.body.appendChild(renderer.domElement);

let frame = 0
let transition = false
let transitionOneDone = false
let redirected = false
// animate
function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
	raycaster.setFromCamera(mouse, camera)
	frame += 0.01

	// plane animation
	const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
	for (let i = 0; i < array.length ; i += 3) {
		// x
		array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003
		// y
		array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.003
	}
	planeMesh.geometry.attributes.position.needsUpdate = true

	const intersects = raycaster.intersectObject(planeMesh)
	if (intersects.length > 0) {
		const {color} = intersects[0].object.geometry.attributes

		// vertex 1
		color.setX(intersects[0].face.a, 0.53)
		color.setY(intersects[0].face.a, 0.88)
		color.setZ(intersects[0].face.a, 0.39)

		// vertex 2
		color.setX(intersects[0].face.b, 0.53)
		color.setY(intersects[0].face.b, 0.88)
		color.setZ(intersects[0].face.b, 0.39)

		// vertex 3
		color.setX(intersects[0].face.c, 0.53)
		color.setY(intersects[0].face.c, 0.88)
		color.setZ(intersects[0].face.c, 0.39)

		color.needsUpdate = true

		const inititialColor = {
			r: world.plane.r,
			g: world.plane.g,
			b: world.plane.b
		}
		const hoverColor = {
			r: world.plane.rHover,
			g: world.plane.gHover,
			b: world.plane.bHover
		}
		gsap.to(hoverColor, {
			r: inititialColor.r,
			g: inititialColor.g,
			b: inititialColor.b,
			onUpdate: () => {
				// vertex 1
				color.setX(intersects[0].face.a, hoverColor.r)
				color.setY(intersects[0].face.a, hoverColor.g)
				color.setZ(intersects[0].face.a, hoverColor.b)

				// vertex 2
				color.setX(intersects[0].face.b, hoverColor.r)
				color.setY(intersects[0].face.b, hoverColor.g)
				color.setZ(intersects[0].face.b, hoverColor.b)

				// vertex 3
				color.setX(intersects[0].face.c, hoverColor.r)
				color.setY(intersects[0].face.c, hoverColor.g)
				color.setZ(intersects[0].face.c, hoverColor.b)

				color.needsUpdate = true
			}
		})
	}

	// camera animation
	if (!transition) {
		gsap.to(camera.rotation, {
		x: cameraOriginalXRotation + mouse.y * 0.5,
		y: -mouse.x * 0.075,
		duration: 4
		})
	}

	// transition animation
	if (transition) {
		
		// translation animation
		gsap.to(camera.position, {
			duration: 2,
			y: cameraTransitionPosition.y,
			z: cameraTransitionPosition.z,
			onComplete: () => {
				transitionOneDone = true
			}
		})

		// rotation animation
		gsap.to(camera.rotation, {
			duration: 2,
			x: -1.2,
			y: 0,
			z: 0
		})

		// text fade animation
		var el = document.getElementById('skyViewContainer')			
		gsap.to(textFade, {
			duration: 1,
			opacity: 0,
			onUpdate: () => {
				el.style.opacity = textFade.opacity
			}
		})
	}
}

animate();

// event listeners
addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1
	mouse.y = -((event.clientY / innerHeight) * 2 - 1)
})

const sizes = {
	width: window.innerWidth,
	height: window.innerHeigth
}

window.addEventListener('resize', () => {

	// update sizes
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	// update camera
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	// update renderer
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.getElementById('transitionBtn').addEventListener('click', function() {
	transition = true
})
