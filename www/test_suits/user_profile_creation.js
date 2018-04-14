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

describe("User Profile Creation", function(){

  var PORT = 8105;

  var username = element(by.model('$ctrl.user.username'));
  var email = element(by.model('$ctrl.user.email'));
  var password = element(by.model('$ctrl.user.password'));
  var re_password = element(by.model('re_pword'));
  var stylist_code = element(by.model('$ctrl.user.stylist_code'));

  var restore_data = "";
  var ref = firebase.database().ref();

  let joc = jasmine.objectContaining;

  var get_firebase_data = function(){
    var ref = firebase.database().ref();

    return ref.once('value').then(function(snap) {
      console.log("made it a callback");
      return snap.val();
    });
  }

  beforeAll(function(){
    console.log("restore_data: " + restore_data);
    var user_email = "test_user@capstone.ca";
    var user_pword = "capstone";

    var ref = firebase.database().ref();

    firebase.auth().signInWithEmailAndPassword(user_email, user_pword).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error: " + errorCode);
      console.log("Error Message: " + errorMessage);
    });

    browser.wait(() =>{
      return get_firebase_data().then((data) =>{
        console.log("Start loading old data");
        restore_data = data;
        console.log("restore_data: " + restore_data);

        console.log(JSON.stringify(data));
        console.log("Finish loading old data");
        stylist_json = {
          "user_profile_creation" : {
            "email":"stylistA@domain.ca",
            "name" : "test_stylist",
            "password" : "123456",
          },
        };

        console.log("Start pushing test data");

        // ref.remove();
        firebase.database().ref().child('stylists').update(stylist_json);

        console.log("Finish pushing test data");
        return restore_data != "";  
      })}, 10000);
  });

  afterAll(function(){
    // console.log("restore_data: " + JSON.stringify(restore_data));
    var user_email = "test_user@capstone.ca";
    var user_pword = "capstone";


    firebase.auth().signInWithEmailAndPassword(user_email, user_pword).catch(function(error) {
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

  beforeEach(function(){
    
    browser.get('http://localhost:'+PORT+'/#/user_register');
  });

  it("Profile registration, success", function(done){
    var new_name = "test_users";
    var new_email = "test_users@domain.com";
    var new_pword = "test_password";
    var exist_stylist_code = "stylistA@domain.ca";

    firebase.auth().signInWithEmailAndPassword(new_email, new_pword)
      .then(function(){
        //Shoud not reach here
        expect("User should not exists").toEqual("User should not exists");
      })
      .catch(function(){
        //User should not exists
        expect("User should not exists").toEqual("User exists");
      });

    username.sendKeys(new_name);
    email.sendKeys(new_email);
    password.sendKeys(new_pword);
    re_password.sendKeys(new_pword);
    stylist_code.sendKeys(exist_stylist_code);
    
    element(by.buttonText('Register')).click();

    browser.wait(function(){
      return browser.getCurrentUrl().then((url) => {
        return url == "http://localhost:"+PORT+"/#/user_main"
      })}, 5000);

    expect(browser.getCurrentUrl()).toEqual("http://localhost:"+PORT+"/#/user_main");

    firebase.auth().signInWithEmailAndPassword(new_email, new_pword)
      .then(function(){
        console.log("User exists");
        expect("User should exists").toEqual("User should exists");
        firebase.auth().onAuthStateChanged(function (u) {
          if (u) {
            var stylistsref = firebase.database().ref("users");
            var stylist = stylistsref.child(u.uid).child('stylist').value();
            console.log("stylists: " + stylist);
            expect(stylist).toEqual(exist_stylist_code);
          };
        });

        firebase.auth().currentUser.delete().then(function(){
          console.log("User deleted");
          expect("User not longer exists").toEqual("User not longer exists");
        }).catch(function(){
          expect("User shoud exists").toEqual("User does not exist");
        });
      })
      .catch(function(){
        //Should not reach here
        expect("User should exists").toEqual("User did not exist");
      });

    done(); 
  });

  it("Profile registration, username already exists", function(done){
    var new_name = "test_users";
    var new_email = "test_users@domain.com";
    var new_pword = "test_password";
    var exist_stylist_code = "stylistA@domain.ca";

    firebase.auth().createUserWithEmailAndPassword(new_email, new_pword).catch(function(error){
      console.log("User already exists");
    });

    username.sendKeys(new_name);
    email.sendKeys(new_email);
    password.sendKeys(new_pword);
    re_password.sendKeys(new_pword);
    stylist_code.sendKeys(exist_stylist_code);
    element(by.cssContainingText('.button', 'Register')).click();

    browser.wait(function(){
      return element(by.binding('errorMsg')).getText().then((text)=>{
        return text == 'Error creating new user, this email may already be in use.'
      })}, 5000);

    var el = element(by.binding('errorMsg'));
    expect(el.getText()).toBe('Error creating new user, this email may already be in use.');

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

  it("Profile registration, stylist does not exist", function(done){
    var new_name = "test_users";
    var new_email = "test_users@domain.com";
    var new_pword = "test_password";
    var not_exist_stylist_code = "stylistB@domain.ca";

    firebase.auth().signInWithEmailAndPassword(new_email, new_pword)
      .then(function(){
        //Shoud not reach here
        expect("User should not exists").toEqual("User should not exists");
      })
      .catch(function(){
        //User should not exists
        expect("User should not exists").toEqual("User exists");
      });

    username.sendKeys(new_name);
    email.sendKeys(new_email);
    password.sendKeys(new_pword);
    re_password.sendKeys(new_pword);
    stylist_code.sendKeys(not_exist_stylist_code);

    element(by.cssContainingText('.button', 'Register')).click();

    browser.wait(function(){
      return element(by.binding('errorMsg')).getText().then((text)=>{
        return text == 'This email is not recognized as a stylist.'
      })}, 5000);

    var el = element(by.binding('errorMsg'));
    expect(el.getText()).toBe('This email is not recognized as a stylist.');
    done(); 
  });
});