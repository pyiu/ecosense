import axios from 'axios';
import { CONFIG } from './config.js';
import { LOGGER } from './logger.js';

export const ECOSENSE_IP = async () => {
    if (!ECOSENSE_IP_CACHE) {
        ECOSENSE_IP_CACHE = await refreshEcosenseIP();
    }

    return ECOSENSE_IP_CACHE;
}

var ECOSENSE_IP_CACHE;

const refreshEcosenseIP = async () => {
    const result = await axios.get("https://cloudflare-dns.com/dns-query?name=api.cloud.ecosense.io&type=A", {headers: {Accept: "application/dns-json"}});
    LOGGER.debug({message: 'Ecosense IP Updated', ip: result.data.Answer[0].data});
    return result.data.Answer[0].data;
}

// Refresh IP on regular basis
setInterval(async () => {
    ECOSENSE_IP_CACHE = await refreshEcosenseIP();
}, 1000 * 60 * CONFIG().dns_refresh_frequency);
refreshEcosenseIP();