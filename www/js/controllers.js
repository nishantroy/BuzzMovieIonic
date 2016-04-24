angular.module('starter.controllers', ['ionic', 'firebase', 'ui.router'])

.controller('DashCtrl', function($scope) {})

  .controller('CreateAccountCtrl', ["$scope", "Auth", "$state", "$ionicHistory",
    function ($scope, Auth, $state, $ionicHistory) {
      $scope.data = {};

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
          alert("Pleae enter a password at least 8 characters long!")
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
        }).then(function(authData) {
          console.log("Logged in as: " + authData.uid + "\n");
          $state.transitionTo('tab.dash');
        }).catch(function(error) {
          console.log("Authentication failed: " + error + "\n");
        })

      };

      $scope.gotoCreateAccount = function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.transitionTo('createAccount');
      };


      $scope.checkData = function () {
        if ($scope.data.email == undefined) {
          alert("Invalid Email!")
        } else if ($scope.data.password == undefined || $scope.data.password.trim() == ""
          || $scope.data.password.length < 8) {
          alert("Please enter a password at least 8 characters long!")
        } else {
          console.log("Email: " + $scope.data.email + " \n Password: " + $scope.data.password);
          $scope.loginUser();
        }

      };
    }
    ])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
