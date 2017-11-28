var app = angular.module('myapp');
app.controller('registerController',['$scope', 'encrypt', '$http', '$state', '$localStorage', 'dataService', function($scope, encrypt, $http, $state, $localStorage, dataService){
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

        dataService.register($scope.user).then(function(data){
            console.log(data)
        }, function(error){
            console.log(error)
        })
    }

    $scope.login = function(){
        $scope.login_data.password=encrypt.hash($scope.login_data.password);

        dataService.login($scope.login_data).then(function(data){
            console.log('datadatadatadatadatadata', data)
            if(data.data.status == "success"){
                $scope.$storage.user = data.data.user
                console.log('going to chat')
                $state.go('chat');
            }
        }, function(error){
            console.log(error)
        })
    }
}]);