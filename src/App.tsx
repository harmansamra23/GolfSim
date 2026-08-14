import { useMemo, useState } from 'react'

import './App.css'

import type { BallPhase } from './ball/BallState'
import type { CameraPreference } from './camera/CameraManager'
import GolfScene from './components/simulator/GolfScene'
import { loadCourse } from './course/CourseLoader'
import type {
  GolfHole,
  SurfaceType,
} from './courses/courseTypes'
import { drivingRangeHole } from './courses/drivingRange'
import { aimDirectionDegrees }