function createScene()
{
    const  scene = new THREE.Scene()
    const  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100)
    camera.position.y = 8
    camera.position.z = 100

    const  renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xFAEECD, 1)
    document.body.appendChild(renderer.domElement)

    const light = new THREE.PointLight(0xFFFFFF, 1.0)
    light.position.set(camera.position.x, camera.position.y, camera.position.z)
    scene.add(light)

    const amblight = new THREE.AmbientLight(0x404040, 0.5) // soft white light
    scene.add(amblight)

    return {
        scene,
        camera,
        renderer
    }
}


function useCoordinates ()
{
    const vertices = [
        new THREE.Vector3(0, 0, 0), // 0
        new THREE.Vector3(0, 5, -3), // 1
        new THREE.Vector3(5, 5, 0), // 2
        new THREE.Vector3(9, 9, 0), // 3
        new THREE.Vector3(5, 9, 3), // 4
        new THREE.Vector3(7, 13, 0), // 5
        new THREE.Vector3(3, 13, 0), // 6
        new THREE.Vector3(0, 11, 0), // 7
        new THREE.Vector3(5, 9, -3), // 8
        new THREE.Vector3(0, 8, -3), // 9
        new THREE.Vector3(0, 8, 3), // 10
        new THREE.Vector3(0, 5, 3), // 11
        new THREE.Vector3(-9, 9, 0), // 12
        new THREE.Vector3(-5, 5, 0), // 13
        new THREE.Vector3(-5, 9, -3), // 14
        new THREE.Vector3(-5, 9, 3), // 15
        new THREE.Vector3(-7, 13, 0), // 16
        new THREE.Vector3(-3, 13, 0), // 17
    ];

    const trianglesIndexes = [
    // face 1
     2,11,0, // This represents the 3 points A,B,C which compose the first triangle
     2,3,4,
     5,4,3,
     4,5,6,
     4,6,7,
     4,7,10,
     4,10,11, //
     4,11,2, //
     0,11,13,
     12,13,15,
     12,15,16,
     16,15,17,
     17,15,7,
     7,15,10,
     13,11,15, //
     15,11,10, //
    // face 2
     0,1,2,
     1,8,2, //
     9,8,1, //
     5,3,8,
     8,3,2,
     6,5,8,
     7,6,8,
     9,7,8,
     14,17,7,
     14,7,9,
     14,9,1, //
     14,1,13, //
     1,0,13,
     16,14,12,
     16,17,14,
     12,14,13]

    return {
        vertices,
        trianglesIndexes
    }
}

function createHeartMesh (coordinatesList, trianglesIndexes)
{
    const geo = new THREE.Geometry()
    for (let i in trianglesIndexes) {
        if ((i+1)%3 === 0) {
            geo.vertices.push(coordinatesList[trianglesIndexes[i-2]], coordinatesList[trianglesIndexes[i-1]], coordinatesList[trianglesIndexes[i]])
            geo.faces.push(new THREE.Face3(i-2, i-1, i))
        }
    }
    
    geo.computeVertexNormals()
    const material = new THREE.MeshPhongMaterial( { color: 0xc00000 } )
    const heartMesh = new THREE.Mesh(geo, material)
    
    return {
        geo,
        material,
        heartMesh
    }
}

function addWireFrameToMesh (mesh, geometry)
{
    const wireframe = new THREE.WireframeGeometry( geometry )
    const lineMat = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } )
    const line = new THREE.LineSegments(wireframe, lineMat)
    mesh.add(line)
}


let scaleThreshold = false
function beatingAnimation(mesh, scaleF)
{
    let beatingIncrement = scaleF / 300
    // while the scale value is below the max,
    // and the threshold is not reached, we increase it
    if (mesh.scale.x < scaleF && !scaleThreshold)
    {
        mesh.scale.x += beatingIncrement*2
        mesh.scale.y += beatingIncrement*2
        mesh.scale.z += beatingIncrement*2
        
        // When max value is reached, the flag can be switched
        if (mesh.scale.x >= scaleF)
            scaleThreshold = true
    }
    else if (scaleThreshold)
    {
        mesh.scale.x -= beatingIncrement
        mesh.scale.y -= beatingIncrement
        mesh.scale.z -= beatingIncrement
        
        // The mesh got back to its initial state
        // we can switch back the flag and go through the increasing path next time
        if (mesh.scale.x <= 1.0)
        {
            scaleThreshold = false
            startAnim = false // we must stop it right here or it will start over again
        }
    }
}

let startAnim = false // we define a flag variable that will trigger the animation when true
function handleMouseIntersection(camera, scene, meshUuid) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onMouseIntersection(event) {
        const coordinatesObject = event.changedTouches ? event.changedTouches[0] : event
        mouse.x = ( coordinatesObject.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( coordinatesObject.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects( scene.children );
        if (intersects.length && intersects[0].object.uuid === meshUuid) {
            startAnim = true
        }
    }
    mouse.x = 1
    mouse.y = 1
    return {
        onMouseIntersection
    }
}

function init()
{
    const {scene, camera, renderer} = createScene()
    const {vertices, trianglesIndexes} = useCoordinates()
    const {geo, material, heartMesh } = createHeartMesh(vertices, trianglesIndexes)
    addWireFrameToMesh(heartMesh, geo)
    scene.add(heartMesh)
    
    const {onMouseIntersection} = handleMouseIntersection(camera, scene,  heartMesh.uuid)
    window.addEventListener('click', onMouseIntersection, false)

    const animate = function ()
    {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
        heartMesh.rotation.y -= 0.005
        startAnim && beatingAnimation(heartMesh, 1.05)
    }
    
    animate()
}

init()

