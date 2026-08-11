import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from 'three'

const loader = new TextureLoader()

function configureTexture(
  texture: Texture,
  repeatX: number,
  repeatY: number
) {
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 8
  texture.needsUpdate = true

  return texture
}

function loadDetail(
  path: string,
  repeatX: number,
  repeatY: number
) {
  return configureTexture(
    loader.load(path),
    repeatX,
    repeatY
  )
}

function createCanvasTexture(
  draw: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => void,
  repeatX: number,
  repeatY: number
) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not create course texture')
  }

  draw(context, canvas.width, canvas.height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return configureTexture(
    texture,
    repeatX,
    repeatY
  )
}

function addFineNoise(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  strength: number
) {
  for (let i = 0; i < amount; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const light = Math.random() > 0.5
    const alpha = Math.random() * strength

    context.fillStyle = light
      ? `rgba(255,255,255,${alpha})`
      : `rgba(0,0,0,${alpha})`

    context.fillRect(x, y, 1.5, 1.5)
  }
}

function addGrassFibers(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  maxLength: number,
  alpha: number
) {
  context.lineWidth = 1

  for (let i = 0; i < amount; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const length = 1 + Math.random() * maxLength

    context.strokeStyle =
      Math.random() > 0.5
        ? `rgba(220,245,205,${Math.random() * alpha})`
        : `rgba(10,40,18,${Math.random() * alpha})`

    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(
      x + (Math.random() - 0.5) * 1.5,
      y - length
    )
    context.stroke()
  }
}

function addRoughPatches(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const radiusX = 7 + Math.random() * 26
    const radiusY = 5 + Math.random() * 18

    context.beginPath()
    context.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    )

    context.fillStyle =
      Math.random() > 0.55
        ? 'rgba(5,38,13,0.08)'
        : 'rgba(135,176,100,0.06)'

    context.fill()
  }
}

const fairwayColor = createCanvasTexture(
  (context, width, height) => {
    const stripeCount = 10
    const stripeHeight = height / stripeCount

    for (let i = 0; i < stripeCount; i++) {
      const evenStripe = i % 2 === 0

      context.fillStyle = evenStripe
        ? '#4f9947'
        : '#61aa50'

      context.fillRect(
        0,
        i * stripeHeight,
        width,
        stripeHeight
      )

      const gradient = context.createLinearGradient(
        0,
        i * stripeHeight,
        0,
        (i + 1) * stripeHeight
      )

      gradient.addColorStop(
        0,
        evenStripe
          ? 'rgba(255,255,255,0.055)'
          : 'rgba(0,0,0,0.028)'
      )
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      context.fillStyle = gradient
      context.fillRect(
        0,
        i * stripeHeight,
        width,
        stripeHeight
      )
    }

    addGrassFibers(
      context,
      width,
      height,
      1800,
      3,
      0.04
    )

    addFineNoise(
      context,
      width,
      height,
      1200,
      0.028
    )
  },
  1,
  8
)

const firstCutColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#3c783d'
    context.fillRect(0, 0, width, height)

    addGrassFibers(
      context,
      width,
      height,
      3200,
      6,
      0.055
    )

    addRoughPatches(
      context,
      width,
      height,
      40
    )

    addFineNoise(
      context,
      width,
      height,
      2200,
      0.045
    )
  },
  8,
  28
)

const roughColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#285633'
    context.fillRect(0, 0, width, height)

    addRoughPatches(
      context,
      width,
      height,
      115
    )

    addGrassFibers(
      context,
      width,
      height,
      6800,
      12,
      0.085
    )

    addFineNoise(
      context,
      width,
      height,
      5200,
      0.065
    )
  },
  16,
  44
)

const teeColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#69ad57'
    context.fillRect(0, 0, width, height)

    for (let y = 0; y < height; y += 56) {
      context.fillStyle =
        y % 112 === 0
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(0,0,0,0.022)'
      context.fillRect(0, y, width, 56)
    }

    addFineNoise(
      context,
      width,
      height,
      850,
      0.02
    )
  },
  4,
  4
)

const greenColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#72b55b'
    context.fillRect(0, 0, width, height)

    const gradient = context.createLinearGradient(
      0,
      0,
      width,
      height
    )

    gradient.addColorStop(0, 'rgba(255,255,255,0.025)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.025)')

    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)

    addFineNoise(
      context,
      width,
      height,
      550,
      0.014
    )
  },
  5,
  5
)

const sandColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#d8c58e'
    context.fillRect(0, 0, width, height)

    addFineNoise(
      context,
      width,
      height,
      4200,
      0.08
    )
  },
  3,
  3
)

const pathColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#a7a18f'
    context.fillRect(0, 0, width, height)

    addFineNoise(
      context,
      width,
      height,
      3000,
      0.06
    )
  },
  2,
  34
)

export const courseMaterials = {
  rough: {
    map: roughColor,
    normalMap: loadDetail(
      '/textures/rough/normal.jpg',
      20,
      58
    ),
    roughnessMap: loadDetail(
      '/textures/rough/roughness.jpg',
      20,
      58
    ),
  },

  firstCut: {
    map: firstCutColor,
    normalMap: loadDetail(
      '/textures/rough/normal.jpg',
      14,
      42
    ),
    roughnessMap: loadDetail(
      '/textures/rough/roughness.jpg',
      14,
      42
    ),
  },

  fairway: {
    map: fairwayColor,
    normalMap: loadDetail(
      '/textures/fairway/normal.jpg',
      6,
      34
    ),
    roughnessMap: loadDetail(
      '/textures/fairway/roughness.jpg',
      6,
      34
    ),
  },

  tee: {
    map: teeColor,
    normalMap: loadDetail(
      '/textures/green/normal.jpg',
      5,
      5
    ),
    roughnessMap: loadDetail(
      '/textures/green/roughness.jpg',
      5,
      5
    ),
  },

  green: {
    map: greenColor,
    normalMap: loadDetail(
      '/textures/green/normal.jpg',
      7,
      7
    ),
    roughnessMap: loadDetail(
      '/textures/green/roughness.jpg',
      7,
      7
    ),
  },

  sand: {
    map: sandColor,
    normalMap: loadDetail(
      '/textures/sand/normal.png',
      3,
      3
    ),
    roughnessMap: loadDetail(
      '/textures/sand/roughness.jpg',
      3,
      3
    ),
  },

  path: {
    map: pathColor,
    normalMap: loadDetail(
      '/textures/path/normal.png',
      2,
      34
    ),
    roughnessMap: loadDetail(
      '/textures/path/roughness.jpg',
      2,
      34
    ),
  },
}
