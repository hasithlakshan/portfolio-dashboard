import 'dotenv/config';
import app from './app';
import { env } from './config/env';

const port = parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port} [${env.NODE_ENV}]`);
});
