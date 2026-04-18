import app from './app';
import { createServer } from 'http';
import { config } from './config/env'
import { initalizeWebsocket } from './websocket/gateway';

const server = createServer(app);
initalizeWebsocket(server);

const PORT = config.server.port

server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
})
