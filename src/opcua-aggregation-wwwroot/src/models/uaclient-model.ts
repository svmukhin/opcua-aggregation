import m from "mithril";

export interface UaClientstatus {
    id: string;
    serverUri: string;
    sessionName: string;
    connectError: number;
    monitoredItems: string [];
}

export const clientsStatus = {
    list: [],
    loadList: function() {
        return m.request({
            method: "GET",
            url: "http://192.168.122.114:5000/api/aggregation/status",
            withCredentials: true,
        })
        .then(function(result) {
            clientsStatus.list = result as UaClientstatus[];
        });
    }
}