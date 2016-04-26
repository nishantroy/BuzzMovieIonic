angular.module('starter.controllers', ['ionic', 'firebase', 'ui.router', 'ionic.rating'])

  .controller('SearchCtrl',
    function ($scope, $http, Movie, $state, UsersRef, AuthData, $timeout) {

      $scope.data = {};
      $scope.data.username = "";
      $scope.startListening = function () {
        annyang.start();
        if (annyang) {
          var commands = {
            '*val': function (val) {
              $scope.data.moviename = val;
              $scope.$apply();
              annyang.abort();
            }
          };
          annyang.addCommands(commands);
          annyang.debug();
        }
      };
      ref = UsersRef.child(AuthData.uid);
      console.log(AuthData.uid);
      $timeout(function () {
        ref.once("value", function (snapshot) {
          console.log(snapshot.val());
          if (snapshot.exists()) {
            $scope.data.username = snapshot.child("Name").val();
            console.log($scope.data.username);
            $scope.$apply();
          }
        });
      });
      $scope.searchMovie = function () {

        if ($scope.data.moviename == undefined || $scope.data.moviename.trim() == "") {
          swal("No movie name found!", "Please enter a movie name", "warning");
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
                swal("Movie not found!", "Enter the full movie name", "error");
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
    function ($scope, Movie, $state, AuthData, UsersRef, $timeout) {
      // $scope.$on('$ionicView.enter', function () {
      $scope.input = Movie.moviedata;
      console.log($scope.input);
      var authData = AuthData;
      console.log(authData);
      var ref = UsersRef.child(authData.uid).child("Movies").child($scope.input.Title);
      var moviesRef = new Firebase("https://buzzmovieionic.firebaseio.com/movies");
      var alreadyRated = false;
      moviesRef = moviesRef.child($scope.input.Title);
      $scope.rating = {};
      $scope.rating.rate = 0;
      $scope.rating.max = 10;
      $scope.avgRating = 'n/a';
      var oldRating = 0;

      $timeout(function () {
        ref.once("value", function (snapshot) {
          if (snapshot.exists()) {
            alreadyRated = true;
            console.log("Found!");
            $scope.rating.rate = snapshot.child("Rating").val();
            oldRating = $scope.rating.rate;
          }
        });
      });

      $timeout(function () {
        moviesRef.once("value", function (snapshot) {
          if (snapshot.exists()) {
            console.log("Found avg Rating");
            total = snapshot.child("Total").val();
            num = snapshot.child("Users").val();
            avg = total / num;
            avg = Math.round(avg*10)/10;
            console.log(avg);
            $scope.input.avgRating = avg;
          }
        });
      });


      $scope.save = function () {
        console.log($scope.rating.rate);
        if ($scope.rating.rate > 0) {
          ref.update({
            Rating: $scope.rating.rate,
            Image: $scope.input.Poster
          });

          moviesRef.child("Total").transaction(function (current_val) {
            return (current_val || 0) + $scope.rating.rate - oldRating;
          });

          if (!alreadyRated) {
            moviesRef.child("Users").transaction(function (current_val) {
              return (current_val || 0) + 1;
            });
          }


        }
        $state.transitionTo('tab.search');
      };

      $scope.cancel = function () {
        if ($scope.rating.rate > 0) {
        swal({
          title: 'Are you sure?',
          text: "Your rating won't be saved",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes',
          closeOnConfirm: true
        }).then(function (isConfirm) {
          if (isConfirm) {
            $state.transitionTo('tab.search');
          }
        });
      } else {
          $state.transitionTo('tab.search');
        }
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
          swal("Invalid Email!", "Please enter a valid email", "error");
        } else if ($scope.data.password == undefined || $scope.data.password.trim() == ""
          || $scope.data.password.length < 8) {
          swal("Invalid Password!", "Please enter a password at least 8 characters long", "warning");
        } else if ($scope.data.major == undefined) {
          swal("No major selected!", "Please select a major", "warning");
        } else if ($scope.data.name == undefined || $scope.data.name.trim() == "") {
          swal("No name found!", "Please enter your name", "error");
        } else {
          console.log("Email: " + $scope.data.email + " \n Password: " + $scope.data.password);
          $scope.createUser();
        }

      };
    }])

  .controller('LoginCtrl', ["$scope", "Auth", "$state", "$ionicHistory",
    function ($scope, Auth, $state) {
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
          swal("Authentication failed ", error, "error");
        })

      };

      $scope.facebookLogin = function () {
        // var ref = new Firebase("https://buzzmovieionic.firebaseio.com");
        // ref.authWithOAuthPopup("facebook", function(error, authData) {
        //   if (error) {
        //     console.log("Login Failed!", error);
        //   } else {
        //     console.log("Authenticated successfully with payload:", authData);
        //   }
        // }).then(function() {
        //   $timeout(function () {
        //     ref.child("users").child(AuthData.uid).once("value", function (snapshot) {
        //       if (!snapshot.exists()) {
        //         ref.child("users").child(AuthData.uid).set({
        //           Name: AuthData.facebook.displayName
        //         });
        //       }
        //     });
        //   });
        //
        //   $state.transitionTo('tab.search');
        // });
        Auth.$authWithOAuthPopup("facebook", {scope: "email"}).then(function (authData) {
          console.log(authData);
          var ref = new Firebase("https://buzzmovieionic.firebaseio.com/users");
          ref.child(authData.uid).once("value", function (snapshot) {
            if (!snapshot.exists()) {
              ref.child(authData.uid).set({
                Name: authData.facebook.displayName,
                Email: authData.facebook.email,
                Image: authData.facebook.profileImageURL
              })
            }
          });

          $state.transitionTo('tab.search');
        }).catch(function (error) {
          console.log(error);
        });
      };

      $scope.twitterLogin = function () {
        Auth.$authWithOAuthPopup("twitter", {scope: "email"}).then(function (authData) {
          console.log(authData);
          var ref = new Firebase("https://buzzmovieionic.firebaseio.com/users");
          ref.child(authData.uid).once("value", function (snapshot) {
            if (!snapshot.exists()) {
              ref.child(authData.uid).set({
                Name: authData.twitter.displayName,
                Email: authData.twitter.username,
                Image: authData.twitter.profileImageURL
              })
            }
          });
          $state.transitionTo('tab.search');
        }).catch(function (error) {
          console.log(error);
        });


      };

      $scope.githubLogin = function () {
        Auth.$authWithOAuthPopup("github", {scope: "email"}).then(function (authData) {
          console.log(authData);
          var ref = new Firebase("https://buzzmovieionic.firebaseio.com/users");
          ref.child(authData.uid).once("value", function (snapshot) {
            if (!snapshot.exists()) {
              ref.child(authData.uid).set({
                Name: authData.github.displayName,
                Email: authData.github.username,
                Image: authData.github.profileImageURL
              })
            }
          });
          $state.transitionTo('tab.search');
        }).catch(function (error) {
          console.log(error);
        });


      };

      $scope.googleLogin = function () {
        Auth.$authWithOAuthPopup("google", {scope: "email"}).then(function (authData) {
          console.log(authData);
          var ref = new Firebase("https://buzzmovieionic.firebaseio.com/users");
          ref.child(authData.uid).once("value", function (snapshot) {
            if (!snapshot.exists()) {
              ref.child(authData.uid).set({
                Name: authData.google.displayName,
                Email: authData.google.email,
                Image: authData.google.profileImageURL
              })
            }
          });
          $state.transitionTo('tab.search');
        }).catch(function (error) {
          console.log(error);
        });


      };

      $scope.gotoCreateAccount = function () {
        $state.transitionTo('createAccount');
      };


      $scope.checkData = function () {
        if ($scope.data.email == undefined) {
          swal("Invalid Email!", "Please enter a valid email", "error");
        } else if ($scope.data.password == undefined || $scope.data.password.trim() == "") {
          swal("Invalid Password!", "Please enter a password", "error");
        } else {
          console.log("Email: " + $scope.data.email + " \n Password: " + $scope.data.password);
          $scope.loginUser();
        }

      };
    }
  ])

  .controller('RatingsCtrl',
    function ($scope, UsersRef, AuthData, $state, $timeout) {
      $scope.$on("$ionicView.beforeEnter", function () {
        console.log("Entered!");
        $scope.movies = {};
        var ref = UsersRef.child(AuthData.uid).child("Movies");


        $timeout(function () {
          ref.on("value", function (snapshot) {
            if (snapshot.exists()) {
              console.log("Found!");

              $scope.movies = snapshot.val();
              $scope.$apply();
            }

          });
        });

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

  .controller('ProfileCtrl', function ($scope, UsersRef, AuthData, $timeout) {

    // $scope.$on("$ionicView.beforeEnter", function () {
    console.log("Entered!");
    $scope.userInfo = {};
    var ref = UsersRef.child(AuthData.uid);
    $scope.userInfo.image = "img/Buzz.png";


    $timeout(function () {
      ref.on("value", function (snapshot) {
        if (snapshot.exists()) {
          console.log("Found!");

          $scope.userInfo.name = snapshot.child("Name").val();
          $scope.userInfo.major = snapshot.child("Major").val();
          $scope.userInfo.email = snapshot.child("Email").val();
          $scope.$apply();
        }
      });
      ref.child("Image").on("value", function (snapshot) {
        if (snapshot.exists()) {
          console.log("Image found!");
          $scope.userInfo.image = snapshot.val();
          $scope.$apply();
        }
      })
    });

  });


// });
