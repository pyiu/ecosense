
import express from 'express';
import https from 'node:https';
import { generateCert } from './src/cert.js';
import { ECOSENSE_IP } from './src/ecosense.js';
import { CONFIG } from './src/config.js';
import { LOGGER } from './src/logger.js';
import { publish } from './src/mqtt.js';

LOGGER.debug({message: 'Loaded Config', CONFIG});

const app = express();
app.disable('x-powered-by');
app.use(express.json());

const proxyRequest = async (request, response) => {
    LOGGER.debug({
        message: "Proxying Request",
        headers: request.headers,
        method: request.method,
        path: request.originalUrl,
        body: request.body,
        url: request.originalUrl,
        params: request.parms,
    });

    const options = {
        method: request.method,
        servername: 'api.cloud.ecosense.io',
        headers: {
            'Content-Type': 'application/json',
            host: 'api.cloud.ecosense.io',
        }
    };

    const proxied_request = https.request(`https://${await ECOSENSE_IP()}${request.originalUrl}`, options, (proxied_response) => {
        LOGGER.trace({
            message: "Proxying Response",
            statusCode: proxied_response.statusCode,
            headers: proxied_response.headers,
        });
        response.status(proxied_response.statusCode);
        response.set(proxied_response.headers);
    
        proxied_response.on('data', (data) => {
            LOGGER.trace({message: "Proxying Data", data: data.toString('utf8')});
            response.end(data);
        });
    });
    proxied_request.on('error', (error) => {
        LOGGER.error({message: "Proxy Error", error});
    });

    if (request.method === 'PUT' && request.body) {
        LOGGER.trace({message: "Proxying Body", data: JSON.stringify(request.body)});
        await publish(request.body);
        proxied_request.end(JSON.stringify(request.body));
    } else {
        proxied_request.end();
    }
}
app.use('/*', proxyRequest)

const cert = generateCert({altNameIPs: ["127.0.0.1"], altNameURIs: ['api.cloud.ecosense.io'], validityDays: 1000});
const httpsServer = https.createServer({key: cert.privateKey, cert: cert.cert}, app);
httpsServer.listen(443);

LOGGER.info({message: "Server listening on 443"});