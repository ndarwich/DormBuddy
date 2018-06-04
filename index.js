var express = require('express');
var app = express();
const path = require('path');
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
const firebase = require("firebase");
app.set('port',(process.env.PORT || 5000));
app.use(bodyParser.json());
app.listen(app.get('port'), function(){
    console.log('Node app is running on port', app.get('port'));
});
var config = {
    apiKey: "AIzaSyCcW-mL51ikuRxqLWY7Gm7XiVz-0So4sso",
    authDomain: "cs477-dormbuddy.firebaseapp.com",
    databaseURL: "https://cs477-dormbuddy.firebaseio.com",
    projectId: "cs477-dormbuddy",
    storageBucket: "cs477-dormbuddy.appspot.com",
    messagingSenderId: "369397080417"
};

firebase.initializeApp(config);
var database = firebase.database();

app.get("/",function(req,res){
    var output = "Possible request:\n"+
        "GET: /login?netID=User's netID&password=User's Password\n"+
        "\tReturns user data if user's credentials are correct\n"+
        "GET: /buildingMaps/:buildingID\n"+
        "\tReturns maps related to the building\n"+
        "GET: /rooms/:buildingID\n"+
        "\tReturns rooms within building\n"+
        "GET: /laundryMachines/:buildingID\n"+
        "\tReturns laundry machines within building\n"+
        "GET: /usingLaundryMachines/:buildingID/:time\n"+
        "\tReturns laundry machine reservations based on building and time\n"+
        "GET: /reservations/:buildingID/:room/:time\n"+
        "\tReturns laundry machine reservations based on room and time\n"+
        "PUT: /makeLaundryReservation/:buildingID/:room/:name\n"+
        +"\tBody: JSON.Stringify({'Status':stuff,'TimeDone':stuff,'User':stuff})\n"+
        "\tAdds or edits an UsingLaundryMachine entry, if the entry already exists the entry will only change if the users match\n"+
        "PUT: /makeReservation/:buildingID/:room\n"+
        "\tBody: JSON.Stringify({})\n+" +
        "\tAdds a reservation to the database\n"+
        "DELETE: /deleteReservation/:buildingID/:room/:time\n"+
        "\tDeletes a reservation based on room and starting time";
    res.send(output);
});
//============================================================
//                        Clean UsingLaundry Machine
// Regularly clean the UsingLaundry Machine entries that have already passed
//============================================================
function cleanUsingLaundryMachine(){
    var time = new Date().getTime();
    database.ref("Building-Table").once("value",function(snap){
        let snapshot = snap.val();
        var x;
        for(x in snapshot){
            let w = x;
            database.ref("UsingLaundryMachine-Table/"+w)
                .orderByChild("TimeDone")
                .startAt(0)
                .endAt(time)
                .once("value",function(snap){
                    let y;
                    for(y in snap.val()){
                        database.ref("UsingLaundryMachine-Table/"+w+"/"+y).remove();
                    }
                })
        }
    });
}
//var cleaner = setInterval(cleanUsingLaundryMachine,10000);




//============================================================
//                        Log In
// URI /login?netID=<User's NetID>&password=<User's Password>
// Returns user data if user's credentials are correct
//============================================================
app.get("/login",function(req,res){
    var netID = req.query.netID;
    var password = req.query.password;
    database.ref("User-Table/"+netID).once("value",function(snap){
        var queryRes = snap.val();
       // console.log(queryRes);
        if(queryRes != null && queryRes.Password == password)
            res.send(queryRes);
        else
            res.send(null);
    });
});
//============================================================
//                        Building Maps
// URI /buildingMaps/:buildingID
// Returns maps related to the building
//============================================================
app.get("/buildingMaps/:buildingID",function(req,res){
    database.ref("BuildingMap-Table/"+req.params.buildingID.toString()).once("value",function(snap){
       res.send(snap.val());
    });
});
//============================================================
//                        Room
// URI /rooms/:buildingID
// Returns rooms within building
//============================================================
app.get("/rooms/:buildingID",function(req,res){
    database.ref("Room-Table/"+req.params.buildingID.toString()).once("value",function(snap){
        res.send(snap.val());
    });
});

