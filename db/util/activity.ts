import { Context } from "hono";

export default async function active(c: Context, user_id: number) {
    await c.env.DB.prepare(`
        UPDATE users
        SET last_activity = ?
        WHERE id = ?
    `).bind(new Date().toISOString(), user_id).run()
}