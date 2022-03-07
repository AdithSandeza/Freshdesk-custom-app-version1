exports = {
    addEndCallNote:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/v2/tickets/" + options.ticketId + "/notes";

        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
        };

        data = {
            "body": '<div> Contact Id : <a href=' + options.accountDetails.connectInstanceURL + '/contact-trace-records/details/' + options.contactId + '?tz=Etc%2FUTC>'+ options.contactId +'</a> <br> Agent Handled : ' + options.agentHandled + ' </div>'
        }

        var options = { headers: headers, body: JSON.stringify(data)};

        $request.post(requestURL, options)
        .then (
        function() {
            renderData({ "status": 200 } ); 
        },
        function(error) {
            console.log( "addEndCallNote" + JSON.stringify(error));
            renderData({ "status": 400 });
        });
    },
    addNote:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/v2/tickets/" + options.ticketId + "/notes";
     
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
        };

        data = {
            "body": "<div> " + options.note + " </div>"
        }
        
        var options = { headers: headers, body: JSON.stringify(data)};

        $request.post(requestURL, options).then (
        function() {
            renderData({ "status": 200 } ); 
        },
        function(error) {
            console.log( "addNote" + JSON.stringify(error));
            renderData({ "status": 400 });
        });
    },
    addContact:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/v2/contacts";

        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
        };

        data = {
            "name": options.contactName,
            "phone" : options.contactNumber
        }

        var options = { headers: headers, body: JSON.stringify(data)};

        $request.post(requestURL, options)
        .then (
        function(data) {
            let response = JSON.parse(data.response);
            let details = {};
            details.id = response.id;
            details.name = response.name;
            renderData({ "status": 200 , "message" : details } ); 
        },
        function(error) {
            console.log( "addContact" + JSON.stringify(error));
            renderData({ "status": 400 });
        });
    },
    createTicket:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/channel/v2/tickets";
        
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
        };

        if(options.contactId){
            data = {
                "subject": "From " + options.phoneNumber,
                "requester_id": options.contactId,
                "source" : 3
            }
        } else {
          

            data = {
                "subject": "From " + options.phoneNumber,
                "name" : "New Caller",
                "phone": options.phoneNumber,
                "source" : 3
            }
        }

        var options = { headers: headers, body: JSON.stringify(data)};

        $request.post(requestURL, options)
        .then (
        function(data) {
            let response = JSON.parse(data.response);
            renderData({ "status": 200 , "message" : response.id } ); 
        },
        function(error) {
            console.log( "createTicket" + JSON.stringify(error));
            renderData({ "status": 400 });
        });
    },
    getContactList:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/v2/contacts";
    
       var headers = {
           "Content-Type": "application/json",
           "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
       };

       var options = { headers: headers};

		$request.get(requestURL, options)
		.then (
		function(data) {
            let contacts = JSON.parse(data.response);
            let contactList = [] , i;

            for(i=0; i < contacts.length ; i++) {
                if(contacts[i].phone != null) {
                    let contactObj = {};
                    contactObj.contactId = contacts[i].id;
                    contactObj.contactName = contacts[i].name;
                    contactObj.contactNumber = contacts[i].phone;
                    contactList.push(contactObj);
                }
            }
            renderData({ "status": 200 , "message" : contactList });
		},
		function(error) {
			console.log( "getContactList" + JSON.stringify(error));
			renderData({ "status": 400 });
		});
    },
    getContactInfo:  function(options) {
        let requestURL = options.accountDetails.freshdeskURL + "/api/v2/contacts/" + options.requester;
    
       var headers = {
           "Content-Type": "application/json",
           "Authorization": "Basic <%= encode(iparam.freshdesk_apikey) %>"
       };

       var options = { headers: headers};

		$request.get(requestURL, options)
		.then (
		function(data) {
            let contact = JSON.parse(data.response);

            let contactData = {}
            contactData.name = contact.name;
            contactData.number = null;

            if(contact.phone != null) {
                contactData.number = contact.phone
            }

            if(contact.mobile != null) {
                contactData.number = contact.mobile
            }
            
            renderData({ "status": 200 , "message" : contactData });
		},
		function(error) {
			console.log( "getContactInfo" + JSON.stringify(error));
			renderData({ "status": 400 });
		});
    }
  }