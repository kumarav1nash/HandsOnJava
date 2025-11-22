import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Courses from './learn/Courses.jsx'
import { useI18n } from '../i18n/useI18n.js'

export default function Learn() {
  return <Courses />
}