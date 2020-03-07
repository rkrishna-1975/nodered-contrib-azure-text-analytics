const { TextAnalyticsClient, TextAnalyticsApiKeyCredential } = require("@azure/ai-text-analytics");
const Utils = require("../index");

// Define connection string and related Service Bus entity names here


module.exports = function (RED) {
    function AZSentiment(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.debug("Loaded the language detect node");
        const endpoint = RED.nodes.getNode(config.connection).endpoint;
        const key = RED.nodes.getNode(config.connection).key;
        const utils = new Utils();

        const textAnalyticsClient = new TextAnalyticsClient(endpoint, new TextAnalyticsApiKeyCredential(key));

        async function detectSentiment(client, items, node, msg, done) {
            try {
                const sentimentResult = await client.analyzeSentiment(items);
                for (var i=0;i<items.length;i++) {
                    sentimentResult[i].text = items[i];
                    for (var j=0;j<sentimentResult[i].sentences.length;j++){
                        sentimentResult[i].sentences[j].text = sentimentResult[i].text.substring(sentimentResult[i].sentences[j].offset,sentimentResult[i].sentences[j].length);
                    }
                }
                msg.payload = sentimentResult;                
                node.send(msg);
                if (done) done();
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("error during sentiment detection: " + err);
            }
        }

        node.on('input', (msg, send, done) => {
            try {
                node.debug("Received request to detect sentiment");
                var items = [];
                items = msg.payload;
                detectSentiment(textAnalyticsClient, items, node, msg, done);
            } catch (err) {
                msg.error = err;
                node.send(msg);
                if (done) done(err); else node.error("Error occured" + err);
            }
        });

        node.on('close', () => {

        });
    }
    RED.nodes.registerType("az-sentiment", AZSentiment);
}