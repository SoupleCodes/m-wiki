import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { verifyToken } from '../util/auth';
import active from '../util/activity';


const all = new Hono<{ Bindings: Bindings }>();

all
  .use(trimTrailingSlash())
  
  .get('/articles', async (c) => {

  })

export default all