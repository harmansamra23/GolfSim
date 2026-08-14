import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'

const sunsetBackground = new THREE.Color('#d98159')
const sunsetFog = new THREE.Color('#c98165')
const sunsetSky = new THREE.Vector3(-120, 10, -160)
const sunsetSun = new THREE.Vector3(-120, 34, -90)

export function SunsetEnvironment() {
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    scene.background = sunsetBackground

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(sunsetFog)
      scene.fog.near = 185
      scene.fog.far = 920
    }

    gl.toneMappingExposure = 0.9

    scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        object.position.copy(sunsetSun)
        object.color.set('#ffad69')
        object.intensity = 2.15
        return
      }

      if (object instanceof THREE.HemisphereLight) {
        object.color.set('#ffd8bd')
        object.groundColor.set('#49382b')
        object.intensity = 0.72
        return
      }

      if (object instanceof THREE.AmbientLight) {
        object.color.set('#e9b69b')
        object.intensity = 0.11
        return
      }

      if (!(object instanceof THREE.Mesh)) return

      const material = object.material
      const materials = Array.isArray(material) ? material : [material]

      for (const candidate of materials) {
        if (!(candidate instanceof THREE.ShaderMaterial)) continue

        const sunPosition = candidate.uniforms.sunPosition
        const turbidity = candidate.uniforms.turbidity
        const rayleigh = candidate.uniforms.rayleigh
        const mieCoefficient = candidate.uniforms.mieCoefficient
        const mieDirectionalG = candidate.uniforms.mieDirectionalG

        if (!(sunPosition?.value instanceof THREE.Vector3)) continue

        sunPosition.value.copy(sunsetSky)

        if (typeof turbidity?.value === 'number') {
          turbidity.value = 10
        }

        if (typeof rayleigh?.value === 'number') {
          rayleigh.value = 1.05
        }

        if (typeof mieCoefficient?.value === 'number') {
          mieCoefficient.value = 0.018
        }

        if (typeof mieDirectionalG?.value === 'number') {
          mieDirectionalG.value = 0.9
        }
      }
    })
  })

  return null
}
