var messageHandler = function(client,accountDetails){
    
    return function(event) {
        event = event.data;

        var messageData = {};
        var wn = this.window.document.getElementById('ifrm');

        if(event.action == "agentConnected") {
            event.accountDetails = accountDetails;
            client.request.invoke("getContactList", event).then(
                function(data) {
                    if(data.status == 200){
                        let contacts = data.message;
                        messageData.action = "calllogs";
                        messageData.contactList = contacts;
                        messageData.callData = null;
                        messageData.language = 'en' ;
                        messageData.countrySelected = '{\"code\":\"1\",\"name\":\"+1 - UnitedStates\",\"flag\":\"flag-icon-us\"}';                               

                        client.db.get(event.agentId).then (
                            function(data) {
                                console.log(data.callHistory)
                                let data2 = data.callHistory;
                                let callData = [...new Set(data2.map((o) => JSON.stringify(o))),].map((string) => JSON.parse(string));
                                messageData.callData = callData;
                                console.log(callData)

                                messageData.language = data.language ? data.language : 'en' ;
                                messageData.countrySelected = data.countrySelected ? data.countrySelected : '{\"code\":\"1\",\"name\":\"+1 - UnitedStates\",\"flag\":\"flag-icon-us\"}';
                                wn.contentWindow.postMessage(messageData, "*");
                            },
                            function(error) {
                                wn.contentWindow.postMessage(messageData, "*");
                                console.log(error)
                        });
                    }
                });

        } else if (event.action == "inboundCall") {
            var callHistory = [];
            var callLog = {}
            callLog.callType = "inbound"
            callLog.contactId = event.contactId;
            callLog.contactName = event.contactName;
            callLog.contactNumber = event.contactNumber;
            callLog.calledTime = event.calledTime;
            callHistory.push(callLog);
            client.db.update( event.agentId, "append", { "callHistory": callHistory })
        } else if (event.action == "missedcall") {
            var callHistory = [];
            var callLog = {}
            callLog.callType = "Missed"
            callLog.contactId = event.contactId;
            callLog.contactName = event.contactName;
            callLog.contactNumber = event.contactNumber;
            callLog.calledTime = event.calledTime;
            callHistory.push(callLog);
            client.db.update( event.agentId, "append", { "callHistory": callHistory })
        } else if (event.action == "outboundCall") {
            var callHistory = [];
            var callLog = {}
            callLog.callType = "outbound"
            callLog.contactId = event.contactId;
            callLog.contactName = event.contactName;
            callLog.contactNumber = event.contactNumber;
            callLog.calledTime = event.calledTime;
            callHistory.push(callLog);
            client.db.update( event.agentId, "append", { "callHistory": callHistory })
        } else if (event.action == "incomingCall") {
            client.interface.trigger("show", {'id': "softphone"})
        } else if (event.action == "openTicket") {

            client.interface.trigger("click", {id: "ticket",value: event.ticketId })
            client.interface.trigger("hide", {id: "softphone"})

        } else if (event.action == "openContact") {

            client.interface.trigger("click", {id: "contact",value: event.contactId })
            client.interface.trigger("hide", {id: "softphone"})

        } else if (event.action == "endcall") {
            event.accountDetails = accountDetails;
            client.request.invoke("addEndCallNote", event).then(
            function() {
                client.interface.trigger("showNotify", {
                    type: "success",
                    message: "Endcall Notes added in ticket #" + event.ticketId
                })
            },
            function() {
                client.interface.trigger("showNotify", {
                    type: "warning",
                    message: "Select any one of the ticket before ending call to add endcall notes"
                })
            });

            client.interface.trigger("hide", {id: "softphone"})

        } else if (event.action == "addNote") {
            event.accountDetails = accountDetails;
            client.request.invoke("addNote", event).then(
            function() {
                client.interface.trigger("showNotify", {
                    type: "success",
                    message: "Call Notes added in ticket #" + event.ticketId
                })
                client.interface.trigger("hide", {id: "softphone"})
                messageData.action = "createNoteSuccess";
                messageData.status = "success";
                wn.contentWindow.postMessage(messageData, "*");
                client.interface.trigger("click", {id: "ticket",value: event.ticketId })
            },function(){
                client.interface.trigger("showNotify", {
                    type: "danger",
                    message: "Adding call notes failed"
                })
                messageData.action = "createNoteFail";
                wn.contentWindow.postMessage(messageData, "*");
            });

        } else if (event.action == "addContact") {
            event.accountDetails = accountDetails;
            client.request.invoke("addContact", event).then(
            function(data) {
                client.interface.trigger("click", {id: "contact",value: data.message.id })
                client.interface.trigger("showNotify", {
                    type: "success",
                    message: "Added to contacts sucessfully"
                })
                client.interface.trigger("hide", {id: "softphone"})
                let callLog = {};
                callLog.contactId = data.message.id;
                callLog.contactName = event.contactName;
                callLog.contactNumber = event.contactNumber;
                
                messageData.action = "createContactSuccess";
                messageData.status = "success";
                wn.contentWindow.postMessage(messageData, "*");
            }, function(){
                client.interface.trigger("showNotify", {
                    type: "danger",
                    message: "Failed to create contact"
                })
                messageData.action = "createContactFail";
                wn.contentWindow.postMessage(messageData, "*");
            });

        } else if (event.action == "createTicket") {
            event.accountDetails = accountDetails;

            if(event.callingName == "Unknown Caller") {
                window.open(accountDetails.freshdeskURL + "/a/tickets/new");
                messageData.action = "createTicketFail";
                wn.contentWindow.postMessage(messageData, "*");
            } else {

                client.request.invoke("createTicket", event).then(
                function(data) {
                    client.interface.trigger("showNotify", {
                        type: "success",
                        message: "New ticket created sucessfully"
                    })
                    messageData.action = "createTicketSuccess";
                    messageData.ticket_id = data.message;
                    wn.contentWindow.postMessage(messageData, "*");
                }, function(){
                    messageData.action = "createTicketFail";
                    wn.contentWindow.postMessage(messageData, "*");
                    client.interface.trigger("showNotify", {
                        type: "danger",
                        message: "Failed to create New ticket"
                    })
                    messageData.action = "createTicketFail";
                    wn.contentWindow.postMessage(messageData, "*");
                });

            }

        } else if (event.action == "languageChange") {
            client.db.update( event.agentId, "set", { "language": event.language })
        } else if (event.action == "countryChange") {
            client.db.update( event.agentId, "set", { "countrySelected": event.countrySelected })
        }
    }
}