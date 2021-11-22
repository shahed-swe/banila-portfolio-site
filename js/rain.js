       // Texture width for simulation
        var WIDTH = 128;

        // Water size in system units
        var BOUNDS = 512;
        var BOUNDS_HALF = BOUNDS * 0.5;

        var container, stats;
        window.camera;
        window.mesh1;
        var scene, renderer;
        var mouseMoved = false;
        var mouseCoords = new THREE.Vector2();
        var raycaster = new THREE.Raycaster();
        var material;
        var waterMesh;
        var meshRay;
        var gpuCompute;
        var heightmapVariable;
        var waterUniforms;
        var smoothShader;
        var readWaterLevelShader;
        var readWaterLevelRenderTarget;
        var readWaterLevelImage;
        var waterNormal = new THREE.Vector3();

        var NUM_SPHERES = 5;
        var spheres = [];
        var spheresEnabled = true;

        var simplex = new SimplexNoise();

		var materialColor = (document.querySelector('body').classList.contains('d-mode'))?0xe4fe32: 0x333541;	

        var sun2 = new THREE.DirectionalLight( 0xffffff, 1 );
        var sun = new THREE.DirectionalLight( 0x1a1d2c, 1 );
        var filterShininess = 50;
        
        var raton = 40;
        var viscosidad = 0.995;
        var compensacion = 0;


			

				// Initiate function or other initializations here
			setTimeout(function(){
				document.querySelector('html').classList.add('aqua');
				init();				
				animate();				
				},3000) //delayed animation


			
			//animate();

        function init() {

            container = document.getElementById( 'rain' );
            

            window.camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 3000 );
            window.camera.position.set( 0, 280, 0 );
            window.camera.rotation.set( -1.5,0,0,"XYZ");
            window.camera.quaternion.set(-0.7075,0,0,0.74);
            //window.camera.up.set(0,1,0);

            scene = new THREE.Scene();

            sun.position.set( 300, 400, 175 );
            scene.add( sun );


            
            sun2.position.set( -100, 350, -200 );
            scene.add( sun2 );


            renderer = new THREE.WebGLRenderer();
            //renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setPixelRatio(1);
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );


			initWater();
            
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
            document.addEventListener( 'touchstart', onDocumentTouchStart, false );
            document.addEventListener( 'touchmove', onDocumentTouchMove, false );
            document.getElementById("v-mode").addEventListener("click", onModeClick, false);
            document.getElementById("scroll-v-mode").addEventListener("click", onModeClick, false);
			

            window.addEventListener( 'resize', onWindowResize, false );


            

        }


        function initWater() {

            var geometry = new THREE.PlaneBufferGeometry( BOUNDS, BOUNDS, WIDTH - 1, WIDTH - 1 );

            // material: make a THREE.ShaderMaterial clone of THREE.MeshPhongMaterial, with customized vertex shader
            material = new THREE.ShaderMaterial( {
                uniforms: THREE.UniformsUtils.merge( [
                    THREE.ShaderLib[ 'phong' ].uniforms,
                    {
                        "heightmap": { value: null }
                    }
                ] ),
                vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
                fragmentShader: THREE.ShaderChunk[ 'meshphong_frag' ]

            } );

            material.lights = true;

            // Material attributes from THREE.MeshPhongMaterial
            material.color = new THREE.Color( materialColor )
            material.specular = new THREE.Color( 0x111111 );
            material.shininess = 50;

            // Sets the uniforms with the material values
            material.uniforms[ "diffuse" ].value = material.color;
            material.uniforms[ "specular" ].value = material.specular;
            material.uniforms[ "shininess" ].value = Math.max( material.shininess, 1e-4 );
            material.uniforms[ "opacity" ].value = material.opacity;

            // Defines
            material.defines.WIDTH = WIDTH.toFixed( 1 );
            material.defines.BOUNDS = BOUNDS.toFixed( 1 );

            waterUniforms = material.uniforms;

            waterMesh = new THREE.Mesh( geometry, material );
            waterMesh.rotation.x = - Math.PI / 2;
            waterMesh.matrixAutoUpdate = false;
            waterMesh.updateMatrix();

            scene.add( waterMesh );

            // THREE.Mesh just for mouse raycasting
            var geometryRay = new THREE.PlaneBufferGeometry( BOUNDS, BOUNDS, 1, 1 );
            meshRay = new THREE.Mesh( geometryRay, new THREE.MeshBasicMaterial( { color: 0xFFFFFF, visible: false } ) );
            meshRay.rotation.x = - Math.PI / 2;
            meshRay.matrixAutoUpdate = false;
            meshRay.updateMatrix();
            scene.add( meshRay );

            // Creates the gpu computation class and sets it up

            gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

            var heightmap0 = gpuCompute.createTexture();

            fillTexture( heightmap0 );

            heightmapVariable = gpuCompute.addVariable( "heightmap", document.getElementById( 'heightmapFragmentShader' ).textContent, heightmap0 );

            gpuCompute.setVariableDependencies( heightmapVariable, [ heightmapVariable ] );
            
            heightmapVariable.material.uniforms[ "mousePos" ] = { value: new THREE.Vector2( 50, 50 ) };
            heightmapVariable.material.uniforms[ "mouseSize" ] = { value: 60.0 };
            heightmapVariable.material.uniforms[ "viscosityConstant" ] = { value: 0.985 };
            heightmapVariable.material.uniforms[ "heightCompensation" ] = { value: 0 };
            heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed( 1 );
            
            heightmapVariable.material.uniforms[ "mouseSize" ].value = raton;
            heightmapVariable.material.uniforms[ "viscosityConstant" ].value = viscosidad;
            heightmapVariable.material.uniforms[ "heightCompensation" ].value = compensacion;

            var error = gpuCompute.init();
            if ( error !== null ) {

                console.error( error );

            }

            // Create compute shader to smooth the water surface and velocity
            smoothShader = gpuCompute.createShaderMaterial( document.getElementById( 'smoothFragmentShader' ).textContent, { smoothTexture: { value: null } } );

            // Create compute shader to read water level
            readWaterLevelShader = gpuCompute.createShaderMaterial( document.getElementById( 'readWaterLevelFragmentShader' ).textContent, {
                point1: { value: new THREE.Vector2() },
                levelTexture: { value: null }
            } );
            readWaterLevelShader.defines.WIDTH = WIDTH.toFixed( 1 );
            readWaterLevelShader.defines.BOUNDS = BOUNDS.toFixed( 1 );

            // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
            readWaterLevelImage = new Uint8Array( 4 * 1 * 4 );

            readWaterLevelRenderTarget = new THREE.WebGLRenderTarget( 4, 1, {
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                type: THREE.UnsignedByteType,
                stencilBuffer: false,
                depthBuffer: false
            } );

        }

        function fillTexture( texture ) {

            var waterMaxHeight = 10;

            function noise( x, y ) {

                var multR = waterMaxHeight;
                var mult = 0.025;
                var r = 0;
                for ( var i = 0; i < 15; i ++ ) {

                    r += multR * simplex.noise( x * mult, y * mult );
                    multR *= 0.53 + 0.025 * i;
                    mult *= 1.25;

                }
                return r;

            }

            var pixels = texture.image.data;

            var p = 0;
            for ( var j = 0; j < WIDTH; j ++ ) {

                for ( var i = 0; i < WIDTH; i ++ ) {

                    var x = i * 32 / WIDTH;
                    var y = j * 32 / WIDTH;

                    pixels[ p + 0 ] = noise( x, y );
                    pixels[ p + 1 ] = pixels[ p + 0 ];
                    pixels[ p + 2 ] = 0;
                    pixels[ p + 3 ] = 1;

                    p += 4;

                }

            }

        }

        function smoothWater() {

            var currentRenderTarget = gpuCompute.getCurrentRenderTarget( heightmapVariable );
            var alternateRenderTarget = gpuCompute.getAlternateRenderTarget( heightmapVariable );

            for ( var i = 0; i < 10; i ++ ) {

                smoothShader.uniforms[ "smoothTexture" ].value = currentRenderTarget.texture;
                gpuCompute.doRenderTarget( smoothShader, alternateRenderTarget );

                smoothShader.uniforms[ "smoothTexture" ].value = alternateRenderTarget.texture;
                gpuCompute.doRenderTarget( smoothShader, currentRenderTarget );

            }

        }

        function onWindowResize() {

            window.camera.aspect = window.innerWidth / window.innerHeight;
            window.camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        function setMouseCoords( x, y ) {

            mouseCoords.set( ( x / renderer.domElement.clientWidth ) * 2 - 1, - ( y / renderer.domElement.clientHeight ) * 2 + 1 );
            mouseMoved = true;

        }

        function onDocumentMouseMove( event ) {

            setMouseCoords( event.clientX, event.clientY );

        }

        function onDocumentTouchStart( event ) {

            if ( event.touches.length === 1 ) {

                event.preventDefault();

                setMouseCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );


            }

        }

        function onDocumentTouchMove( event ) {

            if ( event.touches.length === 1 ) {

                event.preventDefault();

                setMouseCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );


            }

        }

        var req;
            var Mode = new Event('v-mode');			
                    function onModeClick(event){

                                event.preventDefault();
                                window.dispatchEvent(Mode);
                            if(document.querySelector('body').classList.contains('l-mode')){
                                
                                document.querySelector('body').classList.remove('l-mode');
                                document.querySelector('body').classList.add('d-mode');
                                window.cancelAnimationFrame( req );
                                material.uniforms[ "diffuse" ].value = new THREE.Color(0xe4fe32);
                                animate();
                            }else{
                            
                                document.querySelector('body').classList.remove('d-mode');
                                document.querySelector('body').classList.add('l-mode');
                                window.cancelAnimationFrame( req );
                                material.uniforms[ "diffuse" ].value = new THREE.Color(0x333541);
                                animate();
                                }
                
                        }
                function onstartMode(){
                    event.preventDefault();
                   
                    window.dispatchEvent(Mode);
                    window.cancelAnimationFrame( req );
                    material.uniforms[ "diffuse" ].value = new THREE.Color(0xe4fe32);
                    animate();
                    }		
                        
                        
            window.addEventListener('cancelAnimation', function(e){
                
                window.cancelAnimationFrame(req);
                clearThree(scene)
                },false)					
            
            window.addEventListener('restartAnimation', function(e){
                
                scene = new THREE.Scene();
                scene.add( sun );
                scene.add( sun2 );
                scene.add( waterMesh );
                animate();
                },false)		
            
                        

        var mouse=0;
        var mouseT=false;
        var mouseD=false;
        var mouseT1=false;
        var mouseT2=false;
        var mouseT3=false;
        var mouseT4=false;
        var mouseT5=false;
        var mouseT6=false;
        var mouseT7=false;
        var mouseT8=false;
        var mouseT9=false;
        var mouseT10=false;
        var mouseT11=false;
                    function animate() {

                        req=window.requestAnimationFrame( animate );

                        render();

                        mouse++;
                        
                    }
        function clearThree(obj){
        while(obj.children.length > 0){ 
            clearThree(obj.children[0])
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose()

        if(obj.material){ 
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
            if(!obj.material[prop])
                return         
            if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')                                  
                obj.material[prop].dispose()                                                        
            })
            obj.material.dispose()
        }
        }  

        function render() {

            // Set uniforms: mouse interaction
            var uniforms = heightmapVariable.material.uniforms;
            if ( mouseMoved ) {
                
                raycaster.setFromCamera( mouseCoords, window.camera );

                var intersects = raycaster.intersectObject( meshRay );

                if ( intersects.length > 0 ) {

                    var point = intersects[ 0 ].point;
                    uniforms[ "mousePos" ].value.set( point.x, point.z );
                    mouse=0;

                } else {

                    uniforms[ "mousePos" ].value.set( 10000, 10000 );

                }

                mouseMoved = false;

            }else{
                raycaster.setFromCamera( mouseCoords, window.camera );

                var intersects = raycaster.intersectObject( meshRay );
                if(mouseT11){
                     uniforms[ "mousePos" ].value.set(-200, 10 );
                    mouseT11=false;
                    }	
                if(mouseT10){
                    uniforms[ "mousePos" ].value.set(-200, 0 );
                    mouseT11=true;
                    mouseT10=false;
                    }	
                if(mouseT9){
                    uniforms[ "mousePos" ].value.set(-200, 10 );
                    mouseT10=true;
                    mouseT9=false;
                    }												
                if(mouseT8){
                    uniforms[ "mousePos" ].value.set(-200, 0 );
                    mouseT9=true;
                    mouseT8=false;
                    }	
                if(mouseT7){
                    uniforms[ "mousePos" ].value.set( -200, 10 );
                    mouseT8=true;
                    mouseT7=false;
                    }											
                if(mouseT6){
                    uniforms[ "mousePos" ].value.set(-200, 0 );
                    mouseT6=false;
                    }	
                if(mouseT5){
                    uniforms[ "mousePos" ].value.set(-200, 10 );
                    mouseT6=true;
                    mouseT5=false;
                    }	
                if(mouseT4){
                    uniforms[ "mousePos" ].value.set(-200, 0 );
                    mouseT5=true;
                    mouseT4=false;
                    }												
                if(mouseT3){
                    uniforms[ "mousePos" ].value.set(-200, 10 );
                    mouseT4=true;
                    mouseT3=false;
                    }	
                if(mouseT2){
                    uniforms[ "mousePos" ].value.set( -200, 0 );
                    mouseT3=true;
                    mouseT2=false;
                    }												
                if(mouseT1){
                    uniforms[ "mousePos" ].value.set( -200, 10 );
                    mouseT2=true;
                    mouseT1=false;
                    }					
                
                if(mouseD){
                    uniforms[ "mousePos" ].value.set( -200, 0 );
                    mouseT1=true
                    mouseD=false;
                    }
            
                if(mouseT){
                    uniforms[ "mousePos" ].value.set( -200, 10 );
                    mouseT=false;
                    mouseD=true;
                    }
                
                if(mouse%200==0){
                    mouseT=true;
                    uniforms[ "mousePos" ].value.set( -200, 0 );
                    }else {

                    uniforms[ "mousePos" ].value.set( 10000, 10000 );	
                    
                    
                }
            }

            // Do the gpu computation
            gpuCompute.compute();

            // Get compute output in custom uniform
            waterUniforms[ "heightmap" ].value = gpuCompute.getCurrentRenderTarget( heightmapVariable ).texture;

            // Render
            renderer.render( scene, window.camera );

        }

    
