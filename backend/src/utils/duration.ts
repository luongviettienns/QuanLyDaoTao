export function parseDurationToMs(duration: string) {
  const match = duration.trim().match(/^(\d+)([smhd])$/i)

  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`)
  }

  const value = Number(match[1])
  const unit = match[2].toLowerCase()

  const unitToMs = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  } as const

  return value * unitToMs[unit as keyof typeof unitToMs]
}

export function parseAccessExpiresInSeconds(duration: string) {
  return Math.floor(parseDurationToMs(duration) / 1000)
}
