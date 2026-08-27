// ============================================
// Three.js 3D 特效系统
// ============================================

class ThreeEffects {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particleGeometry = null;
        this.particleMaterial = null;
        this.cubes = [];
        this.spheres = [];
        this.lights = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationId = null;
        this.isLoaded = false;
        this.hasThree = typeof THREE !== 'undefined';
        
        if (this.hasThree) {
            this.init();
        } else {
            console.warn('Three.js not loaded, skipping 3D effects');
            this.disableCanvas();
        }
    }

    disableCanvas() {
        const canvas = document.getElementById('threeCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
    }

    init() {
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) return;

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0c, 50, 150);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 100;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // 添加灯光
        this.setupLights();

        // 创建粒子系统
        this.createParticles();

        // 创建几何形状
        this.createGeometricShapes();

        // 添加鼠标交互
        this.setupMouseInteraction();

        // 监听窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // 开始动画循环
        this.animate();

        this.isLoaded = true;
    }

    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
        this.scene.add(ambientLight);

        // 主光源
        const mainLight = new THREE.DirectionalLight(0xc9a94e, 0.8);
        mainLight.position.set(50, 50, 50);
        this.scene.add(mainLight);

        // 点光源
        const pointLight1 = new THREE.PointLight(0xc9a94e, 1, 100);
        pointLight1.position.set(-30, 20, 30);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8888ff, 0.5, 80);
        pointLight2.position.set(30, -20, 20);
        this.scene.add(pointLight2);

        this.lights.push(mainLight, pointLight1, pointLight2);
    }

    createParticles() {
        const particleCount = 2000;
        this.particleGeometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // 随机位置
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;

            // 随机颜色（金色系）
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                colors[i3] = 0.8;
                colors[i3 + 1] = 0.66;
                colors[i3 + 2] = 0.3;
            } else if (colorChoice < 0.8) {
                colors[i3] = 0.9;
                colors[i3 + 1] = 0.83;
                colors[i3 + 2] = 0.55;
            } else {
                colors[i3] = 0.53;
                colors[i3 + 1] = 0.53;
                colors[i3 + 2] = 0.66;
            }

            sizes[i] = Math.random() * 3 + 0.5;
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    pos.y += sin(time * 0.5 + position.x * 0.02) * 2.0;
                    pos.x += cos(time * 0.3 + position.y * 0.02) * 1.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particles);
    }

    createGeometricShapes() {
        // 创建旋转的立方体
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.BoxGeometry(3, 3, 3);
            const material = new THREE.MeshPhongMaterial({
                color: 0xc9a94e,
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );
            
            cube.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };

            this.cubes.push(cube);
            this.scene.add(cube);
        }

        // 创建球体
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.SphereGeometry(2, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x8888ff,
                transparent: true,
                opacity: 0.2,
                wireframe: true
            });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );

            sphere.scaleSpeed = 0.005 + Math.random() * 0.005;
            sphere.scaleDirection = Math.random() > 0.5 ? 1 : -1;

            this.spheres.push(sphere);
            this.scene.add(sphere);
        }
    }

    setupMouseInteraction() {
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth - 0.5) * 100;
            this.mouseY = -(event.clientY / window.innerHeight - 0.5) * 100;
        });

        document.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            this.camera.position.z = 100 + scrollY * 0.05;
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.001;

        // 更新粒子着色器时间
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.time.value = time;
        }

        // 旋转立方体
        this.cubes.forEach(cube => {
            cube.rotation.x += cube.rotationSpeed.x;
            cube.rotation.y += cube.rotationSpeed.y;
            cube.rotation.z += cube.rotationSpeed.z;
            
            // 轻微浮动
            cube.position.y += Math.sin(time * 0.5 + cube.position.x) * 0.02;
        });

        // 球体呼吸效果
        this.spheres.forEach(sphere => {
            sphere.scaleDirection *= sphere.scale.x > 1.5 || sphere.scale.x < 0.8 ? -1 : 1;
            sphere.scale.x += sphere.scaleSpeed * sphere.scaleDirection;
            sphere.scale.y += sphere.scaleSpeed * sphere.scaleDirection;
            sphere.scale.z += sphere.scaleSpeed * sphere.scaleDirection;

            sphere.rotation.y += 0.005;
        });

        // 粒子系统旋转
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }

        // 相机跟随鼠标移动
        if (this.camera) {
            this.camera.position.x += (this.mouseX * 0.3 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouseY * 0.3 - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.onWindowResize.bind(this));

        // 清理几何体和材质
        if (this.particleGeometry) {
            this.particleGeometry.dispose();
        }
        if (this.particleMaterial) {
            this.particleMaterial.dispose();
        }

        this.cubes.forEach(cube => {
            cube.geometry.dispose();
            cube.material.dispose();
        });

        this.spheres.forEach(sphere => {
            sphere.geometry.dispose();
            sphere.material.dispose();
        });

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// 页面加载完成后初始化Three.js效果
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保页面其他元素加载完成
    setTimeout(() => {
        try {
            window.threeEffects = new ThreeEffects();
        } catch (error) {
            console.error('Failed to initialize Three.js effects:', error);
            const canvas = document.getElementById('threeCanvas');
            if (canvas) {
                canvas.style.display = 'none';
            }
        }
    }, 500);
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.threeEffects) {
        window.threeEffects.destroy();
    }
});
