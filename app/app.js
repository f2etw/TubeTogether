/* globals YT, fetch, YT2gether, location */

window.YT2gether = {
  stopInit: false,
  event: 'postCSS',
  startAt: null
};

YT2gether.countdownTimer = () => {
  let _deltaTime = new Date(YT2gether.startAt) - new Date();
  let countdownTimer;
  let calcRemainingTime = () => {
    let _timeBase;

    _deltaTime = (new Date(YT2gether.startAt) - new Date()) / 1e3;

    clearTimeout(YT2gether.refeshTimer);
    countdownTimer.roughTime = null;

    countdownTimer.time = countdownTimer.timeBase.map((base, idx) => {
      return _deltaTime / base % countdownTimer.timeLimitation[idx] | 0;
    });

    countdownTimer.time.forEach((t, i) => {
      if (!countdownTimer.roughTime && t) {
        _timeBase = countdownTimer.timeBase[i];
        countdownTimer.roughTime = t + countdownTimer.timeUnit[i];
      }
    });

    document.documentElement.setAttribute('data-countdown', 'Start after ~' + countdownTimer.roughTime);

    if (_deltaTime < 60 * 1) {
      YT2gether.refeshTimer = setTimeout(() => {
        document.documentElement.setAttribute('data-countdown', 'Start!');
        YT2gether.initYoutube();
      }, _deltaTime * 1e3);
    } else {
      YT2gether.refeshTimer = setTimeout(() => {
        calcRemainingTime();
      }, _timeBase * 200);
    }
  };

  // not begun yet
  if (_deltaTime > 0) {
    countdownTimer = {
      timeUnit: 'dhms',
      timeBase: [60 * 60 * 24, 60 * 60, 60, 1],
      timeLimitation: [3650, 24, 60, 60]
    };

    calcRemainingTime();
  }
};

// get event info
if (location.search.length) {
  let _search = location.search.substr(1);

  let _uq = {};
  _search.split(/&/).forEach((i) => {
    _uq[i.split(/=/)[0]] = i.split(/=/)[1] || '';
  });

  YT2gether.startAt = _uq.startAt;
  YT2gether.listId = _uq.list;
  YT2gether.chatroom = _uq.chatroom || 'https://gitter.im/f2etw/TubeTogether/~chat';

  YT2gether.countdownTimer();
} else {
  YT2gether.stopInit = true;

  // update info from github issue
  fetch('https://api.github.com/repos/f2etw/TubeTogether/issues?labels=living&state=open').then((response) => {
    return response.json();
  })
  .then((posts) => {
    if (/^\?/.test(posts[0].body)) {
      location.search = posts[0].body.match(/^\?.+/)[0];
    }
  })
  .catch((content) => {
    if (window.confirm('GG 惹，請問要去 GitHub issue 確認一下有沒有新活動嗎？')) {
      location.href = 'https://github.com/f2etw/TubeTogether/labels/living';
    }
    return 'GG';
  });
}

const API_KEY = 'AIzaSyDyZ231vqsztOc_f2rKwyedUOY9eEnq2lU';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

const DURATION_UNIT = {
  'H': 60 * 60,
  'M': 60,
  'S': 1
};

YT2gether.initChatroom = () => {
  if (YT2gether.stopInit || YT2gether.chatroom === 'none') { return; }

  let chatIframe = document.createElement('iframe');
  chatIframe.src = YT2gether.chatroom;
  document.body.appendChild(chatIframe);
};

YT2gether.initYoutube = () => {
  if (YT2gether.stopInit) { return; }

  fetch(`${YOUTUBE_API_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${YT2gether.listId}&key=${API_KEY}`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data.items.map((item) => {
        return item.contentDetails.videoId;
      }).join();
    })
    .then((listString) => {
      return fetch(`${YOUTUBE_API_URL}/videos?part=contentDetails&maxResults=50&id=${listString}&key=${API_KEY}`)
        .then((res) => {
          return res.json();
        });
    })
    .then((data) => {
      let durations = data.items.map((item) => {
        return item.contentDetails.duration.match(/\d+\w/gi).reduce((a, b, c) => {
          let xx = [a, b].map((i) => {
            let _i = i.match(/(\d+)(\w)/);
            return _i[1] * DURATION_UNIT[_i[2]];
          });
          return xx[0] + xx[1];
        });
      });

      let _durationsTempSum = 0;
      let durationsStack = durations.map((time) => {
        _durationsTempSum += time;
        return _durationsTempSum;
      });

      let totalDuration = durationsStack.slice(-1)[0];

      let timer = {};
      timer.deltaTime = (new Date() - new Date(YT2gether.startAt)) / 1e3 | 0;

      // if event was over or not yet begun
      if (timer.deltaTime < 0 || totalDuration < timer.deltaTime) {
        return;
      }

      let i = durationsStack.length - 1;
      for (; i >= 0; i--) {
        if (timer.deltaTime > durationsStack[i]) {
          timer.startTime = timer.deltaTime - durationsStack[i];
          break;
        }
      }

      YT2gether.player = new YT.Player('player', {
        playerVars: {
          listType: 'playlist',
          list: YT2gether.listId,
          autoplay: 1,
          start: timer.startTime,
          state: 1,
          index: i
        }
      });
    });
};

YT2gether.initChatroom();
YT2gether.initYoutube();
