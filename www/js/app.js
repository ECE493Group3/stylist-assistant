// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

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

  //Back button listener
  $ionicPlatform.onHardwareBackButton(function(event){
    if($ionicHistory.currentStateName() == "welcome"){
      ionic.Platform.exitApp();
    }
    else{
      $ionicHistory.goBack();
    }
  }, 100);
})

// Disable Animation
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.transition('none');
})

// UI Routers
.config(function($stateProvider, $urlRouterProvider){

  $stateProvider
    .state('welcome',{
      cache:false,
      url:"/welcome",
      templateUrl:"welcome.html"   
    })
    .state('upload_images', {
      url: "/upload_images",
      templateUrl: "upload_images.html",
    })
    .state('user_signin', {
      cache:false,
      url:"/user_signin",
      templateUrl:"user/signin.html"   
    })
    .state('user_register', {
      cache:false,
      url:"/user_register",
      templateUrl:"user/register.html"
    })
    .state('stylist_signin',{
      cache:false,
      url:"/stylist_signin",
      templateUrl:"stylist/signin.html"
    })
    .state('stylist_register', {
      cache:false,
      url:"/stylist_register",
      templateUrl:"stylist/register.html"   
    })
    .state('user_main', {
      cache:false,
      url:"/user_main",
      templateUrl:"user/user_main.html",    
      controller: "user_main_controller"
    })
    .state('user_recommend', {
      cache:false,
      url:"/user_recommend",
      templateUrl:"user/user_recommend.html"             
    })    
    .state('stylist_main',{
      cache:false,
      url:"/stylist_main",
      templateUrl:"stylist/stylist_main.html",   
      controller: "stylist_main_controller"  
    })
    ;

    $urlRouterProvider.otherwise("/welcome");
})

