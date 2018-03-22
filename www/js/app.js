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
		url: "/upload_images/:type/:id",
		templateUrl: "upload_images.html",
		controller: "images_controller"
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
		templateUrl: "user/user_recommend.html",
		controller: "user_main_controller"          
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

.controller("user_main_controller", ['$scope', '$firebaseObject', '$firebaseAuth', '$ionicSideMenuDelegate', function ($scope, $firebaseObject, $firebaseAuth, $ionicSideMenuDelegate){
	firebase.auth().onAuthStateChanged(function (u) {
		if (u) {
			var userref = firebase.database().ref().child("users").child(u.uid);
			$scope.user = $firebaseObject(userref);
		}
	});

	$scope.selected = function (outfit) {
		console.log("hey")
	}
}])

.controller("stylist_main_controller", ['$scope', '$firebaseObject', '$firebaseAuth', '$ionicSideMenuDelegate', function ($scope, $firebaseObject, $firebaseAuth, $ionicSideMenuDelegate){
	ionic.Platform.ready(function () {
		if (!$ionicSideMenuDelegate.isOpen) {
			$ionicSideMenuDelegate.toggleLeft()
		}
	});

	firebase.auth().onAuthStateChanged(function (u) {
		if (u) {
			var stylistref = firebase.database().ref().child("stylists").child(u.uid).child("clients");
			$scope.clientList = $firebaseObject(stylistref);
			var stylistref = firebase.database().ref().child("stylists").child(u.uid).child("clientRequests");
			$scope.clientRequestList = $firebaseObject(stylistref);; 
		}
	});

	$scope.loadClient = function(clientId) {
		var stylistref = firebase.database().ref().child("users").child(clientId);
		$scope.client = $firebaseObject(stylistref);
		$scope.dressLog = $firebaseObject(firebase.database().ref().child("users").child(clientId).child("dresslog"));
		$scope.wardrobeItems = $firebaseObject(firebase.database().ref().child("users").child(clientId).child("wardrobeitems"));
		$scope.recommendedItems = $firebaseObject(firebase.database().ref().child("users").child(clientId).child("recommendeditems"));
		$ionicSideMenuDelegate.toggleLeft();
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

.controller("images_controller", ["$scope", '$firebaseObject', "$stateParams", "Camera", function($scope, $firebaseObject, $stateParams, Camera){
	
	console.log("hi"); 
	console.log($stateParams); 
	if ($stateParams.type == "user") {
		var userref = firebase.database().ref().child("users").child($stateParams.id);
		$scope.clothingPieces = $firebaseObject(userref.child("wardrobeitems"));
		$scope.title = {
			"beginning": "Your Wardrobe Items", 
			"end": {
				"$value": ""
			}
		}
	} else {
		var userref = firebase.database().ref().child("users").child($stateParams.id);
		$scope.clothingPieces = $firebaseObject(userref.child("recommendeditems"));
		$scope.title = {
			"beginning": "Style for",
			"end": $firebaseObject(userref.child("name"))
		}
	}

	$scope.takePhoto = function () {
		var options = {
			quality: 75,
			targetWidth: 200,
			targetHeight: 200,
			sourceType: 1,
			correctOrientation: true,
			saveToPhotoAlbum: true,
		};

		Camera.getPicture(options).then(function (imageData) {
			// add photo to db and come back and update clothingPieces
			$scope.imgURI = imageData;
		},
			function (err) {
				console.log(err);
			});
	};

	$scope.loadPhoto = function () {
		var options = {
			quality: 75,
			targetHeight: 200,
			targetWidth: 200,
			sourceType: 0,
			correctOrientation: true
		};

		Camera.getPicture(options).then(function (imageData) {
			// add photo to db and come back and update clothingPieces
			$scope.imgURI = imageData;
		},
			function (err) {
				console.log(err);
			});
	};

	$scope.remove = function(uristring) {
		// remove photo from db and come back and update clothingPieces
		console.log("remove " + uristring); 
	}
	
}])

.controller("user_signin_controller", ['$scope', '$state', '$firebaseAuth', function ($scope, $state, $firebaseAuth) {
	var form = this;
	form.formSubmit = function () {
		console.log(form.user);

		var username = form.user.username;
		var password = form.user.password;

		firebase.auth().signInWithEmailAndPassword(username, password)
			.then(function () {
				// confirm user
				firebase.auth().onAuthStateChanged(function (u) {
					if (u) {
						var stylistsref = firebase.database().ref("users")
						stylistsref.child(u.uid).once('value', function (snapshot) {
							var exists = (snapshot.val() !== null);
							if (exists) {
								$state.go("user_main");
								console.log("User Login Success");
							} else {
								$scope.errorMsg = "This user is not a Client";
								$scope.$apply();
							}
						});
					}
					$scope.errorMsg = "Could not find this user.";
					$scope.$apply();
				});
			})
			.catch(function (error) {
				if (error.code == "auth/user-not-found") {
					$scope.errorMsg = "Could not find this user.";
				} else {
					$scope.errorMsg = "Something went wrong, try again.";
				}
				$scope.$apply();
				console.log(error);
			});
	};
}])

.controller("user_register_controller", ['$scope', '$state', '$firebaseAuth', function ($scope, $state, $firebaseAuth) {

	var form = this;
	form.formSubmit = function () {
		console.log(form.user);

		var username = form.user.username;
		var email = form.user.email;
		var password = form.user.password;
		var stylist_code = form.user.stylist_code;
		
		firebase.auth().createUserWithEmailAndPassword(email, password)
			.then(function (user) {
				if (user) {
					var stylistref = firebase.database().ref("stylists").orderByChild("email").equalTo(stylist_code).once('value', function (snapshot) {
						var exists = (snapshot.val() !== null);
						if (!exists) {

							var stylistId = Object.keys(snapshot.val())[0]

							// place in stylists
							var userInStylist = firebase.database().ref("stylists").child(stylistId).child("clientRequests").child(user.uid); 
							userInStylist.set({
								name: username, 
								img: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png", 
								email: email
							}); 

							// place in users 
							var userref = firebase.database().ref("users").child(user.uid)
							userref.set({
								dressLog: [],
								recommendeditems: [],
								recommendedoutfits: [],
								wardrobeitems: [],
								stylist: stylistId,
								email: email,
								name: username,
								img: "https://ionicframework.com/dist/preview-app/www/assets/img/avatar-finn.png",
							}); 

							// update own profile
							user.updateProfile({
								displayName: username,
								role: "User",
							});

							console.log("Successfully update user");
							console.log("Successfully created new user");
							$state.go("user_main");
						} else {
							$scope.errorMsg = "This email is not recognized as a stylist.";
							$scope.$apply();
						}
					})
				}
			})
			.catch(function (error) {
				console.log("Error creating new user");
				$scope.errorMsg = "Error creating new user, this email may already be in use.";
				$scope.$apply();
			})

	};

	$scope.isValid = function () {
		if ($scope.pword != $scope.re_pword) {
			return false;
		}
		else {
			return true;
		}
	};
}])

.controller("stylist_signin_controller", ['$scope', '$state', function ($scope, $state) {
	var form = this;
	form.formSubmit = function () {
		console.log(form.user);

		var username = form.user.username;
		var password = form.user.password;

		firebase.auth().signInWithEmailAndPassword(username, password)
			.then(function () {
				// confirm stylist
				firebase.auth().onAuthStateChanged(function (u) {
					if (u) {
						var stylistsref = firebase.database().ref("stylists")
						stylistsref.child(u.uid).once('value', function (snapshot) {
							var exists = (snapshot.val() !== null);
							if (exists) {
								$state.go("stylist_main");
								console.log("Stylist Login Success");
							} else {
								$scope.errorMsg = "This user is not a Stylist"; 
								$scope.$apply();
							}
						});
					}
					$scope.errorMsg = "Could not find this user."; 
					$scope.$apply();
				});
			})
			.catch(function (error) {
				if (error.code == "auth/user-not-found") {
					$scope.errorMsg = "Could not find this user."; 
				} else {
					$scope.errorMsg = "Something went wrong, try again."; 
				}
				$scope.$apply();
				console.log(error);
			});
	};
}])

.controller("stylist_register_controller", ['$scope', '$state', '$firebaseAuth', function ($scope, $state, $firebaseAuth) {

	var form = this;
	form.formSubmit = function () {
		console.log(form.user);

		var username = form.user.username;
		var email = form.user.email; 
		var password = form.user.password;

		firebase.auth().createUserWithEmailAndPassword(username, password)
			.then(function (user) {
				if (user) {
					var stylistref = firebase.database().ref("stylists").child(user.uid)
					stylistref.set({
						clientRequests: {},
						clients: {},
						email: email,
						name: username,
					})
					user.updateProfile({
						email: email,
						displayName: username,
						role: "Stylist",
					});

					console.log("Successfully update user");
				}
				console.log("Successfully created new user");
				$state.go("stylist_main");
			})
			.catch(function (error) {
				console.log("Error creating new user");
				$scope.errorMsg = "Error creating new user, this email may already be in use.";
				$scope.$apply();
			})

	};

}])
; 


