import { Hono } from 'hono'
import {
  deleteCookie,
  getCookie,
  getSignedCookie,
  setCookie,
  generateCookie,
} from 'hono/cookie'

import { getLoggedIn, getAccounts, cookieHandler } from '../cookie.js'
import { httpFetch } from '../functions/[[index]].js'


const auth = new Hono()

auth
    .post('/login', async(c) => {
        const body = await c.req.formData()
        const [ username, password ] = [
            body.get('username').toLowerCase(),
            body.get('password')
        ]

        const user = getLoggedIn(c)
        const token = getCookie(c, user)
        const accounts = getAccounts(c)


        // Return an alternate response if server returns error
        const login_response = await httpFetch('/auth/login', 'POST', {
            username, password
        }, 'json')
        if (!login_response || login_response.error) {
            c.header('Content-Type', 'text/html; charset=utf-8')
            return c.text(login_response?.message || 'Server error', 404)
        }



        // Create new response if user successfully logs in
        const expr_date = new Date(new Date().getTime() + 2592000)

        // Set cookie for logged in user
        setCookie(c, username, login_response.token, {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 1000,
            expires: expr_date
        })

        // Set logged in user to user
        setCookie(c, 'logged_in', username, {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 1000,
            expires: expr_date
        })

        // Add logged in user to acc list
        if (accounts.indexOf(username) < 0) {
            accounts.push(username)
        }
        setCookie(c, 'accounts', accounts.join("|"), {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 1000,
            expires: expr_date
        })
        return c.text('Logged in successfully!', 200)
    })
    .post('/register', async (c) => {
        const body = await c.req.formData()
        const [ username, password, retype ] = [
            body.get('username').toLowerCase(),
            body.get('password'),
            body.get('retype')
        ]

        const reg_res = await httpFetch('/auth/register', 'POST', {
            username, password, retype
        }, 'json')
        c.header('Content-Type', 'text/html; charset=utf-8')
        return c.text(
            reg_res?.message || 'Server error', 
            reg_res?.error || 404
        )
    })
    .patch('/logout', async (c) => {
        const user = getLoggedIn(c)
        if (user) {
            const expr_response = await httpFetch('/auth/logout', 'PATCH', null, 'json')
            console.log(expr_response)
            deleteCookie(c, 'logged_in')
        }
    })
    .patch('/switch', async (c) => {
        const user = c.req.query('user')
        if (user) {
            setCookie(c, 'logged_in', user)
            return c.text('Succesfully switched to account', 200)
        }

        return c.text('Could not find logged in account to switch to', 400)
    })
    .get('/expired', async (c) => {
        const user = getLoggedIn(c)
        console.log(user)
        if (user) {
            const expr_response = await httpFetch('/auth/expired', 'GET', null, 'json')
            return c.text(expr_response)
        }
    })


export default auth
/*
const a = await fetch('/auth/expired', {
method: 'GET'})
await a.text()
*/