.controller("user_main_controller", [function(){
  $scope.recommendedOutfits = [
    {
      "name": "Blue jeans and Grey hoodie",
      "description": "light blue parasuco demin with grey oversized Topman hoodie.",
      "image": "img/ionic.png"
    }, {
      "name": "Blue jeans and Grey hoodie",
      "description": "light blue parasuco demin with grey oversized Topman hoodie.",
      "image": "img/ionic.png"
    }, {
      "name": "Blue jeans and Grey hoodie",
      "description": "light blue parasuco demin with grey oversized Topman hoodie.",
      "image": "img/ionic.png"
    }
  ]
}])
.controller("stylist_main_controller", ['$scope', '$ionicPopup', function($scope, $ionicPopup){
  $scope.clientList = [
    {
      name: "ClientName1",
      imgUrl: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
      notes: "How you say broke in Spanish"
    },
    {
      name: "ClientName2",
      imgUrl: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
      notes: "Client 2 is here"
    },
    {
      name: "ClientName3",
      imgUrl: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
      notes: "Client 3 is herebababab"
    },
  ];
  $scope.clientRequestList = [
    {
      name: "ClientName4",
      imgUrl: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
      notes: "How you say broke in Spanish"
    },
  ];

  $scope.addUser = function(){
    var popUp = $ionicPopup.show({
      template:"<input type='text' ng-model='data.model'>",
      title: "Title",
      subTitle: "Subtitle",
      scope: $scope,
      buttons:[
        {
          text:"Cancel"
        },
        {
          text:"Add User",
          type: "button-positive",
          onTap: function(e){
            if(!$scope.data.model){
              e.preventDefault();
            }else{
              return $scope.data.model;
            }
          }
        },
        ]
    });
    var newClient = {
      name: $scope.data.model,
      imgUrl: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
      notes: "adding new client"
    };
    $scope.clientList.push(newClient);
  };

  $scope.edit = function() {
    $scope.delete_button = !$scope.delete_button;
  }

  $scope.dressLog = [{ "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }]
  $scope.recommendedItems = [{ "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }, { "img": "img/ionic.png" }]
  $scope.wardrobeItems = [{"img": "img/ionic.png"},{"img": "img/ionic.png"},{"img": "img/ionic.png"},{"img": "img/ionic.png"},{"img": "img/ionic.png"}]


}])

.controller("user_signin_controller", ['$scope', '$state', '$firebaseAuth' , function($scope, $state, $firebaseAuth){
  var form = this;
  form.formSubmit = function () {
    console.log(form.user);

    var username = form.user.username;
    var password = form.user.password;

    firebase.auth().signInWithEmailAndPassword(username, password)
    .then(function(){
      $state.go("user_main");
      console.log("User Login Success");
    })
    .catch(function(error){
      console.log(error);
    }); 
  };
}])

.controller("user_register_controller", ['$scope', '$location', '$firebaseAuth', function($scope, $location, $firebaseAuth){

  $scope.formSubmit = function(){
    var email = "aaaregister@test.com";
    var password = "password";

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(user){
      if(user){
        user.updateProfile({
          displayName: "Hello World",
          role: "User",
        });
        console.log("Successfully update user");

        console.log("Username: " + user.displayName);
        console.log("role: " + user.role);
      }
      console.log("Successfully created new user");
      // $location.path("/user_main");
    })
    .catch(function(error){
      console.log("Error creating new user");
    })
    
  };

  $scope.isValid = function(){
    if($scope.pword != $scope.re_pword){
      return false;
    }
    else{
      return true;
    }
  };

}])
.controller("stylist_signin_controller", ['$scope', '$location' , function($scope, $location){

  $scope.formSubmit = function(){
    $location.path("/stylist_main");
  }

}])
.controller("stylist_register_controller", ['$scope', '$location', 'ConnectDB', function($scope, $location, ConnectDB){

  $scope.formSubmit = function(){
    // ConnectDB.connectDB();

    $location.path("/stylist_main");
  }

}])
.service("network", function(){
  this.checkConnection = function(){
    var networkState = navigator.connection.type;

    var states = {};
   states[Connection.UNKNOWN]  = 'Unknown connection';
   states[Connection.ETHERNET] = 'Ethernet connection';
   states[Connection.WIFI]     = 'WiFi connection';
   states[Connection.CELL_2G]  = 'Cell 2G connection';
   states[Connection.CELL_3G]  = 'Cell 3G connection';
   states[Connection.CELL_4G]  = 'Cell 4G connection';
   states[Connection.CELL]     = 'Cell generic connection';
   states[Connection.NONE]     = 'No network connection';

  };
})
.factory('Camera', function($q){
  //Reference https://www.tutorialspoint.com/ionic/ionic_camera.htm
  return {
    getPicture: function(options){
      var q = $q.defer();
      navigator.camera.getPicture(function(result){
        q.resolve(result);
      },
      function(err){
        q.reject(err);
      },
      options);

      return q.promise;
    }
  }
})
.controller("images_controller", ["$scope", "Camera", function($scope, Camera){

  $scope.takePhoto = function(){
    var options = {
      quality:75,
      targetWidth: 200,
      targetHeight: 200,
      sourceType:1,
      correctOrientation: true,
      saveToPhotoAlbum: true,
    };

    Camera.getPicture(options).then(function(imageData){
      // add photo to db and come back and update clothingPieces
      $scope.imgURI = imageData;
    },
    function(err){
      console.log(err);
    });
  };

  $scope.loadPhoto = function(){
    var options = {
      quality: 75,
      targetHeight: 200,
      targetWidth: 200,
      sourceType: 0,
      correctOrientation: true
    };

    Camera.getPicture(options).then(function(imageData){
      // add photo to db and come back and update clothingPieces
      $scope.imgURI = imageData;
    },
    function(err){
      console.log(err);
    });
  };

  $scope.clothingPieces; 
  
  // if user is stylist 
  $scope.clothingPieces = [
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
    {
      name: "avatar-finn",
      imgURI: "img/ionic.png",
    },
  ];
  // if user is client
  // $scope.clothingPieces = []; 

  $scope.remove = function(uristring) {
    // remove photo from db and come back and update clothingPieces
    console.log("remove " + uristring); 
  }

}])
; 


