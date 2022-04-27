import GUN from 'gun'
import 'gun/lib/then'

const db = GUN(['https://gun.stmx.ch/gun']);
export default db;
