$(document).ready( function() {
        app.initialized()
        .then(function(_client) {
            var client = _client;

            let requester = "";

            client.data.get("ticket").then (
                function(data) {
                    console.log(JSON.stringify(data))
                    requester = data.ticket.requester_id
                }
            );

            $('#callButton').on('click', function() {
                console.log("make call clicked ==> " + requester)
    
                client.instance.get().then(
                    function(data)  {
                      var sidebarApp = data.find(x => x.location === "cti_global_sidebar");
                      client.instance.send({ message: { requesterId : requester  }, receiver: sidebarApp.instanceId});
                    }
                  );
            });

        });
    });