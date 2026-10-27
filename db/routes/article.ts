import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { verifyToken } from '../util/auth';
import active from '../util/activity';


const article = new Hono<{ Bindings: Bindings }>();

article
  .use(trimTrailingSlash())
  
  .post('/', async (c) => {
    try {
      // Auth
      const decoded = await verifyToken(c)
      if (!decoded) {
          return c.json({ message: 'Unauthorized' }, 401)
      }


      // Validate
      const user_id = decoded.user_id
      const data = await c.req.json();
      const iso_string = new Date().toISOString()
      const { title, content, category } = data
      if (!title || !content) {
        throw new Error('Title or content is missing...');
      }


      // Create le article
      const { success } = await c.env.DB.prepare(`
            INSERT INTO articles
              (title, user_id, content, created_at, last_modified)
            VALUES
              (?, ?, ?, ?, ?)
      `).bind(
          title,
          user_id,
          content,
          iso_string,
          iso_string
      ).run()
      if(!success) {
        throw new Error('Something went wrong with creating your article')
      }


      // Get the article's new id
      const { results } = await c.env.DB.prepare("SELECT last_insert_rowid() AS id").all();
      const article_id = results[0].id;


      // Add the first ver. to the article history
      const history_success = await c.env.DB.prepare(`
          INSERT INTO edit_history
            (article_id, editor_user_id, edit_date, new_content, old_content)
          VALUES
            (?, ?, ?, ?, ?)
        `).bind(
          article_id,
          decoded.user_id,
          new Date().toISOString(),
          content,
          ''
        ).run()
      if(!history_success) {
        throw new Error('Something went wrong with appending your article history')
      }


      // Show that the user was active
      await active(c, decoded.user_id)


      // Give a response
      return c.json({ 
        message: 'Article created successfully', 
        article_id,
        status: 201
      }, 201)
    } catch (err) {
      console.error(err)

      return c.json({ 
          error: true, 
          message: err || 'Server error',
          status: 404
      }, 404)
    }

  })

  .get('/featured', async (c) => {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.id,
        u.username AS author,
        a.title, 
        a.content, 
        a.created_at, 
        a.last_modified, 
        a.view_count, 
        a.featured, 
        a.prev_img, 
        a.prev_img_caption 
      FROM articles AS a
        LEFT JOIN users AS u
        ON a.user_id = u.id

      WHERE featured = 1
      GROUP BY u.id;
    `).all()

    return c.json(results[0], 200)
  })

  .get('/:id', async (c) => {
    const id  = c.req.param('id')

    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.id,
        u.username AS author,
        a.title, 
        a.content, 
        a.created_at, 
        a.last_modified, 
        a.view_count, 
        a.featured, 
        a.prev_img, 
        a.prev_img_caption 
      FROM articles AS a
        LEFT JOIN users AS u
        ON a.user_id = u.id

      WHERE a.id = ?
      GROUP BY u.id;
    `).bind(id).all()

    return c.json(results[0], 200)
  })

export default article