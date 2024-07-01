let multichain = require("multichain-node")({
    port: 5754,
    host: '172.20.10.11',
    user: "multichainrpc",
    pass: "3EUvSPcMqYJQJePxtBjrBaDsbU86BkoeZz3uFuUvCo6u"
});

module.exports = multichain;