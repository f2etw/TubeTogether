/* globals YT, fetch, YT2gether, location */

window.YT2gether = {
  event: 'postCSS',
  startAt: null
};

// get event info
if (location.search.length) {
  var _search = location.search.substr(1);

  var _uq = {};
  _search.split(/&/).forEach((i) => {
    _uq[i.split(/=/)[0]] = i.split(/=/)[1] || '';
  });

  YT2gether.event = _uq.event;
  YT2gether.startAt = _uq.startAt;
  YT2gether.listId = _uq.list;
} else {
  // update info from github issue
  fetch('https://api.github.com/repos/f2etw/TubeTogether/issues?labels=living&state=open').then(function (response) {
    return response.json();
  })
  .then(function (posts) {
    if (/^\?/.test(posts[0].body)) {
      location.search = posts[0].body.match(/^\?.+/)[0];
    }
  })
  .catch(function (content) {
    console.log(123);
    if (window.confirm('GG 惹，請問要去 GitHub issue 確認一下有沒有新活動嗎？')) {
      location.href = 'https://github.com/f2etw/TubeTogether/labels/living';
    }
    return 'GG';
  });
}

var API_KEY = 'AIzaSyDyZ231vqsztOc_f2rKwyedUOY9eEnq2lU';
var YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

var DURATION_UNIT = {
  'H': 60 * 60,
  'M': 60,
  'S': 1
};

fetch(`${YOUTUBE_API_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${YT2gether.listId}&key=${API_KEY}`)
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
        timer.now = (new Date() - new Date(YT2gether.startAt)) / 1e3 | 0;

        // if section was end
        if (timer.now < 0 || totalDuration < timer.now) {
          return;
        }

        for (var i = durationsStack.length - 1; i >= 0; i--) {
          if (timer.now > durationsStack[i]) {
            timer.startTime = timer.now - durationsStack[i];
            break;
          }
        }

        initPlayer({
          list: YT2gether.listId,
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
      autoplay: 1,
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