//============================================================
//                        Laundry Machines
// URI /laundryMachines/:buildingID
// Returns laundry machines within building
//============================================================
app.get("/laundryMachines/:buildingID",function(req,res){
    database.ref("LaundryMachine-Table/"+req.params.buildingID.toString()).once("value",function(snap){
        res.send(snap.val());
    });
});
//============================================================
//                        Using Laundry Machines
// URI /usingLaundryMachines/:buildingID/:time
// Returns laundry machine reservations based on building and time
//============================================================
app.get("/usingLaundryMachines/:buildingID/:time",function(req,res){
    var time = parseInt(req.params.time.toString());
   // console.log(time);
    database.ref("UsingLaundryMachine-Table/"+req.params.buildingID.toString())
        .orderByChild("TimeDone").startAt(time)
        .once("value",function(snap){
        res.send(snap.val());
    });
});
//============================================================
//                        Reservations
// URI /reservations/:buildingID/:room/:time
// Returns room reservations based on room and time
//============================================================
app.get("/reservations/:buildingID/:room/:time",function(req,res){
    var time = parseInt(req.params.time.toString());
    console.log(time);
    var building = req.params.buildingID.toString();
    var room = req.params.room.toString();
    database.ref("Reservation-Table/"+building+"/"+room)
        .orderByChild("TimeDone").startAt(time)
        .once("value",function(snap){
            res.send(snap.val());
        });
});





//============================================================
//                        Make Using Laundry Machine
// URI /makeLaundryReservation/:buildingID/:room/:name
// Adds or edits an UsingLaundryMachine entry, if the entry already exists the entry will only change if the users match
//============================================================
app.put("/makeLaundryReservation/:buildingID/:room/:name",function(req,res){
    var content = req.body
    if(content["User"] == null || isNaN(content["TimeDone"]) || isNaN(content["Status"])) {
        res.sendStatus(400);
        return;
    }
    var building = req.params.buildingID.toString();
    var room = req.params.room.toString();
    var name = req.params.name.toString();
    var entry = room+'-'+name;
    database.ref("LaundryMachine-Table/"+building+"/"+entry)
        .once("value",function(snap){
            let snapshot = snap.val();
            if(snapshot == null || snapshot["Condition"] == "Broken")
                res.sendStatus(412);
            else
                database.ref("UsingLaundryMachine-Table/"+building+'/'+entry)
                    .once("value",function(snap){
                        var snapshot = snap.val();
                        if(snapshot == null || snapshot["User"] == content["User"]){
                            console.log("here");
                            database.ref("UsingLaundryMachine-Table/"+building+'/'+entry)
                                .set(content);
                            res.sendStatus(200);
                        }
                        else
                            res.sendStatus(409);
                    });
        });
});


//============================================================
//                        Make Reservation
// URI /makeReservation/:buildingID/:room
// Adds a reservation entry
//============================================================
app.put("/makeReservation/:buildingID/:room",function(req,res){
    var content = req.body
    if(content["IsEvent"] == null || isNaN(content["TimeStart"]) || isNaN(content["TimeEnd"]) || content["User"] == null) {
        res.sendStatus(400);
        return;
    }
    var building = req.params.buildingID.toString();
    var room = req.params.room.toString();
    database.ref("Room-Table/"+building+"/"+room)
        .once("value",function(snap){
            let snapshot = snap.val();
            if(snapshot == null || (content["IsEvent"] == "false" && snapshot["Type"] != "STUDY"))
                res.sendStatus(412);
            else
                database.ref("Reservation-Table/"+building+'/'+room)
                    .orderByChild("TimeEnd").startAt(content["TimeStart"])
                    .once("value",function(snap){
                        var snapshot = snap.val();
                        //console.log(snapshot);
                        let x;
                        if(snapshot != null) {
                            for (x in snapshot) {
                                //console.log(x)
                                if (snapshot[x]["TimeStart"] < content["TimeEnd"]) {
                                    res.sendStatus(409);
                                    return;
                                }
                            }
                        }
                        var time = new Date().getTime();
                        //console.log(time.toString());
                        var output = {};
                        output[time] = content;
                        database.ref("Reservation-Table/"+building+'/'+room).child(time).set(content);
                        res.sendStatus(200);
                    });
        });
});



//============================================================
//                        Delete Reservation
// URI /deleteReservation/:buildingID/:room/:time
// delete a reservation entry
//============================================================
app.delete("/deleteReservation/:buildingID/:room/:time",function(req,res){
    var building = req.params.buildingID.toString();
    var room = req.params.room.toString();
    var time = parseInt(req.params.time.toString());
    database.ref("Room-Table/"+building+"/"+room)
        .once("value",function(snap){
            let snapshot = snap.val();
            if(snapshot == null)
                res.sendStatus(412);
            else
                database.ref("Reservation-Table/"+building+'/'+room)
                    .orderByChild("TimeStart").startAt(time)
                    .endAt(time)
                    .once("value",function(snap){
                        var snapshot = snap.val();
                        if(snapshot != null) {
                            var x;
                            for (x in snapshot) {
                                database.ref("Reservation-Table/"+building+'/'+room+"/"+x).remove();
                                res.sendStatus(200);
                                return;
                            }
                        }
                        res.sendStatus(410);
                    });
        });
});

