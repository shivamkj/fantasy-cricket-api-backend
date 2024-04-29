import { knex } from './utils.js'

export const users = [
  { id: '0731b7b1-f741-4b8a-856e-2723d0c19275', kyc_done: true },
  { id: '18689630-077e-4d46-a4bf-448f6a77b3f5', kyc_done: false },
]

export async function createUsers() {
  await knex('user_data').insert(users)
}
