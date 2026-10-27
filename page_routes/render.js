import { Hono } from 'hono'

import { httpFetch } from '../functions/[[index]].js'
import { getCookie } from 'hono/cookie'
import { getLoggedIn } from '../cookie.js'

import { renderArticlePage } from '../templates/article/.js'

const render = new Hono()

render
    .get('/article/:id', async(c) => {
        const id = c.req.param('id')
        const user = getLoggedIn(c)
        const token = getCookie(c, user)
        const article = await httpFetch('/article/' + id, 'GET')

        c.header('Content-Type', 'text/html; charset=utf-8')
        return c.text(await renderArticlePage(article, token))
    })


export default render