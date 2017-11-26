var app = angular.module('myapp');
app.controller('registerController',['$scope', 'encrypt', '$http', '$state', '$localStorage', function($scope, encrypt, $http, $state, $localStorage){
    url= location.host;

    $scope.$storage = $localStorage;
    $scope.$storage.user = {
        'name':'',
        'handle':'',
        'password':'',
        'email':'',
        'phone':''
    };

    $scope.login_data = {
        'handle':'',
        'password':''
    };

    $scope.Register = function(){
        $scope.user.password = encrypt.hash($scope.user.password);

        $http({method: 'POST',url:'http://'+url+'/api/register', data:$scope.user})//, headers:config})
            .success(function (data) {
            console.log(data)
        })
            .error(function (data) {
            //add error handling
            console.log(data)
        });
    }

    $scope.login = function(){
        $scope.login_data.password=encrypt.hash($scope.login_data.password);
        $http({ method: 'POST', url:'http://'+url+'/api/login', data:$scope.login_data })
            .success(function (data) {
            if(data.status == "success"){
                $scope.$storage.user = data.user
                console.log('going to chat')
                $state.go('chat');
            }
        })
            .error(function (data) {
            //add error handling
            console.log(data)
        });
    }
}]);