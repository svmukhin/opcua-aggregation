/**
 * app.js
 *
 */

const util = require("util");

module.exports = async function (plugin) {

    async function main(params) {
        plugin.sendLog('Plugin opcua aggregation has started.');
    }

    main(plugin.params.data);
}