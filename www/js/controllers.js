angular.module('starter.controllers', ['ionic', 'firebase', 'ui.router', 'ionic.rating'])

  .controller('SearchCtrl',
    function ($scope, $http, Movie, $state, UsersRef, AuthData, $timeout, $ionicLoading) {

      $scope.data = {};
      $scope.data.username = "";
      ref = UsersRef.child(AuthData.uid);
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      $timeout(function () {
        $ionicLoading.hide();
        ref.once("value", function (snapshot) {
          if (snapshot.exists()) {
            $scope.data.username = snapshot.child("Name").val();
            console.log($scope.data.username);
          }
        });
      });
      $scope.searchMovie = function () {

        if ($scope.data.moviename == undefined || $scope.data.moviename.trim() == "") {
          alert("Please enter a movie name");
        } else {
          var url1 = "https://www.omdbapi.com/?t=";
          var url2 = "&y=&plot=full&r=json";

          var url = url1 + $scope.data.moviename + url2;
          var flag = false;

          $http.get(url)
            .success(function (data) {
              // console.log(data);
              Movie.moviedata = data;
              if (data.Response == 'True') {
                flag = true;
              } else {
                console.log("Movie not found!");
                alert("Movie not found!");
              }
            })
            .error(function (data) {
              console.log("ERROR");
            })
            .finally(function () {
              if (flag) {
                $state.transitionTo('movieDetails');
              }
            });
        }
      }
    })

  .controller('MovieCtrl',
    function ($scope, Movie, $state, AuthData, UsersRef, $timeout, $ionicLoading) {
      // $scope.$on('$ionicView.enter', function () {
      $scope.input = Movie.moviedata;
      console.log($scope.input);
      var authData = AuthData;
      console.log(authData);
      var ref = UsersRef.child(authData.uid).child("Movies").child($scope.input.Title);

      $scope.rating = {};
      $scope.rating.rate = 0;
      $scope.rating.max = 10;
      $ionicLoading.show({
        template: '<ion-spinner class="larger"></ion-spinner>',
        showBackdrop: false,
        animation: 'fade-in',
        maxWidth: 200,
        showDelay: 0
      });
      $timeout(function () {
        $ionicLoading.hide();
        ref.once("value", function (snapshot) {
          if (snapshot.exists()) {
            console.log("Found!");
            $scope.rating.rate = snapshot.child("Rating").val();
          }
        });
      }, 1000);


      $scope.save = function () {
        console.log($scope.rating.rate);
        if ($scope.rating.rate > 0) {
          ref.update({
            Rating: $scope.rating.rate,
            Image: $scope.input.Poster
          });
        }
        $state.transitionTo('tab.search');
      };

      $scope.cancel = function () {
        $state.transitionTo('tab.search');
      };

    })

  .controller('CreateAccountCtrl', ["$scope", "Auth", "UsersRef", "$state", "$ionicHistory",
    function ($scope, Auth, UsersRef, $state, $ionicHistory) {
      $scope.data = {};
      var ref = UsersRef;

      $scope.createUser = function () {
        $scope.message = null;
        $scope.error = null;

        $ionicHistory.nextViewOptions({
          disableBack: true
        });

        Auth.$createUser({
          email: $scope.data.email,
          password: $scope.data.password
        }).then(function (userData) {
          $scope.message = "User created with uid: " + userData.uid;
          var user = {email: $scope.data.email};
          var obj = {};
          obj[userData.uid] = user;
          console.log("Message: " + $scope.message + "\n");
          ref.child(userData.uid).set({
            Name: $scope.data.name,
            Major: $scope.data.major,
            Email: $scope.data.email
          });
          $state.transitionTo('login');
        }).catch(function (error) {
          $scope.error = error;
          console.log("Error: " + $scope.error + "\n");
        });

      };


      $scope.checkData = function () {
        if ($scope.data.email == undefined) {
          alert("Invalid Email!")
        } else if ($scope.data.password == undefined || $scope.data.password.trim() == ""
          || $scope.data.password.length < 8) {
          alert("Please enter a password at least 8 characters long!")
        } else if ($scope.data.major == undefined) {
          alert("Please select a major");
        } else if ($scope.data.name == undefined || $scope.data.name.trim() == "") {
          alert("Please enter your name")
        } else {
          console.log("Email: " + $scope.data.email + " \n Password: " + $scope.data.password);
          $scope.createUser();
        }

      };
    }])

  .controller('LoginCtrl', ["$scope", "Auth", "$state", "$ionicHistory",
    function ($scope, Auth, $state, $ionicHistory) {
      $scope.data = {};

      $scope.loginUser = function () {
        $scope.message = null;
        $scope.error = null;


        Auth.$authWithPassword({
          email: $scope.data.email,
          password: $scope.data.password
        }).then(function (authData) {
          console.log("Logged in as: " + authData.uid + "\n");
          $state.transitionTo('tab.search');
        }).catch(function (error) {
          console.log("Authentication failed: " + error + "\n");
        })

      };

      $scope.gotoCreateAccount = function () {
        $state.transitionTo('createAccount');
      };


      $scope.checkData = function () {
        if ($scope.data.email == undefined) {
          alert("Invalid Email!")
        } else if ($scope.data.password == undefined || $scope.data.password.trim() == "") {
          alert("Please enter a password !")
        } else {
          console.log("Email: " + $scope.data.email + " \n Password: " + $scope.data.password);
          $scope.loginUser();
        }

      };
    }
  ])

  .controller('RatingsCtrl',
    function ($scope, UsersRef, AuthData, $state, $timeout, $ionicLoading) {
      $scope.$on('$ionicView.enter', function () {
        $scope.movies = {};
        var ref = UsersRef.child(AuthData.uid).child("Movies");
        $ionicLoading.show({
          template: '<ion-spinner icon="ripple"></ion-spinner>',
          showBackdrop: false,
          animation: 'fade-in',
          maxWidth: 200,
          showDelay: 0
        });

        $timeout(function () {
          ref.on("value", function (snapshot) {
            if (snapshot.exists()) {
              console.log("Found!");

              $scope.movies = snapshot.val();
            }

          });
          $ionicLoading.hide();
        }, 1000);

      });

      $scope.remove = function (movie) {
        var ref = UsersRef.child(AuthData.uid).child("Movies");
        ref.child(movie).remove();

        ref.on("value", function (snapshot) {
          if (snapshot.exists()) {
            console.log("Found!");
          }

        });
        $state.go($state.current, {}, {reload: true});
      }
    }
  )

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
