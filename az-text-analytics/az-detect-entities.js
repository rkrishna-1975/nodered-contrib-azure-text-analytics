const { TextAnalyticsClient, TextAnalyticsApiKeyCredential } = require("@azure/ai-text-analytics");
const Utils = require("../index");

// Define connection string and related Service Bus entity names here


module.exports = function (RED) {
    function AZDetectEntities(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.debug("Loaded the language detect node");
        const endpoint = RED.nodes.getNode(config.connection).endpoint;
        const key = RED.nodes.getNode(config.connection).key;
        const utils = new Utils();

        const textAnalyticsClient = new TextAnalyticsClient(endpoint, new TextAnalyticsApiKeyCredential(key));

        async function detectEntity(client, items, node, msg, done) {
            try {
                const entityResult = await client.recognizeEntities(items);
                for (var i=0;i<items.length;i++) {
                    entityResult[i].text = items[i];
                }
                msg.payload = entityResult;                
                node.send(msg);
                if (done) done();
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("error during entity detection: " + err);
            }
        }

        node.on('input', (msg, send, done) => {
            try {
                node.debug("Received request to detect entities");
                var items = [];
                items = msg.payload;
                detectEntity(textAnalyticsClient, items, node, msg, done);
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("Error occured" + err);
            }
        });

        node.on('close', () => {

        });
    }
    RED.nodes.registerType("az-detect-entities", AZDetectEntities);
}