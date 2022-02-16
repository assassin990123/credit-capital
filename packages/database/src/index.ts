import { bootstrap } from './lib/bootstrap';
import { startServer } from './lib/server';

startServer(async () => {
  bootstrap();
});
