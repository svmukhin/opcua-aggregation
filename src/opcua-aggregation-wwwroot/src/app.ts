import m from "mithril";
import clientsStatusList from "./components/clients-status";

const root = document.body;

m.route(root, "/status", {
  "/status": clientsStatusList,
});
