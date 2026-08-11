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
        ? `rgba(225,248,207,${Math.random() * alpha})`
        : `rgba(8,35,15,${Math.random() * alpha})`

    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(
      x + (Math.random() - 0.5) * 2,
      y - length
    )
    context.stroke()
  }
}

function addRoughPatches(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  strength: number
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const radiusX = 10 + Math.random() * 38
    const radiusY = 7 + Math.random() * 28

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
      Math.random() > 0.5
        ? `rgba(4,30,12,${strength})`
        : `rgba(150,190,105,${strength * 0.7})`

    context.fill()
  }
}

const fairwayColor = createCanvasTexture(
  (context, width, height) => {
    const stripeCount = 8
    const stripeHeight = height / stripeCount

    for (let i = 0; i < stripeCount; i++) {
      const evenStripe = i % 2 === 0

      context.fillStyle = evenStripe
        ? '#79b85b'
        : '#91ca69'

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
          ? 'rgba(255,255,255,0.09)'
          : 'rgba(0,0,0,0.055)'
      )
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      context.fillStyle = gradient
      context.fillRect(
        0,
        i * stripeHeight,
        width,
        stripeHeight
      )

      context.fillStyle = 'rgba(255,255,255,0.04)'
      context.fillRect(
        0,
        i * stripeHeight,
        width,
        2
      )
    }

    addGrassFibers(
      context,
      width,
      height,
      1300,
      2.5,
      0.035
    )

    addFineNoise(
      context,
      width,
      height,
      900,
      0.025
    )
  },
  1,
  7
)

const firstCutColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#527f43'
    context.fillRect(0, 0, width, height)

    addRoughPatches(
      context,
      width,
      height,
      34,
      0.055
    )

    addGrassFibers(
      context,
      width,
      height,
      3600,
      7,
      0.075
    )

    addFineNoise(
      context,
      width,
      height,
      2400,
      0.055
    )
  },
  9,
  30
)

const roughColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#274c2d'
    context.fillRect(0, 0, width, height)

    addRoughPatches(
      context,
      width,
      height,
      130,
      0.11
    )

    addGrassFibers(
      context,
      width,
      height,
      7600,
      15,
      0.13
    )

    addFineNoise(
      context,
      width,
      height,
      5600,
      0.085
    )
  },
  14,
  38
)

const teeColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#82c463'
    context.fillRect(0, 0, width, height)

    for (let y = 0; y < height; y += 64) {
      context.fillStyle =
        y % 128 === 0
          ? 'rgba(255,255,255,0.055)'
          : 'rgba(0,0,0,0.025)'
      context.fillRect(0, y, width, 64)
    }

    addFineNoise(
      context,
      width,
      height,
      650,
      0.018
    )
  },
  4,
  4
)

const greenColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#8bcf6d'
    context.fillRect(0, 0, width, height)

    const gradient = context.createLinearGradient(
      0,
      0,
      width,
      height
    )

    gradient.addColorStop(0, 'rgba(255,255,255,0.045)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.03)')

    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)

    addFineNoise(
      context,
      width,
      height,
      420,
      0.012
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
      12,
      34
    ),
    roughnessMap: loadDetail(
      '/textures/rough/roughness.jpg',
      12,
      34
    ),
  },

  firstCut: {
    map: firstCutColor,
    normalMap: loadDetail(
      '/textures/rough/normal.jpg',
      10,
      32
    ),
    roughnessMap: loadDetail(
      '/textures/rough/roughness.jpg',
      10,
      32
    ),
  },

  fairway: {
    map: fairwayColor,
    normalMap: loadDetail(
      '/textures/fairway/normal.jpg',
      4,
      26
    ),
    roughnessMap: loadDetail(
      '/textures/fairway/roughness.jpg',
      4,
      26
    ),
  },

  tee: {
    map: teeColor,
    normalMap: loadDetail(
      '/textures/green/normal.jpg',
      4,
      4
    ),
    roughnessMap: loadDetail(
      '/textures/green/roughness.jpg',
      4,
      4
    ),
  },

  green: {
    map: greenColor,
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
