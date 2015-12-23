/* globals YT, fetch, YT2gether, location */

window.YT2gether = {
  event: 'postCSS',
  startAt: null
};

if (location.search.length) {
  var _search = location.search.substr(1);

  var _uq = {};
  _search.split(/&/).forEach((i) => {
    _uq[i.split(/=/)[0]] = i.split(/=/)[1] || '';
  });

  YT2gether.event = _uq.event;
  YT2gether.startAt = _uq.startAt;

  console.log(new Date(YT2gether.startAt));
}

var updateState = function () {
  fetch('https://api.github.com/repos/f2etw/TubeTogether/issues?labels=living').then(function (response) {
    return response.json();
  })
  .then(function (posts) {
    console.log(posts);
  })
  .catch(function (content) {
    return 'GG';
  });
};

var API_KEY = 'AIzaSyDyZ231vqsztOc_f2rKwyedUOY9eEnq2lU';
var YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

var playlistId = {
  '911': 'PLOSNzbDNEDer0LgODrJzpBgKS90RpVjwb',
  'postCSS': 'PLLnpHn493BHFvjZzyYrQP0RTsG-Al7j9m'
};

var DURATION_UNIT = {
  'H': 60 * 60,
  'M': 60,
  'S': 1
};

fetch(`${YOUTUBE_API_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId[YT2gether.event]}&key=${API_KEY}`)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    var listString = data.items.map(function (item) {
      return item.contentDetails.videoId;
    }).join();

    fetch(`${YOUTUBE_API_URL}/videos?part=contentDetails&maxResults=50&id=${listString}&key=${API_KEY}`)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var durations = data.items.map(function (item) {
          return item.contentDetails.duration.match(/\d+\w/gi).reduce(function (a, b, c) {
            var xx = [a, b].map(function (i) {
              var _i = i.match(/(\d+)(\w)/);
              return _i[1] * DURATION_UNIT[_i[2]];
            });
            return xx[0] + xx[1];
          });
        });

        var _durationsTempSum = 0;
        var durationsStack = durations.map(function (time) {
          _durationsTempSum += time;
          return _durationsTempSum;
        });

        var totalDuration = durationsStack.slice(-1)[0];

        var timer = {};
        timer.now = 1000;

        // if section was end
        if (totalDuration < timer.now) {
          return;
        }

        for (var i = durationsStack.length - 1; i >= 0; i--) {
          if (timer.now > durationsStack[i]) {
            timer.startTime = timer.now - durationsStack[i];
            console.log(i, timer.startTime);
            break;
          }
        }

        initPlayer({
          list: playlistId[YT2gether.event],
          startTime: timer.startTime,
          index: i
        });
      });
  });

var initPlayer = function (obj) {
  YT2gether.player = new YT.Player('player', {
    playerVars: {
      listType: 'playlist',
      list: obj.list,
      // autoplay: 1,
      start: obj.startTime,
      state: 1,
      index: obj.index
    }
  });
};

// init chatroom iframe
(function () {
  var chatIframe = document.createElement('iframe');
  document.body.appendChild(chatIframe);
  chatIframe.src = 'https://gitter.im/f2etw/TubeTogether/~chat';
})();

// init youtube iframe
(function () {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
// var player;
// function onYouTubeIframeAPIReady () {
//   console.log('wwwwwwwwwwwww');
//   // player = new YT.Player('player', {
//   //   playerVars: {
//   //     listType: 'playlist',
//   //     list: 'PLLnpHn493BHFvjZzyYrQP0RTsG-Al7j9m',
//   //     index: 0
//   //   },
//   //   events: {
//   //     'onReady': onPlayerReady,
//   //     'onStateChange': onPlayerStateChange
//   //   }
//   // });
// }

// 4. The API will call this function when the video player is ready.
// function onPlayerReady (event, time) {
// }

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.

// var done = false;
// function onPlayerStateChange (event) {
//   console.log('onPlayerStateChange', 123);
//   if (event.data === YT.PlayerState.PLAYING && !done) {
//     // setTimeout(stopVideo, 1000);
//     // done = true;
//   }
// }
// function stopVideo () {
//   player.stopVideo();
// }
