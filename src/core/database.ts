import GUN from 'gun'
import 'gun/lib/then'
import { GunHost } from '@/core/env'

const db = GUN(GunHost)
export default db
