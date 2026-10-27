import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'

import { decode, sign, verify } from 'hono/jwt'
import bcrypt = require("bcryptjs")
import { verifyToken } from '../util/auth';


const auth = new Hono<{ Bindings: Bindings }>();

auth
  .use(trimTrailingSlash())
  
  .post('/register', async (c) => { 
    const { username, password, retype } = await c.req.json()
    const pattern = /^[a-zA-Z0-9_]+$/;


    // Validate username and password
    if (!username || !password) {
      return c.json({ message: 'Username or password is missing', status: 400 }, 400)
    }
    if (username.length < 3) {
      return c.json({ message: 'Username is too short', status: 400 }, 400)
    }
    if (password !== retype) {
      return c.json({ message: 'Password does not match with retyped', status: 400 }, 400)
    }
    if (!pattern.test(username)) {
      return c.json({ message: 'Username contains invalid characters. Only letters, numbers, and underscores are allowed.', status: 400 }, 400)
    }


    // See if username is taken
    const lower_name = username.toLowerCase()
    const { results: exists } = await c.env.DB.prepare(`
        SELECT * FROM users WHERE lowercase_username = ?
    `).bind(lower_name).all()
    if (exists.length > 0) {
        return c.json({ message: 'Username already exists.', status: 400 }, 400)
    }
    console.log('Username ' + username + ' is available')


    // Hash password
    const salt = await bcrypt.genSalt(10)
    const pswd_hash = await bcrypt.hash(password, salt)


    // Create user
    const now = new Date().toISOString()
    const { success } = await c.env.DB.prepare(`
        INSERT INTO users (username, lowercase_username, display_name, password_hash, password_changed_at, created_at, last_activity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(username, lower_name, username, pswd_hash, now, now, now).run()
    if(!success) {
        return c.json({ message: 'Failed to create user', status: 400 }, 400)
    }

    return c.json({ message: 'Sucessfully registered user', status: 201 }, 201)
  })

  .post('/login', async (c) => {
    const { username, password } = await c.req.json()

    try {
      // Validate user and pswd
      if (!username || !password) {
        return c.json({ 
          error: true, 
          message: 'Username or password is missing',
          status: 400
        }, 400)
      }


      // Check if user exists
      const lower_name = username.toLowerCase()
      const exists = await c.env.DB.prepare(`
          SELECT password_hash, id FROM users WHERE lowercase_username = ?
      `).bind(lower_name).first()
      if(!exists) {
          return c.json({ 
            error: true, 
            message: 'User not found',
            status: 404
          }, 404)
      }


      // Check if correct password
      const passwordMatch = await bcrypt.compare(password, exists.password_hash as string)
      if(!passwordMatch) {
          return c.json({ 
            error: true, 
            message: 'Incorrect password',
            status: 401
          }, 401)
      }


      // Time to create token!
      const now = new Date().toISOString()
      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
      const payload = {
          user: lower_name,
          user_id: exists.id,
          exp: exp
      }
      const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

      
      // Update last login
      await c.env.DB.prepare(`
          UPDATE users SET 
                        last_login = ?,
                        last_activity = ?,
                        token_revoked_at = NULL
          WHERE lowercase_username = ?
      `).bind(now, now, lower_name).run()


      // Gather user info
      const user_data = await c.env.DB.prepare(`
          SELECT
              id,
              username,
              lowercase_username,
              created_at,
              last_activity,
              last_login,
              description,
              display_name,
              pfp_url,
              pinned_article_id
          FROM users WHERE lowercase_username = ?
      `).bind(lower_name).first()


      // Return response with token and user data
      return c.json({
        message: 'Successfully logged in',
        token,
        user: {
          ...user_data,  
        },
        status: 200
      }, 200)

    } catch (error) {
      console.error(error)

      return c.json({ 
          error: true, 
          message: error || 'Server error',
          status: 404
      }, 404)
    }

  })

  .patch('/logout', async (c) => {
    const decoded = await verifyToken(c)
    if (!decoded) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    try {
      await c.env.DB.prepare(`
          UPDATE users SET 
                        token_revoked_at = ?
          WHERE id = ?
      `)
      .bind(Math.floor(Date.now() / 1000) + 60 * 60 * 24, decoded.user_id)
      .run()

      return c.json({
        message: 'Successfully logged out',
        status: 200
      }, 200)
    } catch (err) {
      return c.json({ 
        message: 'Oops. Looks like we have trouble logging out your account' ,
        status: 404
      }, 404)
    }

  })

  .get('/expired', async (c) => {
    var s = (await verifyToken(c))
    console.log(s)
    return c.json(s, 200)
  })

export default auth