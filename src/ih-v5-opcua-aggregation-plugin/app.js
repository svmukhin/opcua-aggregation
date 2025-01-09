/**
 * app.js
 *
 */

const util = require("util");

module.exports = async function (plugin) {
    let toSend = [];
    let curChannels = [];

    sendNext();

    function sendNext() {
        if (toSend.length > 0) {
            plugin.sendData(toSend);
            toSend = [];
        }
        setTimeout(sendNext, 2500);
    }

    function monitor(channels) {
        const groupChannels = groupByUniq(channels, 'parentnodefolder');
        curChannels = groupBy(channels, 'chan');

        Object.keys(groupChannels).forEach((key) => {
            const itemsToFetch = [];
            groupChannels[key].ref.forEach((channel) => {
                itemsToFetch.push({ tagid: sessionname + '.' + channel.chan });
            });
        });

        while (itemsToFetch.length > 0) {
            let chunk = itemsToMonitor.splice(0, parameters.maxVariablesPerSub);
            // Todo: Fetch data from OPC UA aggregation client
        }

        setTimeout(() => {
            monitor(channels);
        }, 5000);
    }

    function groupBy(objectArray, property) {
        return objectArray.reduce((acc, obj) => {
            let key = obj[property];
            if (!acc[key]) {
            acc[key] = {};
            acc[key].ref = [];
            }
            acc[key].ref.push(obj);
            return acc;
        }, {});
    }

    function groupByUniq(objectArray, property) {
        const uniq = {};
        return objectArray.reduce((acc, obj) => {
            let key = obj[property];
            if (!acc[key]) {
            acc[key] = {};
            acc[key].ref = [];
            }
            if (uniq[obj.chan] == undefined) {
            uniq[obj.chan] = obj;
            acc[key].ref.push(obj);
            }

            return acc;
        }, {});
    }

    async function main(params) {
        plugin.sendLog('Plugin opcua aggregation has started.');
    }

    main(plugin.params.data);
}