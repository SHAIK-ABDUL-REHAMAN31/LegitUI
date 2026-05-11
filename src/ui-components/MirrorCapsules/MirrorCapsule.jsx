'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './MirrorCapsules.css';



export default function MirrorCapsule({
  width = '100%',
  height = '100%',
  speed = 1,
  children,
  style = {},
  className = '',
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* ── Renderer ───────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    /* ── Scene & Camera ─────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    /* ── Resize ─────────────────────────────────────────────────────── */
    const onResize = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    /* ── Procedural env map (provides the mirror reflection streaks) ── */
    const cubeRT = new THREE.WebGLCubeRenderTarget(512, {
      type: THREE.HalfFloatType,
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
    scene.add(cubeCamera);

    const envScene = new THREE.Scene();
    envScene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 16),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          vertexShader: `
            varying vec3 vN;
            void main(){ vN=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
          `,
          fragmentShader: `
            varying vec3 vN;
            void main(){
              float u=vN.x*.5+.5, v=vN.y*.5+.5;
              vec3 c=mix(vec3(0.,.0,.07),vec3(0.,.04,.22),v);
              // white specular band — makes the rolling highlight on the pill
              c+=vec3(1.) * smoothstep(.06,.0,abs(u-.70))*smoothstep(.25,.85,v)*3.;
              // cyan secondary band
              c+=vec3(0.,.7,1.) * smoothstep(.08,.0,abs(u-.62))*smoothstep(.0,.45,v)*.7;
              // magenta/pink rim accent
              c+=vec3(1.,.0,.7)  * smoothstep(.09,.0,abs(u-.22))*.6;
              // purple back-rim
              c+=vec3(.55,.0,1.) * smoothstep(.09,.0,abs(u-.82))*smoothstep(.6,1.,v)*.4;
              gl_FragColor=vec4(c,1.);
            }
          `,
        })
      )
    );
    cubeCamera.update(renderer, envScene);

    /* ── Lights ─────────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x050515, 1.0));

    const key = new THREE.DirectionalLight(0xffffff, 6.0);
    key.position.set(5, 7, 9);
    scene.add(key);

    const pink = new THREE.PointLight(0xff00cc, 35, 25);
    pink.position.set(-5, -4, 6);
    scene.add(pink);

    const cyan = new THREE.PointLight(0x00ccff, 28, 25);
    cyan.position.set(6, 5, 5);
    scene.add(cyan);

    const purple = new THREE.PointLight(0x8800ff, 22, 22);
    purple.position.set(-4, 4, -4);
    scene.add(purple);

    /* ── Stadium (pill) geometry ───────────────────────────────────── */
    function stadium(halfLen, r) {
      const s = new THREE.Shape();
      s.moveTo(-halfLen, -r);
      s.lineTo(halfLen, -r);
      s.absarc(halfLen, 0, r, -Math.PI / 2, Math.PI / 2, false);
      s.lineTo(-halfLen, r);
      s.absarc(-halfLen, 0, r, Math.PI / 2, -Math.PI / 2, false);
      s.closePath();
      return s;
    }

    // Capsule proportions — sized to reach viewport corners
    // With FOV=44, z=10: screen half-height≈3.97, half-width≈7.03, half-diag≈8.07
    // We want: (TOUCH + HL + R) ≈ 8.0  and  (TOUCH - HL - R) ≈ 0.35 (small gap each side)
    const HL = 3.6;   // half-length of straight section
    const R = 0.62;  // end-cap radius (thinner → matches reference)
    const D = 0.17;  // slab depth (thin flat)
    const BT = 0.08;  // bevel thickness
    const BS = 0.07;  // bevel size

    const pillGeo = new THREE.ExtrudeGeometry(stadium(HL, R), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: BT,
      bevelSize: BS,
      bevelSegments: 14,
      curveSegments: 72,
    });
    pillGeo.translate(0, 0, -(D + BT) * 0.5);

    /* ── Mirror material ────────────────────────────────────────────── */
    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0b1d7a),
      metalness: 0.0,
      roughness: 0.022,
      clearcoat: 1.0,
      clearcoatRoughness: 0.014,
      reflectivity: 1.0,
      envMap: cubeRT.texture,
      envMapIntensity: 5.0,
      iridescence: 0.6,
      iridescenceIOR: 2.0,
    });

    /* ── Glow rim geometries ─────────────────────────────────────────── */
    function glowGeo(extraB = 0.07) {
      const g = new THREE.ExtrudeGeometry(stadium(HL, R), {
        depth: D + extraB,
        bevelEnabled: true,
        bevelThickness: BT + extraB,
        bevelSize: BS + extraB,
        bevelSegments: 14,
        curveSegments: 72,
      });
      g.translate(0, 0, -(D + extraB + BT + extraB) * 0.5);
      return g;
    }

    function glowMat(hex, op = 0.60) {
      return new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity: op,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      });
    }

    /* ── Build one capsule group ────────────────────────────────────── */
    // outer → world position + tilt (rotation.z)
    // inner → rolls around local X (the long axis)
    function buildCapsule(rimHex) {
      const outer = new THREE.Group();
      const inner = new THREE.Group();
      outer.add(inner);
      inner.add(new THREE.Mesh(pillGeo, mirrorMat));
      inner.add(new THREE.Mesh(glowGeo(.07), glowMat(rimHex, 0.65)));
      inner.add(new THREE.Mesh(glowGeo(.12), glowMat(rimHex, 0.25)));
      inner.add(new THREE.Mesh(glowGeo(.04), glowMat(0xffffff, 0.12)));
      return { outer, inner };
    }

    /* ── Position capsules ────────────────────────────────────────────
       TILT  = corner angle of the viewport (bottom-left → top-right)
       TOUCH = centre-to-near-end distance.
       GAP   = how much space to leave between the two facing ends
         near end position  = TOUCH - (HL+R)  should equal GAP/2
         far  end position  = TOUCH + (HL+R)  should land at screen corner
    ── */
    const TILT = Math.atan2(3.97, 7.03);  // matches actual viewport corner angle
    const GAP = 0.70;                     // total gap between the two facing ends
    const TOUCH = HL + R + GAP * 0.5;      // centre offset from origin
    const cx = Math.cos(TILT);
    const cy = Math.sin(TILT);

    // Cap 1: bottom-left, pink/magenta rim
    const { outer: o1, inner: i1 } = buildCapsule(0xff00cc);
    o1.rotation.z = TILT;
    o1.position.set(-TOUCH * cx, -TOUCH * cy, 0);
    scene.add(o1);

    // Cap 2: top-right, purple rim
    const { outer: o2, inner: i2 } = buildCapsule(0x9922ff);
    o2.rotation.z = TILT;
    o2.position.set(TOUCH * cx, TOUCH * cy, 0.06);  // tiny z-offset avoids z-fight
    scene.add(o2);

    /* ── Animation ──────────────────────────────────────────────────── */
    let animId, t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.011 * speed;

      // Roll each pill around its local X (long axis)
      i1.rotation.x = t;    // clockwise
      i2.rotation.x = -t;    // counter-clockwise

      // Very subtle world tilt — adds life without disturbing the layout
      o1.rotation.x = Math.sin(t * 0.14) * 0.045;
      o2.rotation.x = -Math.sin(t * 0.14) * 0.045;

      // Orbit lights → animated mirror reflections
      pink.position.set(Math.sin(t * 0.55) * 6 - 2, Math.cos(t * 0.45) * 5 - 2, 6);
      cyan.position.set(Math.cos(t * 0.48) * 6 + 2, Math.sin(t * 0.68) * 5 + 2, 5);
      purple.position.set(Math.cos(t * 0.33) * -4, Math.sin(t * 0.33) * 4, -4);

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ────────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      [pillGeo].forEach(g => g.dispose());
      scene.traverse(obj => {
        if (!obj.isMesh) return;
        obj.geometry.dispose();
        [].concat(obj.material).forEach(m => m.dispose());
      });
      cubeRT.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [speed]);

  return (
    <div
      className={`mirror-capsules-root ${className}`}
      style={{ position: 'relative', width, height, ...style }}
    >
      {/* WebGL canvas mount — fills parent */}
      <div
        ref={mountRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        aria-label="Animated 3D mirror capsules"
      />

      {/* Optional text / UI overlay */}
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>{children}</div>
        </div>
      )}
    </div>
  );
}