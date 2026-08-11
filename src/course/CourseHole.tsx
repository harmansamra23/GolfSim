import { Bunkers } from './Bunkers'
import { Fairway } from './Fairway'
import { Flag } from './Flag'
import { GrassDetail } from './GrassDetail'
import { Green } from './Green'
import { TeeBox } from './TeeBox'
import { Terrain } from './Terrain'
import { Vegetation } from './Vegetation'

export function CourseHole() {
  return (
    <>
      <Terrain />
      <Fairway />
      <TeeBox />
      <Green />
      <Bunkers />
      <Flag />
      <Vegetation />
      <GrassDetail />
    </>
  )
}
