module.exports = function (RED) {
    function AZTxtAnalyticsConfig(config) {
        RED.nodes.createNode(this, config);
        this.endpoint = config.endpoint;
        this.key = config.key;
    }
    RED.nodes.registerType("az-text-analytics-config", AZTxtAnalyticsConfig);
}
