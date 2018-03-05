// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('welcome',{
      url:"/welcome",
      templateUrl:"welcome.html"
    })
    .state('user_signin', {
      url:"/user_signin",
      templateUrl:"user/signin.html"          
    })
    .state('user_register', {
      url:"/user_register",
      templateUrl:"user/register.html"          
    })
    .state('stylist_signin',{
      url:"/stylist_signin",
      templateUrl:"stylist/signin.html"
    })
    .state('stylist_register', {
      url:"/stylist_register",
      templateUrl:"stylist/register.html"
    })
    .state('user_main', {
      url:"/user_main",
      templateUrl:"user/user_main.html"          
    })
    .state('user_recommend', {
      url:"/user_recommend",
      templateUrl:"user/user_recommend.html"          
    })    
    .state('stylist_main',{
      url:"/stylist_main",
      templateUrl:"stylist/stylist_main.html"    
    });

    $urlRouterProvider.otherwise("/welcome");
})
;