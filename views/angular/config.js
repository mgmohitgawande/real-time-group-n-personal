var app = angular.module('myapp');

app.config(['$httpProvider', function($httpProvider) {
    var interceptor = ['$injector', function($injector){
        return {
            request: function(config) {
                return config;
            },
        
            requestError: function(config) {
                return config;
            },
        
            response: function(res) {
                return res;
            },
        
            responseError: function(res) {
                if(res.status == 401){
                    console.log("$injector.get('$state').go('login')")
                    $injector.get('$localStorage').user = undefined;
                    $injector.get('$state').go('login')
                }
                return res;
            }
        }
    }]
    $httpProvider.interceptors.push(interceptor);
}])


var isLoggedIn = function($localStorage, $state, authenticationService){
    return new Promise(function(success, failure){
        authenticationService.checkLogin().then(function(){
            success()
        }, function(error){
            $state.go('login')
            failure()
        })
    })
}

app.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider){
    console.log('hello everybody')
    
    $urlRouterProvider.otherwise('/');
    
    $stateProvider.state('login', {
        url : '/login',
        views: {
            'body' : {
                templateUrl:'/views/login.html',
                controller:'registerController'
            }
        },
        resolve : {
            logedIn : ['$localStorage', '$state', 'authenticationService', function($localStorage, $state){
                return new Promise(function(success, failure){
                    if($localStorage.user && $localStorage.user._id){
                        $state.go('chat')
                        failure()
                        return;
                    }
                    success()
                })
            }]
        }
    })
    .state('chat',{
        url:'/chat',
        views:{
            'body':{
                templateUrl:'/views/chat.html',
                controller:'myController'
            }
        },
        resolve : {
            logedIn : ['$localStorage', '$state', 'authenticationService', isLoggedIn]
        }
    })
    $urlRouterProvider.when('', '/chat');
    $urlRouterProvider.when('/', '/chat');
}]);


app.run(['$rootScope', '$state', '$localStorage', 'dataService', function($rootScope, $state, $localStorage, dataService){
    var clearUserAndSendToLogin = function(){
        $localStorage.user = undefined
        $state.go('login')
    }
    $rootScope.logout = function(){
        dataService.logout({}).then(clearUserAndSendToLogin, clearUserAndSendToLogin)
    }
}])