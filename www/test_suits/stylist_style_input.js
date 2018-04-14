var firebase = require("firebase");

var config = {
    apiKey: "AIzaSyAM6oHfByOyhZsJYM8SnwcU2P8L1qP8MuA",
    authDomain: "personalstylist-788fb.firebaseapp.com",
    databaseURL: "https://personalstylist-788fb.firebaseio.com",
    projectId: "personalstylist-788fb",
    storageBucket: "personalstylist-788fb.appspot.com",
    messagingSenderId: "1069170926587"
};
firebase.initializeApp(config);

describe("Stylist style Input", function () {

    var PORT = 8105;

    var username = element(by.model('$ctrl.user.username'));
    var password = element(by.model('$ctrl.user.password'));

    var restore_data = "";
    var ref = firebase.database().ref();

    let joc = jasmine.objectContaining;

    var get_firebase_data = function () {
        var ref = firebase.database().ref();

        return ref.once('value').then(function (snap) {
            console.log("made it a callback");
            return snap.val();
        });
    }

    beforeAll(function () {
        console.log("restore_data: " + restore_data);
        var user_email = "test_user@capstone.ca";
        var user_pword = "capstone";

        var ref = firebase.database().ref();

        firebase.auth().signInWithEmailAndPassword(user_email, user_pword).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Error: " + errorCode);
            console.log("Error Message: " + errorMessage);
        });

        browser.wait(() => {
            return get_firebase_data().then((data) => {
                console.log("Start loading old data");
                restore_data = data;
                console.log("restore_data: " + restore_data);

                // console.log(JSON.stringify(data));
                console.log("Finish loading old data");
                stylist_json = {
                    "DSzjEvbRcsPD5cnymJ01fZGoIrPddd2": {
                        "email": "test_stylist@domain.ca",
                        "name": "test_stylist",
                    },
                }
                user_json = {
                    "JJmxTJiDAAdKkehR7JucOOJb4OZ2": {
                        "email": "test_user@capstone.ca",
                        "name": "Test User",
                        "dresslog": {},
                        "recommendeditems": {
                            "-L9RC9KkmRo80XiMIZTS": {
                                "categorytop": "Tee",
                                "categorybottom":"None",
                                "categoryfull":"None",
                                "img": "data:image/jpg;base64,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"
                            }
                        },
                    },
                };

                console.log("Start pushing test data");

                // ref.remove();
                firebase.database().ref("users").update(user_json);
                firebase.database().ref("stylists").update(stylist_json);
                console.log("Finish pushing test data");
                return restore_data != "";
            })
        }, 10000);
    });

    afterAll(function () {
        // console.log("restore_data: " + JSON.stringify(restore_data));
        var user_email = "test_user@capstone.ca";
        var user_pword = "capstone";


        firebase.auth().signInWithEmailAndPassword(user_email, user_pword).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Error: " + errorCode);
            console.log("Error Message: " + errorMessage);
            // ...
        });

        console.log("Start to restore")
        ref.update(restore_data);
        console.log("End restore");
    });

    beforeEach(function () {

        browser.addMockModule('IonicConfig', function () {
            angular.module('IonicConfig', []).config(function ($ionicConfigProvider) {
                $ionicConfigProvider.scrolling.jsScrolling(false);
            });
        });

        browser.get('http://localhost:' + PORT + '/#/stylist_upload_images/user/JJmxTJiDAAdKkehR7JucOOJb4OZ2');
    });

    it("Stylist deletes photo on database", function (done) {

        browser.manage().timeouts().pageLoadTimeout(40000);

        browser.executeScript("document.querySelector('ion-content').scrollTop = document.querySelector('ion-content').scrollHeight")
            .then(function() {
                expect($$('.item.editimages').isPresent()).toEqual(true);

                browser.executeScript("document.querySelector('.item.editimages:first-child .delete').click()").then(function(){
                    browser.manage().timeouts().implicitlyWait(5000);
                    expect($$('.item.editimages').isPresent()).toEqual(false);

                    done();                    
                });
            })
    });

});