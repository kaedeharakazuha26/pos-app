import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite } from '@capacitor-community/sqlite'
import { readPersistedState, STORAGE_KEY } from '../data'
import type { AppData } from '../types'

const DB_NAME = 'joycepos-db'
const STATE_KEY = 'joycepos-state-v1'

const isSQLiteReady = () => {
  const platform = Capacitor.getPlatform()
  const isNativePlatform = platform === 'android' || platform === 'ios'

  return (
    isNativePlatform &&
    typeof CapacitorSQLite !== 'undefined' &&
    typeof (CapacitorSQLite as { createConnection?: unknown }).createConnection === 'function'
  )
}

async function ensureDatabase(): Promise<boolean> {
  if (!isSQLiteReady()) {
    return false
  }

  try {
    await CapacitorSQLite.createConnection({
      database: DB_NAME,
      readonly: false,
    })
    await CapacitorSQLite.open({
      database: DB_NAME,
      readonly: false,
    })
    await CapacitorSQLite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS app_state (
          id TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `,
      transaction: true,
    })
    return true
  } catch (error) {
    console.warn('SQLite unavailable; using local fallback storage.', error)
    return false
  }
}

export async function loadAppDataFromStorage(): Promise<AppData> {
  const fallback = readPersistedState()

  try {
    const ready = await ensureDatabase()
    if (!ready) {
      return fallback
    }

    const result = await CapacitorSQLite.query({
      database: DB_NAME,
      statement: 'SELECT payload FROM app_state WHERE id = ?',
      values: [STATE_KEY],
    })

    const payload = result.values?.[0]?.payload as string | undefined
    if (!payload) {
      return fallback
    }

    const parsed = JSON.parse(payload) as AppData
    if (parsed && parsed.users) {
      return parsed
    }
  } catch (error) {
    console.warn('SQLite load failed, falling back to local storage.', error)
  }

  return fallback
}

export async function saveAppDataToStorage(data: AppData): Promise<void> {
  const payload = JSON.stringify(data)

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, payload)
  }

  try {
    const ready = await ensureDatabase()
    if (!ready) {
      return
    }

    await CapacitorSQLite.run({
      database: DB_NAME,
      statement: `
        INSERT INTO app_state (id, payload, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
      `,
      values: [STATE_KEY, payload, new Date().toISOString()],
      transaction: true,
    })
  } catch (error) {
    console.warn('SQLite save failed; kept local fallback state.', error)
  }
}
