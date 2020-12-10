import { networkInterfaces } from 'os';

export default function getIP() {
    const nets = networkInterfaces();
    const results: {[key: string]: string[]} = {};

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }

                results[name].push(net.address);
            }
        }
    }

    if (!results.en0) {
        return null;
    }

    return results.en0[0];
}