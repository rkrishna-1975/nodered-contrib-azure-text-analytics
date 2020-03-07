const { TextAnalyticsClient, TextAnalyticsApiKeyCredential } = require("@azure/ai-text-analytics");
const Utils = require("../index");

// Define connection string and related Service Bus entity names here


module.exports = function (RED) {
    function AZKeyPhrases(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.debug("Loaded the key phrases node");
        const endpoint = RED.nodes.getNode(config.connection).endpoint;
        const key = RED.nodes.getNode(config.connection).key;
        const utils = new Utils();

        const textAnalyticsClient = new TextAnalyticsClient(endpoint, new TextAnalyticsApiKeyCredential(key));

        async function detectKeyPhrases(client, items, node, msg, done) {
            try {
                const keyPhrasesResult = await client.extractKeyPhrases(items);
                for (var i=0;i<items.length;i++) {
                    keyPhrasesResult[i].text = items[i];
                }
                msg.payload = keyPhrasesResult;                
                node.send(msg);
                if (done) done();
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("error during key phrases detection: " + err);
            }
        }

        node.on('input', (msg, send, done) => {
            try {
                node.debug("Received request to detect key phrases");
                var items = [];
                items = msg.payload;
                detectKeyPhrases(textAnalyticsClient, items, node, msg, done);
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("Error occured" + err);
            }
        });

        node.on('close', () => {

        });
    }
    RED.nodes.registerType("az-key-phrases", AZKeyPhrases);
}