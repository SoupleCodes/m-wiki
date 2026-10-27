import { Hono } from 'hono'

import { getLoggedIn } from '../cookie.js'
import { httpFetch } from '../functions/[[index]].js'
import { getCookie } from 'hono/cookie'


const article = new Hono()

article
    .post('/', async(c) => {
        const body = await c.req.formData()
        const [ title, content, category ] = [
            body.get('title'),
            body.get('content'),
            body.get('category') || 'Uncategorized'
        ]

        const user = getLoggedIn(c)
        const token = getCookie(c, user)


        // Get server response
        const api_res = await httpFetch('/article', 'POST', 
            {
                title,
                content,
                category
            }
        , 'json', token)
        if (api_res.status !== 201) {
            c.header('Content-Type', 'text/html; charset=utf-8')
            return c.text(api_res?.message || 'Server error', 404)
        }


        return c.text(api_res.article_id, 200)
    })


export default article