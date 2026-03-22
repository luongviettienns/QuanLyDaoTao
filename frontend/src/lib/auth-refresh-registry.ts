type RefreshFn = () => Promise<string | null>

let refreshFn: RefreshFn | null = null

/** Called from AuthProvider on mount; clears on unmount. */
export function registerAuthRefresh(fn: RefreshFn) {
  refreshFn = fn
  return () => {
    refreshFn = null
  }
}

export async function runAuthRefresh(): Promise<string | null> {
  if (!refreshFn) {
    return null
  }

  return refreshFn()
}
