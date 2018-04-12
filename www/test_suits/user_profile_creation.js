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

  var PORT = 8104;

  var username = element(by.model('$ctrl.user.username'));
  var email = element(by.model('$ctrl.user.email'));
  var password = element(by.model('$ctrl.user.password'));
  var re_password = element(by.model('re_pword'));
  var stylist_code = element(by.model('$ctrl.user.stylist_code'));

  let joc = jasmine.objectContaining;

  var get_firebase_data = function(){
    var ref = firebase.database().ref();

    return ref.once('value').then(function(snap) {
      console.log("made it a callback");
      return snap.val();
    });
  }

  beforeEach(function(){
    browser.get('http://localhost:'+PORT+'/#/user_register')

    var ref = firebase.database().ref();

    stylist_json = {
      "stylists" : {
        "DSzjEvbRcsPD5cnymJ01fZGoIrP2" : {
          "email" : "test_stylist@domain.ca",
          "name" : "test_stylist",
          "password" : "123456",
        },
      },
    };

    user_json = {
      "stylists" : {
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

    var data = get_firebase_data();
    ref.update(null);
    
    // console.log("SSS: " + data);

  });

  it("Profile registration, success", function(done){
    username.sendKeys('test_users');
    email.sendKeys('test_users@domain.com');
    password.sendKeys('test_password');
    re_password.sendKeys('test_password');
    stylist_code.sendKeys('kalburgi@ualberta.ca');
    
    element(by.buttonText('Register')).click();

    // element(by.cssContainingText('.button', "Register")).click();

    // get_firebase_data().then(function(data){
    //   expect(data).toEqual(joc({'users':joc()}));
    //   done();
    // });

    browser.wait(function(){
      return browser.getCurrentUrl().then((url) => {
        return url == "http://localhost:"+PORT+"/#/user_main"
      })}, 5000);

    expect(browser.getCurrentUrl()).toEqual("http://localhost:"+PORT+"/#/user_main");
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
  });
});