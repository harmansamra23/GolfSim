import type { RealCourseMetadata } from './realCourseTypes'

const pars = [4, 4, 3, 4, 5, 4, 3, 4, 4, 5, 4, 4, 3, 4, 5, 3, 4, 4]
const handicaps = [3, 5, 15, 13, 9, 7, 17, 1, 11, 8, 6, 2, 12, 4, 10, 18, 16, 14]

const black = [423, 406, 189, 347, 521, 344, 164, 410, 344, 485, 373, 432, 219, 422, 504, 162, 346, 331]
const blue = [409, 384, 159, 340, 510, 330, 159, 400, 331, 471, 360, 423, 208, 411, 493, 142, 321, 308]
const white = [394, 376, 146, 331, 415, 309, 153, 339, 320, 456, 349, 413, 195, 348, 482, 128, 307, 299]
const gold = [344, 293, 127, 289, 383, 285, 137, 318, 298, 406, 308, 363, 162, 318, 426, 112, 271, 266]

export const plumasLakeMetadata: RealCourseMetadata = {
  id: 'plumas-lake-golf-club',
  name: 'Plumas Lake Golf Club',
  location: '1551 Country Club Rd, Olivehurst, CA 95961',
  center: {
    latitude: 39.03408,
    longitude: -121.56308,
    elevationMeters: 17,
  },
  geometryStatus: 'SCORECARD_ONLY',
  scorecard: {
    par: 71,
    tees: [
      { id: 'black', name: 'Black', totalYards: 6422, rating: 71.9, slope: 125 },
      { id: 'blue', name: 'Blue', totalYards: 6159, rating: 70.9, slope: 123 },
      { id: 'white', name: 'White', totalYards: 5760, rating: 68.9, slope: 120 },
      { id: 'gold', name: 'Gold', totalYards: 5106, rating: 66.0, slope: 115 },
    ],
    holes: pars.map((par, index) => ({
      hole: index + 1,
      par,
      handicap: handicaps[index],
      yardages: {
        black: black[index],
        blue: blue[index],
        white: white[index],
        gold: gold[index],
      },
    })),
  },
  notes: [
    'Scorecard values are based on the currently cross-checked public scorecard reference used for Phase 15.',
    'The course center is approximate and is only an origin for future GPS projection.',
    'No tee, green, bunker, water, fairway, or elevation geometry is treated as surveyed yet.',
  ],
}
