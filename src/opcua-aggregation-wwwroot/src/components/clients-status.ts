import m from "mithril";
import { clientsStatus } from "../models/uaclient-model";

export default {
  oninit: clientsStatus.loadList,
  view: function () {
    return m(
      "div",
      { class: "" },
      m("table", { class: "table table-sm table-striped table-hover" }, [
        m("thead", [
          m("tr", [
            m("th", "Name"),
            m("th", "Server Uri"),
            m("th", "Connect Error"),
            m("th", "Monitored Items"),
          ]),
        ]),
        m(
          "tbody",
          clientsStatus.list.map(function (status) {
            return m("tr", [
              m("td", status.sessionName),
              m("td", status.serverUri),
              m("td", status.connectError),
              m(
                "td",
                m(
                  "ol",
                  status.monitoredItems.map(function (item) {
                    return m("li", item);
                  })
                )
              ),
            ]);
          })
        ),
      ])
    );
  },
};
