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

describe("Stylist Profile Creation", function () {

    var PORT = 8105;

    var username = element(by.model('$ctrl.user.username'));
    var email = element(by.model('$ctrl.user.email'));
    var password = element(by.model('$ctrl.user.password'));
    var re_password = element(by.model('re_pword'));

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

                console.log(JSON.stringify(data));
                console.log("Finish loading old data");
                test_json = {
                    "stylists": {
                        "DSzjEvbRcsPD5cnymJ01fZGoIrPddd2": {
                            "email": "test_stylist@domain.ca",
                            "name": "test_stylist",
                            "password": "123456",
                        },
                    },
                    "users": {
                        "JJmxTJiDAAdKkehR7JucOOJb4OZ2": {
                            "email": "test_user@domain.ca",
                            "name": "Test User",
                            "dresslog": {},
                            "recommendeditems": {},
                            "recommendedoutfits": {},
                            "wardrobeitems": {},
                        },
                    },
                };

                console.log("Start pushing test data");

                // ref.remove();
                ref.update(test_json);
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

        browser.get('http://localhost:' + PORT + '/#/stylist_register');
    });

    it("Profile registration, success", function (done) {
        var new_name = "test_stylist";
        var new_email = "test_stylist@domain.com";
        var new_pword = "test_password";

        username.sendKeys(new_name);
        email.sendKeys(new_email);
        password.sendKeys(new_pword);
        re_password.sendKeys(new_pword);
        element(by.buttonText('Register')).click();

        browser.wait(function () {
            return browser.getCurrentUrl().then((url) => {
                return url == "http://localhost:" + PORT + "/#/stylist_main"
            })
        }, 5000);

        expect(browser.getCurrentUrl()).toEqual("http://localhost:" + PORT + "/#/stylist_main");

        console.log("restore_data: " + restore_data);

        firebase.auth().signInWithEmailAndPassword(new_email, new_pword).then(()=> {
          firebase.auth().currentUser.delete().then(function(){
            console.log("User deleted");
            expect("User not long exists").toEqual("User not long exists");
          }).catch(function(){
            expect("User shoud exists").toEqual("User does not exist");
          });  
        });

        done(); 
    });

    // it("Profile registration, username already exists", function(done){
    //     var new_name = "test_stylist";
    //     var new_email = "test_stylist@domain.com";
    //     var new_pword = "test_password";

    //     firebase.auth().createUserWithEmailAndPassword(new_email, new_pword).catch(function(error){
    //       console.log("Stylist already exists");
    //     });

    //     username.sendKeys(new_name);
    //     email.sendKeys(new_email);
    //     password.sendKeys(new_pword);
    //     re_password.sendKeys(new_pword);
    //     element(by.cssContainingText('.button', 'Register')).click();

    //     browser.wait(function(){
    //       return element(by.binding('errorMsg')).getText().then((text)=>{
    //         return text == 'Error creating new user, this email may already be in use.'
    //       })}, 5000);

    //     var el = element(by.binding('errorMsg'));
    //     expect(el.getText()).toBe('Error creating new user, this email may already be in use.');

    //     firebase.auth().signInWithEmailAndPassword(new_email, new_pword).then(()=> {
    //       firebase.auth().currentUser.delete().then(function(){
    //         console.log("User deleted");
    //         expect("User not long exists").toEqual("User not long exists");
    //       }).catch(function(){
    //         expect("User shoud exists").toEqual("User does not exist");
    //       });  
    //     });
        
    //     done(); 
    //   });

    
});