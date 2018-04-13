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
        test_json = {
          "stylists" : {
            "DSzjEvbRcsPD5cnymJ01fZGoIrPddd2" : {
              "email" : "test_stylist@domain.ca",
              "name" : "test_stylist",
              "password" : "123456",
            },
          },
          "users" : {
            "JJmxTJiDAAdKkehR7JucOOJb4OZ2" : {
              "email" : "test_user@domain.ca",
              "name" : "Test User",
              "dresslog":{},
              "recommendeditems":{},
              "recommendedoutfits":{},
              "wardrobeitems":{},
            },
          },
        };

        console.log("Start pushing test data");

        // ref.remove();
        ref.update(test_json);
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
    username.sendKeys('test_users');
    email.sendKeys('test_users@domain.com');
    password.sendKeys('test_password');
    re_password.sendKeys('test_password');
    stylist_code.sendKeys('kalburgi@ualberta.ca');
    
    element(by.buttonText('Register')).click();

    browser.wait(function(){
      return browser.getCurrentUrl().then((url) => {
        return url == "http://localhost:"+PORT+"/#/user_main"
      })}, 5000);

    expect(browser.getCurrentUrl()).toEqual("http://localhost:"+PORT+"/#/user_main");

    console.log("restore_data: " + restore_data);
    done(); 
  });

  it("Profile registration, username already exists", function(){
    username.sendKeys('aabbb');
    email.sendKeys('abc@domain.com');
    password.sendKeys('123456');
    re_password.sendKeys('123456');
    stylist_code.sendKeys('kalburgi@ualberta.ca');

    element(by.cssContainingText('.button', 'Register')).click();

    browser.wait(function(){
      return element(by.binding('errorMsg')).getText().then((text)=>{
        return text == 'Error creating new user, this email may already be in use.'
      })}, 5000);

    var el = element(by.binding('errorMsg'));
    expect(el.getText()).toBe('Error creating new user, this email may already be in use.');

    // restore_data(restore_data);
    done(); 
  });

  it("Profile registration, stylist does not exist", function(){
    username.sendKeys('test_users');
    email.sendKeys('test_users@domain.com');
    password.sendKeys('test_password');
    re_password.sendKeys('test_password');
    stylist_code.sendKeys('stylist_exists');


    element(by.cssContainingText('.button', 'Register')).click();

    browser.wait(function(){
      return element(by.binding('errorMsg')).getText().then((text)=>{
        return text == 'Error creating new user, this email may already be in use.'
      })}, 5000);

    var el = element(by.binding('errorMsg'));
    expect(el.getText()).toBe('This email is not recognized as a stylist.');
    done(); 
  });
});