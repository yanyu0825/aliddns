import { createServer } from 'http';
import { parse as queryParse } from 'querystring';
import { parse } from 'url';
import { DDNS } from './ddns';
import { QueryParam } from './interface/settings';

var server = createServer((req, res) => {
    console.info(req.url);

    new Promise<QueryParam>((resolve, reject) => {
        try {
            var url = parse(req.url || '');
            var params = queryParse(url.query || 's=1');
            if (params && params.apiKey && params.apiSecret && params.domainName && params.type && params.ip) {
                resolve(params as unknown as QueryParam);
            } else {
                reject(new Error('参数有误'));
            }
        } catch (error) {
            reject(error);
        }
    }).then(result => {
        return new DDNS().update(result);
    }).then(result => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    }).catch(err => {
        console.error(err);

        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(false));

    });

}).listen(process.env.PORT || 3000, () => {
    let addr = server.address();
    let bind = addr ? typeof addr === 'string' ? addr : `port:${addr.port}` : "UnKnow";
    console.info(`server start on ${bind}`);
})