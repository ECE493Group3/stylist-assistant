// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
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
})

.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('user_signin', {
      url:"/user_signin",
      views:{
        "user-tab":{
          templateUrl:"user_signin.html"          
        }
      }
    })
    .state('user_register', {
      url:"/user_register",
      views:{
        "user-tab":{
          templateUrl:"user_register.html"          
        }
      }
    })
    .state('stylist_signin',{
      url:"/stylist_signin",
      views:{
        "stylist-tab":{
          templateUrl:"stylist_signin.html"
        }
      }
    })
    .state('stylist_register', {
      url:"/stylist_register",
      views:{
        "stylist-tab":{
          templateUrl:"stylist_register.html"
        }
      }
    })
    ;
})

.controller('user_signin_controller', ['$scope', '$window', function($scope, $window){
  // controller for user signin
  $scope.count = 0;

  $scope.submit = function(){
    if($scope.username){
      $scope.count += 1
      $scope.username = 'Submit one more time to direct';
      if($scope.count == 2){
        $window.location.href = 'user_main.html';
        $scope.count = 0;
      };
    };
  };
}])


.controller('user_register_controller', ['$scope', '$window', function($scope, $window){
  // controller for user register
  $scope.count = 0;

  $scope.submit = function(){
    if($scope.username){
      $scope.count += 1
      $scope.username = 'Submit one more time to direct';
      if($scope.count == 2){
        $window.location.href = 'user_main.html';
        $scope.count = 0;
      };
    };
  };
}])

.controller('stylist_signin_controller', ['$scope', '$window', function($scope, $window){
  // controller for stylist sign in
  $scope.count = 0;


  $scope.submit = function(){
    if($scope.username){
      $scope.count += 1
      $scope.username = 'Submit one more time to direct';
      if($scope.count == 2){
        $window.location.href = 'stylist_main.html';
        $scope.count = 0;
      };
    };
  };
}])

// controller for stylist register
.controller('stylist_register_controller', ['$scope', '$window', function($scope, $window){
  $scope.count = 0;

  $scope.submit = function(){
    if($scope.username){
      $scope.count += 1
      $scope.username = 'Submit one more time to direct';
      if($scope.count == 2){
        $window.location.href = 'stylist_main.html';
        $scope.count = 0;
      };
    };
  };
}]);
