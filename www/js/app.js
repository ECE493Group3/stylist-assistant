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
	$ionicConfigProvider.tabs.position('bottom');
	$ionicConfigProvider.navBar.alignTitle('center'); 
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

.controller("images_controller", ["$scope", '$firebaseObject', "$stateParams", "Camera", "$ionicPopover", "$http", "$rootScope", function($scope, $firebaseObject, $stateParams, Camera, $ionicPopover, $http, $rootScope){

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

		$scope.text = {
			"beginning": "Your Wardrobe Items", 
			"end": {
				"$value": ""
			}, 
			"image": "data:image/jpg;base64,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",
			"description": "Our dataset is designed to recognize outfits from true full body images. Images with more of the garments showing will perform better in the Magic. Try not to crop out large chucks of the item in pictures you upload."
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

		$scope.text = {
			"beginning": "Style for",
			"end": $firebaseObject(userref.child("name")), 
			"image": "data:image/jpg;base64,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",
			"description": "Our dataset is designed to recognize items from images with the entire garment shown. Images with more of the garment showing will perform better in the Magic.Try not to crop out large chucks of the item in pictures you upload."
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
			destinationType: 0,
		};

		Camera.getPicture(options).then(function (imageData) {
			// add photo to db and come back and update clothingPieces
			$scope.imgURI = imageData;
			postConent = "data:image/jpg;base64,"+imageData;
			
			console.log(imageData); 
			var uname = $rootScope.currentUser;
			$http.post("http://204.209.76.176:8000/temp.jpg?username="+uname, imageData);
			console.log("Done post request");
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

	$scope.remove = function(piece_id) {
		// remove photo from db 
		if ($stateParams.type == "user") {
			firebase.database().ref().child('users/' + $stateParams.id + '/wardrobeitems/' + piece_id).remove(function (error) {
				if (error) console.log("Error:", error);
			});
		} else {
			firebase.database().ref().child('users/' + $stateParams.id + '/recommendeditems/' + piece_id).remove(function (error) {
				if (error) console.log("Error:", error);
			});
		}
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

.controller("user_signin_controller", ['$scope', '$state', '$firebaseAuth', '$rootScope', function ($scope, $state, $firebaseAuth, $rootScope) {
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
								$rootScope.currentUser = username
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

