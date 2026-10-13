// Test-only outbound guard. Inherited by the local runner and its Next child.
// Does not change Windows network adapters or the owner's browser settings.
const dns = require('node:dns');
const net = require('node:net');
const local = host => !host || ['localhost','127.0.0.1','::1'].includes(host);
const reject = host => {throw Error(`OFFLINE VERIFICATION: outbound connection blocked: ${host}`);};
const lookup = dns.lookup;
dns.lookup = function(host,...args) {if(!local(host))reject(host);return lookup.call(this,host,...args);};
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function(...args) {
  const options=Array.isArray(args[0])?args[0][0]:args[0];
  if(options && typeof options==='object' && !options.path && !local(options.host))reject(options.host);
  if(typeof args[1]==='string' && typeof args[0]==='number' && !local(args[1]))reject(args[1]);
  return connect.apply(this,args);
};
const originalFetch=globalThis.fetch;
globalThis.fetch = function(input,...args) {
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  if(['http:','https:'].includes(url.protocol)&&!local(url.hostname))reject(url.hostname);
  return originalFetch.call(this,input,...args);
};
