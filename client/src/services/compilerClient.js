import axios from 'axios'
import { API_BASE_URL } from '../utils/config'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export async function runJava(code, stdin = '') {
  const { data } = await client.post('/api/java/run', { code, input: stdin })
  return data
}