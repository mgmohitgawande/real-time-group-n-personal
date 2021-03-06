var app = angular.module('myapp');
app.controller('myController',['$scope', '$rootScope', 'socket','$http','$mdDialog','$compile','$location','$state','$localStorage', '$sessionStorage', 'dataService', function($scope, $rootScope, socket,$http,$mdDialog,$compile,$location,$state,$localStorage, $sessionStorage, dataService){
    console.log('my name root scope', $rootScope.name)
    url= location.host;
    $scope.$storage = $localStorage;

    $scope.user = $localStorage.user;
    $scope.users=[];
    $scope.online_friends=[];
    $scope.allfriends=[];
    $scope.messages={};
    $scope.chats = []
    
    var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October","November", "December"];
    
    dataService.getRecentChats({}).then(function(recentChats){
        $scope.chats = recentChats.data;
        $scope.chats = $scope.chats.map(function(chat){
            var friend = $scope.user.friends.filter(friend => chat._id && friend._id == chat._id.friend_id)
            friend = friend.length ? friend[0] : {}
            chat.name = friend.name;
            chat.status = friend.status;
            chat._id = friend._id
            return chat
        })
    }, function(error){
        console.log('error obtaining recent chats', error)
    })
    socket.on('friend_list', function(data) {
        console.log("Friends list : ", data);
        $scope.$apply(function () {
            $scope.allfriends.push.apply($scope.allfriends,data);
        });
        console.log("Friends list : "+$scope.allfriends);
    });

    socket.on('pending_list', function(pending_friend_list) {
        console.log('pending friends', pending_friend_list)
        $scope.pending_friends = pending_friend_list
    });

    socket.on('users', function(users) {
        $scope.$apply(function () {
            $scope.onlineUsers = users.filter(user => user._id.user_id != $localStorage.user._id);
            $scope.online_friends = users.filter(function(onlineUser){
                $localStorage.user.friends.some(friend => friend._id == onlineUser._id.user_id)
            });
        });
        console.log('on users list', users, $scope.onlineUsers, $scope.online_friends, $localStorage.user)
    });
    
    $scope.confirm = function(){
        var data = {
            "friend_handle" : $scope.user_to_send_friend_req._id.handle,
            "friend_id" : $scope.user_to_send_friend_req._id.user_id,
            "my_handle" : $localStorage.user.handle,
            "myuser_id" : $localStorage.user.handle
        };
        dataService.send_friend_request(data).then(function(){
            console.log(data)
        }, function(error){
            console.log(error)
        })
    };

    var chatWitFriend = function(friend){
        return function(){
            var chat_friend = $scope.user.friends.filter(user_friend => user_friend._id == friend._id)[0]
            $scope.chat_popup(chat_friend);
        }
    }

    $scope.chatOrUnfriend = function(friend){
        var confirm = $mdDialog.confirm()
            .title(" connection request ")
            .textContent(friend.name+' wants to connect.Do you want to Connect?')
            .ariaLabel('Lucky day')
            .ok('Chat')
            .cancel('Unfriend');

            $mdDialog.show(confirm).then(chatWitFriend(friend), function(){
                var data = {
                    confirm : 'No',
                    friend_id : friend._id,
                    friend_handle : friend.name
                }
                dataService.confirm_friend_request(data).then(function(){
                    console.log(data)
                }, function(error){
                    console.log(error)
                })
            })
    }
    $scope.clearChat = function(friend_id){
        $scope.chats.forEach(function(chat){
            if(chat._id == friend_id){
                chat.messages.length = 0
            }
        })
    }
    $scope.acceptRequest = function(data){
        data['confirm']="Yes";
        dataService.confirm_friend_request(data).then(function(){
            console.log(data)
        }, function(error){
            console.log(error)
        })
    }
    $scope.cancelRequest = function(data){
        data['confirm']="No";
        dataService.confirm_friend_request(data).then(function(){
            console.log(data)
        }, function(error){
            console.log(error)
        })
    }
    
    $scope.showConfirm = function(data, fromPendingList) {
        // data : {friend_id, friend_handle}
        console.log('request acceptance', data)
        var confirm = $mdDialog.confirm()
            .title(" connection request ")
            .textContent(data.friend_handle+' wants to connect.Do you want to Connect?')
            .ariaLabel('Lucky day')
            .ok('Ok')
            .cancel('No');

        console.log('showing confirm', data)
        $mdDialog.show(confirm).then(function(){$scope.acceptRequest(data)}, function(){$scope.cancelRequest(data)});
    };

    $scope.handleFriendReq = function(friend){
        console.log('handleFriendReqhandleFriendReq', friend)
        $scope.showConfirm({
            friend_id : friend._id,
            friend_handle : friend.name
        });
    }

    socket.on('message', function(data) {
        console.log('message data', data)
        $scope.showConfirm(data);
    });

    socket.on('friend', function(data) {
        console.log("Connection Established"+data);
        $scope.$apply(function () {
            if (!$scope.online_friends.includes(data)){
                console.log(data);
                $scope.online_friends.push(data);
                $scope.users.splice($scope.users.indexOf(data),1);
            }

        });
    });
//    
//    socket.on('all_friend_list', function(data) {
//        $scope.$apply(function () {
//            $scope.allfriends.push.apply($scope.allfriends,data);
//        });
//    });
//    

    $scope.friend_request = function(user) {   
        $scope.user_to_send_friend_req = user;
    };

    var getDate=function(){
        date = new Date();
        hour=date.getHours();
        period="AM";
        if (hour>12){
            hour=hour%12;
            period="PM";
        }
        form_date=monthNames[date.getMonth()]+" "+date.getDate()+", "+hour+":"+date.getMinutes()+" "+period;
        return form_date;        
    }
    $scope.getDate = getDate;
    
    socket.on('group', function(data) {
        var div = document.createElement('div');
        console.log('$$$$$$$$$$$', data)
        if(data.split("#*@")[1] != $scope.$storage.user.name){
            div.innerHTML='<div class="direct-chat-msg right">\
                            <div class="direct-chat-info clearfix">\
                            <span class="direct-chat-name pull-right">'+data.split("#*@")[1]+'</span>\
                            <span class="direct-chat-timestamp pull-left">'+getDate()+'</span>\
                            </div>\
                            <div class="direct-chat-text">'
                            +data.split("#*@")[0]+
                            '</div>\
                            </div>';
            document.getElementById("group").appendChild(div);
            document.getElementById("group").scrollTop=document.getElementById("group").scrollHeight;
        }
    });
    
    $scope.group_message= function(message){
        console.log('###############', $scope.user)
        div = document.createElement('div');
        div.innerHTML='<div class="direct-chat-msg"> \
                        <div class="direct-chat-info clearfix">\
                        <span class="direct-chat-name pull-left">'+$scope.user.name+'</span>\
                        <span class="direct-chat-timestamp pull-right">'+getDate()+'</span>\
                        </div>\
                        <div class="direct-chat-text">'
                        +message+
                        '</div>\
                        </div>';
        document.getElementById("group").appendChild(div);
        document.getElementById("group").scrollTop=document.getElementById("group").scrollHeight;
        socket.emit('group message', message+"#*@" + $scope.$storage.user.name);
        $scope.groupMessage=null;
    }
    
    var insertMessage = function(from, to, msg, popup_index){
        console.log(from + " " + to);
        
        var message_obj = {
            "sender":from,
            "msg" : msg,
            "date" : getDate()  
        }
        
        var friend = from == $scope.user._id ? to : from
        friend = $scope.user.friends.filter(temp_friend => temp_friend._id == friend);
        friend = friend.length ? friend[0] : {}

        var friend_chat = $scope.chats.filter(chat => chat._id == friend._id)
        friend_chat = friend_chat.length ? friend_chat[0] : {
            _id : friend._id,
            name : friend.name,
            status : friend.status,
            messages : []
        }
        $scope.chats = $scope.chats.filter(chat => chat._id != friend._id)

        friend_chat.messages.push(message_obj);

        $scope.chats.unshift(friend_chat)
        console.log(localStorage.getItem(to));
    }

    socket.on('private message', function(data) {
        var chat_friend = $scope.user.friends.filter(friend => friend._id == data.split("#*@")[2])[0]
        $scope.chat_popup(chat_friend);
        insertMessage(chat_friend._id, $scope.user._id, data.split("#*@")[1], $scope.popups.length - 1);
        $scope.$apply();
    });

    $scope.send_message = function(chat, message, popup_index){
        insertMessage($scope.user._id, chat, message, popup_index);
        socket.emit('private message',chat+"#*@"+message+"#*@"+$scope.user._id+"#*@"+getDate());
        document.getElementById(chat).parent = document.getElementById(chat).scrollHeight;
        // document.getElementById(chat).scrollTop = 5000;
        console.log('###############', document.getElementById(chat), document.getElementById(chat).scrollTop, document.getElementById(chat).scrollHeight)
        $scope.popups[popup_index].curr_message = null
    }

    
    $scope.popups = [];
    
    $scope.chat_popup = function(chat_friend){
        // chat_friend = {_id, name, messages}
        $scope.popups = $scope.popups.filter(friend => friend._id != chat_friend._id)
        var friend_messages = $scope.chats.filter(chat => chat._id == chat_friend._id);
        friend_messages = friend_messages.length ? friend_messages[0].messages : []
        chat_friend.messages = friend_messages
        $scope.popups.push(chat_friend)
    }
    $scope.close_chat= function(chat_friend_id)
    {
        $scope.popups = $scope.popups.filter(friend => friend._id != chat_friend_id)
        var chat_box=document.getElementById(chat_friend_id + "01");
        chat_box.parentElement.removeChild(chat_box);
    }
}])