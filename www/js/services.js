angular.module('starter.services', [])

  .factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
      var ref = new Firebase("https://buzzmovieionic.firebaseio.com");
      return $firebaseAuth(ref);
    }
  ])

  .factory("UsersRef", [
    function () {
      var ref = new Firebase("https://buzzmovieionic.firebaseio.com/users");
      return ref;
    }
  ])

  .factory("AuthData", [
    function () {
      var ref = new Firebase("https://buzzmovieionic.firebaseio.com");
      var authData = ref.getAuth();
      if (authData) {
        return authData;
      } else {
        return null;
      }
    }
  ])

  .factory("Movie", function () {
    moviedata = {};
    return moviedata;
  })

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
