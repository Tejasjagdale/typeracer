const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const express = require('express');
const bodyParser = require("body-parser");
const { match } = require('assert');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname+"/static"));

app.use(express.static(__dirname+"/images"));


app.get('/', function(req, res) {
   res.sendFile(__dirname+'/home.html');
});

var activeusers = [];
var waiting = [];
var inmatch = [];
var matchsocket = [];
var matchpos = [];


app.post("/",(req,res)=>{
});

app.get('/practice', function(req, res) {
   res.sendFile(__dirname+'/practice.html');
});

app.get('/race', function(req, res) {
   res.sendFile(__dirname+'/race.html');
});


//Whenever someone connects this gets executed
io.on('connection', function(socket) {

   socket.on('new-user-joined', (name) => {
    activeusers.push({'id':socket.id,'name':name});
    console.log(`A ${name} connected`);
    socket.emit('user-joined', activeusers);
    socket.broadcast.emit('user-joined', activeusers);  //sends msg to all  except the one who has sent (broadcast)
   });

     //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      for(var m=0;m<activeusers.length;m++){
         if(activeusers[m].id == socket.id){
         console.log(`${activeusers[m].name} disconnected`);
         activeusers.splice(m, 1);
         io.sockets.emit('user-dissconnected', activeusers);
         }
      }
   });

   socket.on('waiting',(name)=>{
      waiting.push(name);
   });

   function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

   socket.on('check-waiting',(name)=>{
      var n = Math.round(Math.random()*(10000));
      if(waiting.length >= 3){
         for(var h=0;h<=2;h++){
            inmatch.push({'roomno':"room"+n,"name":waiting[h],'ranno':random_num});
            socket.emit('match-found',inmatch);
            socket.broadcast.emit('match-found',inmatch);
            if(h == 2){
               matchsocket.push(inmatch);
               matchpos.push(["room"+n]);
            }
         }
         inmatch = [];
         waiting = [];
         for(var h=0;h<=2;h++){
            if(waiting.length == 3){
               waiting = [];
            }else{
               waiting = waiting.slice(2,waiting.length - 1);
            }
         }
      }
   });

   socket.on('long-waiting',(name)=>{
      var n =  Math.round(Math.random()*(10000));
      if(waiting.length >= 3){
         for(var h=0;h<=2;h++){
            inmatch.push({'roomno':"room"+n,"name":waiting[h],'ranno':random_num});
            socket.emit('match-found',inmatch);
            socket.broadcast.emit('match-found',inmatch);
            if(h == 2){
               matchsocket.push(inmatch);
               matchpos.push(["room"+n]);
            }
         }
         inmatch = [];
         for(var h=0;h<=2;h++){
            if(waiting.length == 3){
               waiting = [];
            }else{
               waiting = waiting.slice(2,waiting.length - 1);
            }
         }
      }if(waiting.length < 3){
         for(var h=0;h<=2;h++){
            if(h < waiting.length){
               inmatch.push({'roomno':"room"+n,"name":waiting[h],'ranno':random_num});
            }else{
               inmatch.push({'roomno':"room"+n,"name":"bot",'speed':25});
            }
            io.sockets.emit('match-found',inmatch);
            if(h == 2){
               matchsocket.push(inmatch);
               matchpos.push(["room"+n]);
            }
         }
         inmatch = [];
         waiting = [];
      }
   });
      

   socket.on('match-start', (data) => {
      for(var m=0;m<matchsocket.length;m++){
      if(matchsocket[m][0].roomno == data.roomno){
         for(var h=0;h<=2;h++){
            if(matchsocket[m][h].name == data.name){
               matchsocket[m][h] = data;
            }
            else if(matchsocket[m][h] == "bot"){
               matchsocket[m][h] = {'pos': 0,'speed': getRandomInt(20,30),'place':null,'name':"bot",'roomno':room}
               botupdate({'pos': 0,'speed': getRandomInt(20,30),'place':null,'name':"bot",'roomno':room});
            }
         }
         io.sockets.emit('match-start',matchsocket);
      }
   }
   });

   botupdate=(data)=>{
      var abot = setInterval(() => {
         io.sockets.emit('bots-update',);
      }, 1000);
   }

   socket.on('score-update', (data) => {
      for(var m=0;m<matchsocket.length;m++){
      if(matchsocket[m][0].roomno == data.roomno){
         for(var h=0;h<=2;h++){
            if(matchsocket[m][h].name == data.name){
               matchsocket[m][h] = data;
               if(data.place == "finished"){
                  for(var a=0;a<matchpos.length;a++){
                     if(matchpos[a].includes(data.roomno)){
                        if(matchpos[a].length == 1){
                           matchpos[a].push("1st place");
                           matchsocket[m][h].place = "1st place";
                           }
                        else if(matchpos[a].length == 2){
                              matchpos[a].push("2nd place");
                              matchsocket[m][h].place = "2nd place";
                           }
                        else if(matchpos[a].length == 3){
                              matchpos[a].push("3rd place");
                              matchsocket[m][h].place = "3rd place";
                           }
                        else if(matchpos[a].length == 4){
                              matchpos[a].push("4th place");
                              matchsocket[m][h].place = "4th place";
                           }
                        else if(matchpos[a].length == 5){
                              matchpos[a].push("5th place");
                              matchsocket[m][h].place = "5th place";
                           }
                     }
                  }
               }if(data.place == "unfinished"){
                  matchsocket[m][h].place = "unfinished";
               }
            }
         }
         io.sockets.emit('score-update',matchsocket);
      }
   }
   });

   socket.on('match-finsihed',(room)=>{
      for(var m=0;m<matchpos.length;m++){
         if(matchpos[m][0] == room){
            matchpos.slice(m,1);
         };
      }
      for(var m=0;m<matchsocket.length;m++){
         for(var h=0;h<=2;h++){
            if(matchsocket[m][h].roomno == room){
               matchsocket.slice(m,1);
            }
         }
      }
   });

});

http.listen(2512, function() {
   console.log('listening on : http://localhost:2512');
});