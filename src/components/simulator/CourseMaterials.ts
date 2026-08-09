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

function addRoughBlotches(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const radius = 8 + Math.random() * 28

    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)

    context.fillStyle =
      Math.random() > 0.5
        ? 'rgba(0,0,0,0.055)'
        : 'rgba(255,255,255,0.035)'

    context.fill()
  }
}

const fairwayColor = createCanvasTexture(
  (context, width, height) => {
    const stripeCount = 8
    const stripeHeight = height / stripeCount

    for (let i = 0; i < stripeCount; i++) {
      context.fillStyle =
        i % 2 === 0
          ? '#4e9b46'
          : '#60ac50'

      context.fillRect(
        0,
        i * stripeHeight,
        width,
        stripeHeight
      )

      context.fillStyle = 'rgba(255,255,255,0.035)'
      context.fillRect(
        0,
        i * stripeHeight,
        width,
        2
      )
    }

    addFineNoise(
      context,
      width,
      height,
      1600,
      0.035
    )
  },
  1,
  10
)

const firstCutColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#39743b'
    context.fillRect(0, 0, width, height)

    addRoughBlotches(
      context,
      width,
      height,
      55
    )

    addFineNoise(
      context,
      width,
      height,
      2600,
      0.05
    )
  },
  7,
  30
)

const roughColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#214f2d'
    context.fillRect(0, 0, width, height)

    addRoughBlotches(
      context,
      width,
      height,
      120
    )

    addFineNoise(
      context,
      width,
      height,
      6200,
      0.075
    )
  },
  18,
  52
)

const teeColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#65ad54'
    context.fillRect(0, 0, width, height)

    addFineNoise(
      context,
      width,
      height,
      900,
      0.025
    )
  },
  4,
  4
)

const greenColor = createCanvasTexture(
  (context, width, height) => {
    context.fillStyle = '#78bb5d'
    context.fillRect(0, 0, width, height)

    for (let y = 0; y < height; y += 28) {
      context.fillStyle =
        y % 56 === 0
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(0,0,0,0.018)'

      context.fillRect(0, y, width, 28)
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
      18,
      52
    ),
    roughnessMap: loadDetail(
      '/textures/rough/roughness.jpg',
      18,
      52
    ),
  },

  firstCut: {
    map: firstCutColor,
    normalMap: loadDetail(
      '/textures/fairway/normal.jpg',
      8,
      30
    ),
    roughnessMap: loadDetail(
      '/textures/fairway/roughness.jpg',
      8,
      30
    ),
  },

  fairway: {
    map: fairwayColor,
    normalMap: loadDetail(
      '/textures/fairway/normal.jpg',
      5,
      36
    ),
    roughnessMap: loadDetail(
      '/textures/fairway/roughness.jpg',
      5,
      36
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