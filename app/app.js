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

YT2gether.generator = () => {
  let dialog = {
    el: {},
    data: {
      base: location.origin + location.pathname
    }
  };

  let patterns = {
    YMDTHM: /^\d{4}(-\d{2}){2}T\d{2}:\d{2}/,
    THMS: /T\d{2}:\d{2}:\d{2}$/
  };

  dialog.el.form = document.getElementsByClassName('dialog')[0];
  [dialog.el.time, dialog.el.listid, dialog.el.chatroom] = [].slice.call(dialog.el.form.getElementsByTagName('input'));
  dialog.el.resultLink = dialog.el.form.querySelector('.result a');
  [dialog.el.shareBtnFB, dialog.el.shareBtnTwitter] = [].slice.call(dialog.el.form.querySelectorAll('.sharebtn'));

  dialog.data.urlTpl = {
    fb: dialog.el.shareBtnFB.getAttribute('data-url'),
    tw: dialog.el.shareBtnTwitter.getAttribute('data-url')
  };

  dialog.updateLink = () => {
    if (!dialog.el.form.checkValidity()) {
      console.log('form checkValidity false!');
      return;
    }

    // check time format
    let _time = dialog.el.time.value;
    if (patterns.YMDTHM.test(_time)) {
      dialog.data.time = _time += patterns.THMS.test(_time) ? '+08:00' : ':00+08:00';
    } else {
      // alert('false time value');
    }

    dialog.data.listid = dialog.el.listid.value;
    dialog.data.chatroom = dialog.el.chatroom.value === '' ? '' : '&chatroom=' + dialog.el.chatroom.value;

    let url = dialog.data.base + `?startAt=${dialog.data.time}&list=${dialog.data.listid}${dialog.data.chatroom}`;

    dialog.el.resultLink.innerHTML = url;
    dialog.el.resultLink.href = url;
    dialog.el.shareBtnFB.href = dialog.data.urlTpl.fb.replace('${url}', encodeURI(url));
    dialog.el.shareBtnTwitter.href = dialog.data.urlTpl.tw.replace('${url}', encodeURIComponent(url)).replace('${text}', dialog.data.time);

  };

  // init now time(GMT+8) format style
  let now = new Date();
  dialog.el.time.value = new Date(now - now.getTimezoneOffset() * 6e4).toISOString().split('.')[0];

  dialog.updateLink();
  dialog.el.form.addEventListener('input', dialog.updateLink);
  dialog.el.form.style.display = 'block';
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
  YT2gether.new = (_uq.new === '');

  YT2gether.chatroom = _uq.chatroom || 'https://gitter.im/f2etw/TubeTogether/~chat';

  if (YT2gether.new) {
    YT2gether.stopInit = true;
    YT2gether.generator();
  } else if (!YT2gether.startAt || !YT2gether.listId) {
    YT2gether.stopInit = true;
    location.href = location.origin + location.pathname;
  } else {
    YT2gether.countdownTimer();
  }
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

  let getYTduration = (timeString) => {
    return timeString.match(/\d+\w/gi).map((dura) => {
      let [, time, unit] = dura.match(/(\d+)(\w)/);
      return time * DURATION_UNIT[unit];
    })
    .reduce((a, b) => {
      return a + b;
    })
  };
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
        return getYTduration(item.contentDetails.duration);
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
