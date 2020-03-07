const { TextAnalyticsClient, TextAnalyticsApiKeyCredential } = require("@azure/ai-text-analytics");
const Utils = require("../index");

// Define connection string and related Service Bus entity names here


module.exports = function (RED) {
    function AZDetectLang(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.debug("Loaded the language detect node");
        const endpoint = RED.nodes.getNode(config.connection).endpoint;
        const key = RED.nodes.getNode(config.connection).key;
        const utils = new Utils();

        const textAnalyticsClient = new TextAnalyticsClient(endpoint, new TextAnalyticsApiKeyCredential(key));

        async function detectLanguage(client, items, node, msg, done) {
            try {
                const languageResult = await client.detectLanguage(items);
                // node.log(JSON.stringify(languageResult,0,4));
                for (var i=0;i<items.length;i++) {
                    languageResult[i].text = items[i];
                }
                msg.payload = languageResult;                
                node.send(msg);
                if (done) done();
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("error during language detection: " + err);
            }
        }

        node.on('input', (msg, send, done) => {
            try {
                node.debug("Received request to detect language");
                var items = [];
                items = msg.payload;
                detectLanguage(textAnalyticsClient, items, node, msg, done);
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("Error occured" + err);
            }
        });

        node.on('close', () => {

        });
    }
    RED.nodes.registerType("az-detect-lang", AZDetectLang);
}