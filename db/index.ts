import { Hono } from 'hono'
import { cors } from 'hono/cors'
import root from './routes/root'
import auth from './routes/auth';
import all from './routes/all'
import article from './routes/article';
import { Bindings } from 'hono/types';

const app = new Hono<{ Bindings: Bindings }>();
app.use('/*', cors());
app.route('/', root)
app.route('/all', all)
app.route('/auth', auth)
app.route('/article', article)

export default app;