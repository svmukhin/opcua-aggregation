const util = require("util");
const axios = require("axios");

module.exports = async function (plugin) {
  let toSend = [];
  let groupChannels;

  sendNext();
  main(plugin.channels.data);

  function main(channels) {
    groupChannels = groupByUniq(channels, "sessionname");
    monitor();
  }

  function sendNext() {
    if (toSend.length > 0) {
      plugin.sendData(toSend);
      toSend = [];
    }
    setTimeout(sendNext, 2500);
  }

  function monitor() {
    Object.keys(groupChannels).forEach(async (key) => {
      let itemsToFetch = {};
      groupChannels[key].ref.forEach((channel) => {
        let channelkey = channel.sessionname + "." + channel.nodeid;
        itemsToFetch[channelkey] = channel;
      });

      const res = await axios.get(
        "http://localhost:5000/api/aggregation/tags",
        {
          params: { tagids: Object.keys(itemsToFetch) },
          paramsSerializer: { indexes: null },
        }
      );

      res.data.data.forEach((tag) => {
        let item = itemsToFetch[tag.tagid];
        let ts = new Date(tag.timestamp).getTime();
        toSend.push({
          id: item.id,
          value: tag.value,
          chstatus: tag.statusCode,
          ts: ts,
        });
      });
    });

    setTimeout(() => {
      monitor();
    }, 5000);
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
};
