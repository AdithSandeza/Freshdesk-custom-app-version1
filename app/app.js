$(document).ready( function() {
    app.initialized()
    .then(function(_client) {
        var client = _client;
        var accountDetails = '';
        // var CUSTOM_CCP_URL = "https://freshdeskccp.arta.sandeza.io";
        var CUSTOM_CCP_URL = "https://localhost:8080";
        client.instance.resize({ height: "500px" });

        // client.db.delete("freshdesk-agent-uat");


        var wn = this.window.document.getElementById('ifrm');

        client.instance.receive(
                    function(event)  {
                        var data = event.helper.getData();
                        var messageData = {};
                        let details = {};
                        details.accountDetails = accountDetails;
                        details.requester = data.message.requesterId;

                        client.request.invoke("getContactInfo", details).then(
                            function(data) {
                                let contact = data.message;
                                console.log(contact)
                                if(contact.number != null) {
                                    messageData.action = "makeOutboundCall";
                                    messageData.name = contact.name;
                                    messageData.number = contact.number;
                                    console.log(messageData)
                                    wn.contentWindow.postMessage(messageData, "*");
                                    client.interface.trigger("show", {'id': "softphone"})
                                } else {
                                    client.interface.trigger("showNotify", {
                                        type: "danger",
                                        message: "Can't make outbound call"
                                    })
                                }
                            }, function(){
                                client.interface.trigger("showNotify", {
                                    type: "danger",
                                    message: "Can't make outbound call"
                                })
                            });
                    }
                  );     

            console.log("------------>")
            client.data.get("ticket").then (
                function(data) {
                    console.log("------------>")
                    console.log(data)
                },
                function(error) {
                    console.log(error)
                }
                );

        client.iparams.get().then (
            function(data) {
                accountDetails = data.accountDetails;
                console.log(JSON.stringify(data))
                window.addEventListener('message', messageHandler(client,accountDetails) , false);
                // $("#ifrm").attr("src", CUSTOM_CCP_URL +"?connect_url=https://" + accountDetails.connectInstanceURL + ".awsapps.com/connect/ccp-v2");
                $("#ifrm").attr("src", CUSTOM_CCP_URL +"?connect_url=" + accountDetails.connectInstanceURL + "/ccp-v2#");
                console.log( CUSTOM_CCP_URL +"?connect_url=" + accountDetails.connectInstanceURL + "/ccp-v2#")

           

            }
        );

    });
});
