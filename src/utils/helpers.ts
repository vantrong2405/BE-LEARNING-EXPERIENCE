import { v4 as uuidv4 } from 'uuid'

export function generateUsername(name: string): string {
  const uuid = uuidv4().split('-')[0]
  const cleanName = name.toLowerCase().replace(/\s+/g, '')
  return `${cleanName}_${uuid}`
}
