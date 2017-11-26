var app = angular.module('myapp',['ngMaterial','ui.router','ngStorage']);

app.constant('app_settings', {
    API_URL : 'http://' + location.host + '/api/',
    URL_HOST : location.host
});