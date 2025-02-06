const util = require("util");
const axios = require("axios");
const GroupedData = require("./lib/grouped-data");

module.exports = async function (plugin) {
  let toSend = [];
  const groupedChannels = new GroupedData("sessionname");

  sendNext();
  main();

  plugin.onChange("channels", async (data) => {
    const channels = await plugin.channels.get();
    let changedChannels = groupByUniq(data, "op");
    Object.keys(changedChannels).forEach((key) => {
      switch (key) {
        case "add":
        case "update":
          changedChannels[key].ref.forEach((channel) => {
            let index = channels.findIndex((ch) => ch._id === channel._id);
            if (index !== -1) {
              groupedChannels.addOrUpdate(channel);
            }
          });
          break;
        case "delete":
          changedChannels[key].ref.forEach((channel) => {
            groupedChannels.delete(channel._id);
          });
          break;
        default:
          plugin.log("Unknown operation: " + key);
      }
    });
  });

  async function main() {
    let channels = await plugin.channels.get();

    channels.forEach((channel) => {
      groupedChannels.addOrUpdate(channel);
    });

    monitor();
  }

  function sendNext() {
    if (toSend.length > 0) {
      plugin.sendData(toSend);
      toSend = [];
    }
    setTimeout(sendNext, 2500);
  }

  async function monitor() {
    await Promise.all(
      (
        await groupedChannels.getCategories()
      ).map(async (category) => {
        let itemsToFetch = {};
        const channels = await groupedChannels.getByCategory(category);
        channels.forEach((channel) => {
          let channelkey = channel.sessionname + "." + channel.nodeid;
          itemsToFetch[channelkey] = channel;
        });

        try {
          const res = await axios.get(
            "http://localhost:5000/api/aggregation/tags",
            {
              params: {
                sessionName: category,
                tagids: Object.keys(itemsToFetch),
              },
              paramsSerializer: { indexes: null },
            }
          );

          res.data.data.forEach((tag) => {
            let item = itemsToFetch[tag.tagid];
            let ts = new Date(tag.timestamp).getTime();
            if (tag.statusCode === 0) {
              toSend.push({
                id: item.id,
                value: tag.value,
                chstatus: tag.statusCode,
                ts: ts,
              });
            } else {
              toSend.push({
                id: item.id,
                chstatus: tag.statusCode,
                ts: ts,
              });
            }
          });
        } catch (error) {
          plugin.log(
            "Can't fetch data from server. Error: " + util.inspect(error.cause)
          );
        }
      })
    );

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
      if (uniq[obj.chanId] == undefined) {
        uniq[obj.chanId] = obj;
        acc[key].ref.push(obj);
      }

      return acc;
    }, {});
  }
};
