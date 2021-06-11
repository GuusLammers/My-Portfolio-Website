import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap'
import { CustomEase } from "gsap/CustomEase"

gsap.registerPlugin(CustomEase)

// gui
//const gui = new dat.GUI()
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

/*
gui.add(world.plane, 'width', 1, 150).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 5, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 5, 100).onChange(generatePlane)
gui.add(world.plane, 'r', 0, 1).onChange(generatePlane)
gui.add(world.plane, 'g', 0, 1).onChange(generatePlane)
gui.add(world.plane, 'b', 0, 1).onChange(generatePlane)
gui.add(world.plane, 'rHover', 0, 1)
gui.add(world.plane, 'gHover', 0, 1)
gui.add(world.plane, 'bHover', 0, 1)
*/

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
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const cameraOriginalXRotation = -0.2
camera.position.y = 1
camera.position.z = 5
camera.rotation.x = cameraOriginalXRotation

const cameraTransitionPositionOne = {
	x: 0,
	y: -1,
	z: 10
}

const cameraTransitionPositionTwo = {
	x: 0,
	y: 500,
	z: -2000
}


// renderer
const renderer = new THREE.WebGLRenderer(
{
	antialias: true
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
renderer.antialias = true
document.body.appendChild(renderer.domElement)

// orbit controls
//new OrbitControls(camera, renderer.domElement)

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

const sphereGeometry = new THREE.SphereGeometry(15, 25, 25)

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

const sphereMaterial = new THREE.MeshStandardMaterial({
	map: new THREE.TextureLoader().load('./statics/moon.jpg')
})

// points
const stars = new THREE.Points(starGeometry, starMaterial)

// meshs
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.rotateX(-1.5)
generatePlane()

const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphereMesh.position.y = 75
sphereMesh.position.z = -100

// lights
const light =  new THREE.DirectionalLight(0xFFFFFF, 0.5)
light.position.set(0, 2, -0.75)

const sphereLight = new THREE.DirectionalLight(0xFFFFFF, 0.2)
sphereLight.target = sphereMesh

// objects added to scene
scene.add(planeMesh)
scene.add(light)
scene.add(stars)
//scene.add(sphereMesh)
//scene.add(sphereLight)

// mouse position
const mouse = {
	x: 0,
	y: 0
}

const textFade = {
	opacity: 1
}

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

	// sphere animation
	sphereMesh.rotation.y += 0.0025

	// transition animation
	if (transition) {
		
		gsap.to(camera.position, {
			duration: 2,
			y: cameraTransitionPositionOne.y,
			z: cameraTransitionPositionOne.z,
			onComplete: () => {
				transitionOneDone = true
			}
		})

		gsap.to(camera.rotation, {
			duration: 2,
			x: 0.25,
			y: 0,
			z: 0
		})

		if (transitionOneDone) {
			gsap.to(camera.position, {
				duration: 1.5,
				ease: 'power4.out',
				y: cameraTransitionPositionTwo.y,
				z: cameraTransitionPositionTwo.z,
				onComplete: () => {
					if (!redirected) {
						window.location.href = "http://localhost:3000/"
						redirected = true
					}
				}
			})

			// text fade animation
			var el = document.getElementById('mainContainer')
			
			gsap.to(textFade, {
				duration: 1,
				opacity: 0,
				onUpdate: () => {
					el.style.opacity = textFade.opacity
				}
			})
		}
	}
}

animate()

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
