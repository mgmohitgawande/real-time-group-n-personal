var app = angular.module('myapp');


app.factory('socket', ['$rootScope', '$localStorage', 'dataService', function($rootScope, $localStorage, dataService) {
    console.log('initializing socket')
    var socket = io.connect();

    socket.on('handle', function(connection_data) {
        console.log("Got handle : " + JSON.stringify(connection_data));
        if(connection_data && connection_data.socket_id){
            dataService.registerChatSessionForUser({socket_id : connection_data.socket_id}).then(function(registerChatSessionResp){
                if(registerChatSessionResp.status == 200 && registerChatSessionResp.data.chat_session){
                    var chat_session = registerChatSessionResp.data.chat_session
                    socket.emit('session_authenticated', {
                        socket_id : chat_session.socket_id,
                        user_id : chat_session.user_id,
                        handle : chat_session.handle,
                    })
                    console.log('lllll&^^&^&%&%&^%&&^%$&%$#$%$^&*()', {
                        socket_id : chat_session.socket_id,
                        user_id : chat_session.user_id,
                        handle : chat_session.handle,
                    })
                }
            }, function(error){
                
            });
        }
    });

    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);


app.service('encrypt', function() {
    this.hash =function(str){
        h = 7;
        letters = "abcdefghijklmnopqrstuvwxyz-_1234567890@!#$%&*.,"
        for (var i=0;i<str.length;i++){
            h = (h * 37 + letters.indexOf(str[i]))
        }
        return h
    }
});
app.factory('testInterceptor', function() {
    return {
        request: function(config) {
            return config;
        },
    
        requestError: function(config) {
            return config;
        },
    
        response: function(res) {
            console.log('&&&&&&&&&&&&&&&&')
            if(res.status == 401){
                $state.go('login')
            }
            return res;
        },
    
        responseError: function(res) {
            return res;
        }
    }
})

app.service('authenticationService', ['$http', '$localStorage', '$state', 'app_settings', function($http, $localStorage, $state, app_settings){

    var _checkLogin = function(data = {}){
        return new Promise(function(success, failure){
            console.log('hiiiii')
            if($localStorage.user && $localStorage.user._id){
                console.log('checking login', app_settings.API_URL + 'check_login');
                data.user = $localStorage.user
                $http({
                    method: 'POST',
                    url: app_settings.API_URL + 'check_login',
                    data: data,
                    // withCredentials: true
                }).then(function(response){
                    console.log('check login resp', response)
                    console.log(response)
                    if(response.data && response.data.status){
                        $localStorage.user = response.data.user
                        success()
                    }   else{
                        $localStorage.user = undefined;
                        console.log('going to login')
                        failure()
                    }
                }, function(error){
                    console.log('check login err', error)
                    $localStorage.user = undefined;
                    console.log('going to login')
                    failure()
                })
            }   else{
                console.log('no user in local storage')
                $localStorage.user = undefined;
                console.log('going to login')
                failure()
            }
        })
    }

    return {
        name : 'app',
        checkLogin : _checkLogin
    }
}])

app.service('dataService', ['$http', '$localStorage', '$state', 'app_settings', function($http, $localStorage, $state, app_settings){
    
    var _send_friend_request = function(data){
        data.user = $localStorage.user
        return $http({
            method: 'POST', 
            url : app_settings.API_URL + 'friend_request', 
            data : data
        })
    }

    var _confirm_friend_request =  function(data){
        data.user = $localStorage.user
        return $http({
            method : 'POST', 
            url : app_settings.API_URL + 'friend_request_confirmed',
            data : data
        })
    }

    var _registerChatSessionForUser = function(data){
        data.user = $localStorage.user
        return $http({
            method : 'POST', 
            url : app_settings.API_URL + 'registerChatSessionForUser',
            data : data
        })
    }
    var _logout = function(data){
        data.user = $localStorage.user
        return $http({
            method : 'POST', 
            url : app_settings.API_URL + 'logout',
            data : data
        })
    }

    return {
        send_friend_request : _send_friend_request,
        confirm_friend_request : _confirm_friend_request,
        registerChatSessionForUser : _registerChatSessionForUser,
        logout : _logout
    }
}])