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

  texture.repeat.set(
    repeatX,
    repeatY
  )

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
  const canvas =
    document.createElement('canvas')

  canvas.width = 512
  canvas.height = 512

  const context =
    canvas.getContext('2d')

  if (!context) {
    throw new Error(
      'Could not create course texture'
    )
  }

  draw(
    context,
    canvas.width,
    canvas.height
  )

  const texture =
    new CanvasTexture(canvas)

  texture.colorSpace =
    SRGBColorSpace

  return configureTexture(
    texture,
    repeatX,
    repeatY
  )
}

function addGrassNoise(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  for (
    let i = 0;
    i < amount;
    i++
  ) {
    const x =
      Math.random() * width

    const y =
      Math.random() * height

    const alpha =
      Math.random() * 0.07 +
      0.015

    context.fillStyle =
      Math.random() > 0.5
        ? `rgba(255,255,255,${alpha})`
        : `rgba(0,0,0,${alpha})`

    context.fillRect(
      x,
      y,
      2,
      2
    )
  }
}

const fairwayColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      const stripes = 8

      const stripeHeight =
        height / stripes

      for (
        let i = 0;
        i < stripes;
        i++
      ) {
        context.fillStyle =
          i % 2 === 0
            ? '#4d8f43'
            : '#5b9c4b'

        context.fillRect(
          0,
          i * stripeHeight,
          width,
          stripeHeight
        )
      }

      addGrassNoise(
        context,
        width,
        height,
        1800
      )
    },
    1,
    9
  )

const firstCutColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      context.fillStyle =
        '#3f763f'

      context.fillRect(
        0,
        0,
        width,
        height
      )

      addGrassNoise(
        context,
        width,
        height,
        2400
      )
    },
    5,
    24
  )

const roughColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      context.fillStyle =
        '#2d5934'

      context.fillRect(
        0,
        0,
        width,
        height
      )

      addGrassNoise(
        context,
        width,
        height,
        5000
      )
    },
    18,
    48
  )

const greenColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      context.fillStyle =
        '#6da957'

      context.fillRect(
        0,
        0,
        width,
        height
      )

      addGrassNoise(
        context,
        width,
        height,
        800
      )
    },
    4,
    4
  )

const sandColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      context.fillStyle =
        '#d5c18b'

      context.fillRect(
        0,
        0,
        width,
        height
      )

      addGrassNoise(
        context,
        width,
        height,
        3500
      )
    },
    3,
    3
  )

const pathColor =
  createCanvasTexture(
    (
      context,
      width,
      height
    ) => {
      context.fillStyle =
        '#a6a08e'

      context.fillRect(
        0,
        0,
        width,
        height
      )

      addGrassNoise(
        context,
        width,
        height,
        2600
      )
    },
    2,
    32
  )

export const courseMaterials = {
  rough: {
    map: roughColor,

    normalMap:
      loadDetail(
        '/textures/rough/normal.jpg',
        18,
        48
      ),

    roughnessMap:
      loadDetail(
        '/textures/rough/roughness.jpg',
        18,
        48
      ),
  },

  firstCut: {
    map: firstCutColor,

    normalMap:
      loadDetail(
        '/textures/fairway/normal.jpg',
        7,
        28
      ),

    roughnessMap:
      loadDetail(
        '/textures/fairway/roughness.jpg',
        7,
        28
      ),
  },

  fairway: {
    map: fairwayColor,

    normalMap:
      loadDetail(
        '/textures/fairway/normal.jpg',
        5,
        34
      ),

    roughnessMap:
      loadDetail(
        '/textures/fairway/roughness.jpg',
        5,
        34
      ),
  },

  tee: {
    map: greenColor,

    normalMap:
      loadDetail(
        '/textures/green/normal.jpg',
        4,
        4
      ),

    roughnessMap:
      loadDetail(
        '/textures/green/roughness.jpg',
        4,
        4
      ),
  },

  green: {
    map: greenColor,

    normalMap:
      loadDetail(
        '/textures/green/normal.jpg',
        5,
        5
      ),

    roughnessMap:
      loadDetail(
        '/textures/green/roughness.jpg',
        5,
        5
      ),
  },

  sand: {
    map: sandColor,

    normalMap:
      loadDetail(
        '/textures/sand/normal.png',
        3,
        3
      ),

    roughnessMap:
      loadDetail(
        '/textures/sand/roughness.jpg',
        3,
        3
      ),
  },

  path: {
    map: pathColor,

    normalMap:
      loadDetail(
        '/textures/path/normal.png',
        2,
        32
      ),

    roughnessMap:
      loadDetail(
        '/textures/path/roughness.jpg',
        2,
        32
      ),
  },
}