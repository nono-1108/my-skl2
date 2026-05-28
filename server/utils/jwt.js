const crypto = require('crypto');

const base64url = (input) => {
    let buf;
    if (typeof input === 'string') {
        buf = Buffer.from(input, 'utf8');
    } else {
        buf = Buffer.from(input);
    }
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const sign = (payload, secret) => {
    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadStr = base64url(JSON.stringify(payload));
    const signature = crypto.createHmac('sha256', secret)
        .update(`${header}.${payloadStr}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${header}.${payloadStr}.${signature}`;
};

const verify = (token, secret) => {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const signature = crypto.createHmac('sha256', secret)
        .update(`${parts[0]}.${parts[1]}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    if (signature !== parts[2]) throw new Error('Invalid signature');
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
};

module.exports = { sign, verify };
