import { getRequestListener } from '@hono/node-server';
import app from '../server/src/index';

export default getRequestListener(app.fetch);
