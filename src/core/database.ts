import GUN from 'gun'
import 'gun/lib/then'

export const db = GUN(['https://heig-extension.herokuapp.com/gun']);

export const user = {}
