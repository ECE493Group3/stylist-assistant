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
		controller: "user_recommend_controller"          
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

.controller("user_main_controller", ['$scope', '$firebaseObject', '$firebaseAuth', '$ionicPopover', '$ionicTabsDelegate', function ($scope, $firebaseObject, $firebaseAuth, $ionicPopover, $ionicTabsDelegate){
	var user; 
	firebase.auth().onAuthStateChanged(function (u) {
		if (u) {
			// user auth
			var userref = firebase.database().ref().child("users").child(u.uid);
			$scope.user = $firebaseObject(userref);
			firebase.database().ref("users").child(u.uid).child("wardrobeitems").once('value', function (snapshot) {
				var exists = (snapshot.val() !== null);
				if (!exists) {
					$scope.emptyState = false;
				} else {
					$scope.emptyState = true; 
				}
			});

			// wardrobe filter setup
			var categoryRef = firebase.database().ref().child('users/' + u.uid + '/wardrobeitems/')
			var cat = $firebaseObject(categoryRef); 
			cat.$loaded().then(function () {
				var filteredCategoriesWardrobe = {}
				angular.forEach(cat, function (value, key) {
					filteredCategoriesWardrobe[value.category] = categories[value.category]; 
				});
				$scope.categories = filteredCategoriesWardrobe;
				$scope.filteredCategoriesWardrobe = filteredCategoriesWardrobe;
			});
		}
	});

	$ionicPopover.fromTemplateUrl('filter-popover.html', {
		scope: $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function ($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.popover.remove();
	});
}])

.controller("user_recommend_controller", ['$scope', '$firebaseObject', '$firebaseAuth', '$ionicPopover', '$ionicTabsDelegate', '$ionicLoading', function ($scope, $firebaseObject, $firebaseAuth, $ionicPopover, $ionicTabsDelegate, $ionicLoading) {
	var user;
	firebase.auth().onAuthStateChanged(function (u) {
		if (u) {
			user = u; 
			// user auth
			var userref = firebase.database().ref().child("users").child(u.uid);
			$scope.user = $firebaseObject(userref);
			firebase.database().ref("users").child(u.uid).child("wardrobeitems").once('value', function (snapshot) {
				var exists = (snapshot.val() !== null);
				if (!exists) {
					$scope.emptyState = false;
				} else {
					$scope.emptyState = true;
				}
			});

			// outfit filter setup
			var outfitcategoryRef = firebase.database().ref().child('users/' + u.uid + '/recommendedoutfits/')
			var ocat = $firebaseObject(outfitcategoryRef);
			ocat.$loaded().then(function () {
				var filteredCategoriesOutfits = {}
				angular.forEach(ocat, function (value, key) {
					if (value.categorybottom != "None") {
						filteredCategoriesOutfits[value.categorybottom] = categories[value.categorybottom];
					}
					if (value.categorytop != "None") {
						filteredCategoriesOutfits[value.categorytop] = categories[value.categorytop];
					}
					if (value.categoryfull != "None") {
						filteredCategoriesOutfits[value.categoryfull] = categories[value.categoryfull];
					}
				});
				$scope.categories = filteredCategoriesOutfits;
			});
		}
	});

	$scope.selected = function (outfit) {
		$ionicLoading.show({ template: 'Item Added!', noBackdrop: true, duration: 1000 });
		
		// make date 
		var td = new Date(); 
		var mm = td.getMonth() + 1; 
		var dd = td.getDate();
		outfit["date"] = [td.getFullYear(),
							(mm > 9 ? '' : '0') + mm,
							(dd > 9 ? '' : '0') + dd
						].join('-')

		firebase.database().ref().child('users/' + user.uid + '/dresslog').push(outfit);
	}

	$ionicPopover.fromTemplateUrl('filter-popover.html', {
		scope: $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function ($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.popover.remove();
	});
}])

.controller("stylist_main_controller", ['$scope', '$firebaseObject', '$firebaseAuth', '$ionicSideMenuDelegate', '$ionicPopover', function ($scope, $firebaseObject, $firebaseAuth, $ionicSideMenuDelegate, $ionicPopover){
	ionic.Platform.ready(function () {
		$ionicSideMenuDelegate.toggleLeft(true)
	});

	var user 
	firebase.auth().onAuthStateChanged(function (u) {
		if (u) {
			var stylistref = firebase.database().ref().child("stylists").child(u.uid).child("clients");
			$scope.clientList = $firebaseObject(stylistref);
			var stylistref = firebase.database().ref().child("stylists").child(u.uid).child("clientRequests");
			$scope.clientRequestList = $firebaseObject(stylistref);
			user = u; 
		}
	});

	showClient(); 

	function showClient() {
		if (!$scope.client) {
			$scope.emptyState = false;
		} else {
			$scope.emptyState = true;
		}
	}

	$scope.loadClient = function(clientId) {
		var client = firebase.database().ref().child("users").child(clientId); 
		$scope.client = $firebaseObject(client);
		showClient(); 

		// wardrobe 
		client.child("wardrobeitems").once('value', function (snapshot) {
			var exists = (snapshot.val() !== null);
			if (!exists) {
				$scope.wardrobeItemsEmptyState = false;
			} else {
				$scope.wardrobeItemsEmptyState = true;
				$scope.wardrobeItems = $firebaseObject(client.child("wardrobeitems"));
				$scope.wardrobeItems.$loaded().then(function () {
					var filteredCategoriesWardrobe = {}
					angular.forEach($scope.wardrobeItems, function (value, key) {
						filteredCategoriesWardrobe[value.category] = categories[value.category];
					});
					$scope.filteredCategoriesWardrobe = filteredCategoriesWardrobe;
				});
			}
		});

		// dresslog
		client.child("dresslog").once('value', function (snapshot) {
			var exists = (snapshot.val() !== null);
			if (!exists) {
				$scope.dresslogEmptyState = false;
			} else {
				$scope.dresslogEmptyState = true;
				$scope.dressLog = $firebaseObject(client.child("dresslog").orderByChild("date"));
				$scope.dressLog.$loaded().then(function () {
					var filteredCategoriesLog = {}
					angular.forEach($scope.dressLog, function (value, key) {
						if (value.categorybottom != "None") {
							filteredCategoriesLog[value.categorybottom] = categories[value.categorybottom];
						}
						if (value.categorytop != "None") {
							filteredCategoriesLog[value.categorytop] = categories[value.categorytop];
						}
						if (value.categoryfull != "None") {
							filteredCategoriesLog[value.categoryfull] = categories[value.categoryfull];
						}
					});
					$scope.filteredCategoriesLog = filteredCategoriesLog;
				});
			}
		});

		// recommendations
		client.child("recommendeditems").once('value', function (snapshot) {
			var exists = (snapshot.val() !== null);
			if (!exists) {
				$scope.recommendedItemsEmptyState = false;
			} else {
				$scope.recommendedItemsEmptyState = true;
				$scope.recommendedItems = $firebaseObject(client.child("recommendeditems"));
				$scope.recommendedItems.$loaded().then(function () {
					var filteredCategoriesRecItems = {}
					angular.forEach($scope.recommendedItems, function (value, key) {
						if (value.categorybottom != "None") {
							filteredCategoriesRecItems[value.categorybottom] = categories[value.categorybottom];
						}
						if (value.categorytop != "None") {
							filteredCategoriesRecItems[value.categorytop] = categories[value.categorytop];
						}
						if (value.categoryfull != "None") {
							filteredCategoriesRecItems[value.categoryfull] = categories[value.categoryfull];
						}
					});
					$scope.filteredCategoriesRecItems = filteredCategoriesRecItems;
				});
			}
		});

		$ionicSideMenuDelegate.toggleLeft(false);
	}

	$scope.acceptClient = function (clientId, client) {
		firebase.database().ref().child('stylists/' + user.uid + '/clients/' + clientId).update(client); 

		$scope.removeClient(clientId)
	}

	$scope.removeClient = function (clientId) {

		firebase.database().ref().child('stylists/'+user.uid+'/clientRequests/'+clientId).remove(function (error) {
			if (error) {
				console.log("Error:", error);
			} else {
				console.log("Removed successfully!");
			}
		});

	}

	$ionicPopover.fromTemplateUrl('filter-popover.html', {
		scope: $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function ($event, listnum) {
		if (listnum == 0) {
			$scope.categories = $scope.filteredCategoriesLog; 
		} if (listnum == 1) {
			$scope.categories = $scope.filteredCategoriesWardrobe;
		} else {
			$scope.categories = $scope.filteredCategoriesRecItems;
		}
		
		$scope.popover.show($event);
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.popover.remove();
	});
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

.controller("images_controller", ["$scope", '$firebaseObject', "$stateParams", "Camera", "$ionicPopover", "$http", function($scope, $firebaseObject, $stateParams, Camera, $ionicPopover, $http){

	if ($stateParams.type == "user") {
		var userref = firebase.database().ref().child("users").child($stateParams.id);
		$scope.wardrobePieces = $firebaseObject(userref.child("wardrobeitems"));
		$scope.wardrobePieces.$loaded().then(function () {
			var filteredCategoriesWardrobe = {}
			angular.forEach($scope.wardrobePieces, function (value, key) {
				filteredCategoriesWardrobe[value.category] = categories[value.category];
			});
			$scope.categories = filteredCategoriesWardrobe;
		});

		$scope.title = {
			"beginning": "Your Wardrobe Items", 
			"end": {
				"$value": ""
			}
		}
	} else {
		var userref = firebase.database().ref().child("users").child($stateParams.id);
		$scope.recommendedPieces = $firebaseObject(userref.child("recommendeditems"));
		$scope.recommendedPieces.$loaded().then(function () {
			var filteredCategoriesRecItems = {}
			angular.forEach($scope.recommendedPieces, function (value, key) {
				if (value.categorybottom != "None") {
					filteredCategoriesRecItems[value.categorybottom] = categories[value.categorybottom];
				}
				if (value.categorytop != "None") {
					filteredCategoriesRecItems[value.categorytop] = categories[value.categorytop];
				}
				if (value.categoryfull != "None") {
					filteredCategoriesRecItems[value.categoryfull] = categories[value.categoryfull];
				}
			});
			$scope.categories = filteredCategoriesRecItems;
		});

		$scope.title = {
			"beginning": "Style for",
			"end": $firebaseObject(userref.child("name"))
		}
	}

	$scope.takePhoto = function () {
		console.log("img/ionic.png");

		$http.get("http://204.209.76.176:8000/img_006.jpg?username=abc@gmail.com").then(
			function success(response){
				$scope.test_img = response.data
				console.log(response);
			}, function error(response){
				console.log("Error:" +response);
			});

		// var reader = new FileReader();
		// reader.onload = function(){callback(reader.result)};
		// // console.log(reader.readAsBinaryString($scope.img));
		// // console.log(reader.readAsDataURL($scope.img));

		// $http.post("http://204.209.76.176:8000/ionic.jpg?username=abc@gmail.com", $scope.testimg);
		// console.log($scope.testimg);
		// console.log("Done post request");
		// var options = {
		// 	quality: 75,
		// 	targetWidth: 200,
		// 	targetHeight: 200,
		// 	sourceType: 0,
		// 	correctOrientation: true,
		// 	saveToPhotoAlbum: true,
		// };

		// Camera.getPicture(options).then(function (imageData) {
		// 	// add photo to db and come back and update clothingPieces
		// 	$scope.imgURI = imageData;
		// 	console.log(imageData); 
		// 	$http.post("http://204.209.76.176:8000/img_006.jpg?username=abc@gmail.com", imageData);
		// 	console.log("Done post request");
		// },
		// function (err) {
		// 	console.log(err);
		// });
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

	$ionicPopover.fromTemplateUrl('filter-popover.html', {
		scope: $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function ($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.popover.remove();
	});
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
						if (exists) {

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

var categories = {
	"None": {
		"filter": false
	},
	"Sweater": {
		"name": "Sweater",
		"filter": true
	},
	"Blazer": {
		"name": "Blazer",
		"filter": true
	},
	"Bomber": {
		"name": "Bomber",
		"filter": true
	},
	"Cardigan": {
		"name": "Cardigan",
		"filter": true
	},
	"Hoodie": {
		"name": "Hoodie",
		"filter": true
	},
	"Flannel": {
		"name": "Flannel",
		"filter": true
	},
	"Jacket": {
		"name": "Jacket",
		"filter": true
	},
	"Parka": {
		"name": "Parka",
		"filter": true
	},
	"Poncho": {
		"name": "Poncho",
		"filter": true
	},
	"Tee": {
		"name": "Tee",
		"filter": true
	},
	"Top": {
		"name": "Top",
		"filter": true
	},
	"Jersey": {
		"name": "Jersey",
		"filter": true
	},
	"ButtonDown": {
		"name": "ButtonDown",
		"filter": true
	},
	"Tank": {
		"name": "Tank",
		"filter": true
	},
	"Henley": {
		"name": "Henley",
		"filter": true
	},
	"Bottoms": {
		"name": "Bottoms",
		"filter": true
	},
	"Pants": {
		"name": "Pants",
		"filter": true
	},
	"Jeans": {
		"name": "Jeans",
		"filter": true
	},
	"Chinos": {
		"name": "Chinos",
		"filter": true
	},
	"Joggers": {
		"name": "Joggers",
		"filter": true
	},
	"Sweatpants": {
		"name": "Sweatpants",
		"filter": true
	},
	"Shorts": {
		"name": "Shorts",
		"filter": true
	},
	"Trunks": {
		"name": "Trunks",
		"filter": true
	},
	"Sweatshorts": {
		"name": "Sweatshorts",
		"filter": true
	},
	"FullBody": {
		"name": "FullBody",
		"filter": true
	},
	"Coat": {
		"name": "Coat",
		"filter": true
	},
	"Cape": {
		"name": "Cape",
		"filter": true
	}
}

