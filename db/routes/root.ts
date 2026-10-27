import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'

import { decode, sign, verify } from 'hono/jwt'
import bcrypt = require("bcryptjs")


const root = new Hono<{ Bindings: Bindings }>();

root
  .use(trimTrailingSlash())
  
  .get('/allusers', async (c) => {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM users  
    `).all()

    return c.json({ 
      users: results,
      status: 200
    }, 200)
  })

export default root