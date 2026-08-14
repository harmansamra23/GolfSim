import type { GolfHole } from '../courses/courseTypes'
import { Bunkers } from './Bunkers'
import { CourseScenery } from './CourseScenery'
import { Fairway } from './Fairway'
import { Flag } from './Flag'
import { GrassDetail } from './GrassDetail'
import { Green } from './Green'
import { Hazards } from './Hazards'
import { TeeBox } from './TeeBox'
import { Terrain } from './Terrain'
import { Vegetation } from './Vegetation'

export function CourseHole({ hole }: { hole: GolfHole }) {
  return (
    <>
      <CourseScenery hole={hole} />
      <Terrain hole={hole} />
      <Fairway hole={hole} />
      <TeeBox hole={hole} />
      <Green hole={hole} />
      <Bunkers hole={hole} />
      <Hazards hole={hole} />
      <Flag hole={hole} />
      <Vegetation hole={hole} />
      <GrassDetail hole={hole} />
    </>
  )
}
