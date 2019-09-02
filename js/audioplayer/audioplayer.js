/**
 * オーディオプレーヤー使用方法（v1.3）
 * ==============================
 * 
 * 
 * １．プレーヤーを導入するHTMLページに、次のタグを設置します。
 * 　　audioplayerフォルダの配置に従って、srcの中を書き換えます。
 * 
 * <script id="audioplayer_script"
 *         src="audioplayer/audioplayer.js"></script>
 * 
 * 
 * ２．プレーヤーを起動させるスイッチ（buttonタグ、Aタグ、imgタグなど）に次の要素を加え
 *     ます。
 * 
 * 【要素一覧】
 * class="ap_music"：クラス名（起動スイッチ専用）
 * id="ap_autoplay"：ID（自動起動専用）
 * 
 * data-music：音楽ファイル
 * data-title：曲名
 * data-album：アルバム名
 * data-artist：アーティスト名
 * data-image：プレーヤーに表示させる画像
 * data-state：プレーヤー起動時一時停止
 * onclick：Aタグのページ移動停止用
 * 
 * 【Aタグを使う場合】
 * class="ap_music"
 * data-music="sample.mp3"
 * data-title="SAMPLE TITLE"
 * data-album="SAMPLE ALBUM"
 * data-artist="SAMPLE ARTIST"
 * data-image="sample.png"
 * data-state="pause"
 * onclick="return false;"
 * 
 * （使用例）
 * <a class="ap_music" href="sample.mp3"
 *     data-title="SAMPLE TITLE"
 *     data-artist="SAMPLE ARTIST"
 *     data-image="sample.png"
 *     onclick="return false;"><img src="sample.png"/></a>
 * 
 * 【buttonタグやimgタグを使う場合】
 * class="ap_music"
 * data-music="sample.mp3"
 * data-title="SAMPLE TITLE"
 * data-album="SAMPLE ALBUM"
 * data-artist="SAMPLE ARTIST"
 * data-image="sample.png"
 * data-state="pause"
 * 
 * （使用例）
 * <button class="ap_music"
 *     data-music="dir/sample.mo3"
 *     data-title="SAMPLE TITLE"
 *     data-artist="SAMPLE ARTIST"
 *     data-image="sample.png">PLAY</button>
 * 
 * 【自動起動】
 * id="ap_autoplay"
 * data-music="sample.mp3"
 * data-title="SAMPLE TITLE"
 * data-album="SAMPLE ALBUM"
 * data-artist="SAMPLE ARTIST"
 * data-image="sample.png"
 * data-state="pause"
 * 
 * 自動起動用にdivタグなどを1つ設け、</body>の直前に設置します。
 * 
 * （使用例１：自動再生）
 * <div id="ap_autoplay"
 *     data-music="sample.mp3"
 *     data-title="SAMPLE TITLE"
 *     data-artist="SAMPLE ARTIST"
 *     data-image="sample.png"
 *     style="display: none;" />
 * 
 * （使用例２：停止状態で自動再生）
 * <div id="ap_autoplay"
 *     data-music="sample.mp3"
 *     data-title="SAMPLE TITLE"
 *     data-artist="SAMPLE ARTIST"
 *     data-image="sample.png"
 *     data-state="pause"
 *     style="display: none;" />
 * 
 * ３．動作テストをしましょう。
 * 
 * 
 * サポート
 * ========
 * CANADOH
 * http://www.canadoh.jp/
 */

window.addEventListener('load', function(event){
  // オーディオプレーヤーHTML出力
  let myScript = document.getElementById('audioplayer_script');
  let myScriptDir = myScript.src.substr(
      0,
      myScript.src.lastIndexOf('/'));
  setAudioHTML();
  
  // 変数
  let playButton = document.getElementById('play');
  let prevButton = document.getElementById('audioplayer-prev');
  let nextButton = document.getElementById('audioplayer-next');
  let pauseButton = document.getElementById('audioplayer-pause');
  let audio = new Audio();
  let audioplayer = document.getElementById('audioplayer');
  //20190623追記
  let audioSecTime = document.getElementById('audioplayer-time');
  let audioMinTime = document.getElementById('audioplayer-totaltime');
  let border = document.getElementById('border');
  //20190825追記
  let borderCircle = document.getElementById('audioplayer-circle');
  let borderSpace = document.getElementById('audioplayer-border-maxspace');
  let autoplay = document.querySelector('#ap_autoplay');

  
  let playing = ''; // 再生中ファイル
  let pause = false; // 一時停止状態
  let intvId; // インターバルID
  //20190825追記
  let desiredTime = 0; // 再生希望時間
  let borderMouseDown = false; // 進捗棒上でのマウスダウン判定
  let playback = false; // マウスアップ時の再生スイッチ
  
  // 音楽ファイルタグ取得
  let musics = document.getElementsByClassName('ap_music');
  
  // 音楽ファイル起動用イベントリスナー
  for (let i = 0; i < musics.length; i++) {
    musics[i].addEventListener('click', function(event){
      audioPlayer(musics[i]);
    });
  }

  // ボタン動作群
  prevButton.onclick = function() {
    audio.currentTime = audio.currentTime - 15;
    longBorder();
  };

  nextButton.onclick = function() {
    audio.currentTime = audio.currentTime + 15;
    longBorder();
  };

  pauseButton.onclick = function() {
    if (pause || audio.paused) {
      audio.play();
      //~ pauseButton.innerText = 'PLAY';
    } else {
      audio.pause();
      //~ pauseButton.innerText = 'PAUSE';
    }
  };

  // イベントリスナー群
  audio.addEventListener('canplaythrough', function(e){
    playing = audio.src;
    console.log('canplay');
  });

  audio.addEventListener('play', function(e){
    console.log('play');
    if (intvId) {
      clearInterval(intvId);
      intvId = null;
    }
    intvId = setInterval(function(){
      longBorder();
    }, 100);
    pauseButton.querySelector('img').src = myScriptDir + '/pause.png';
    pause = false;
  });

  audio.addEventListener('pause', function(e){
    console.log('pause - ' + intvId);
    if (intvId) {
      clearInterval(intvId);
      intvId = null;
    }
    pauseButton.querySelector('img').src = myScriptDir + '/play.png';
    pause = true;
  });

  audio.addEventListener('ended', function(e){
    if (intvId) {
      clearInterval(intvId);
      intvId = null;
    }
    pause = true;
  });

  borderSpace.addEventListener('mousedown', function(e){
    desiredTime = audio.duration * e.offsetX / borderSpace.clientWidth;
    borderMouseDown = true;
    
    console.log('position: ' + e.offsetX + ', ' + e.offsetY);
    console.log('element width: ' + borderSpace.clientWidth);
    console.log('time: ' + desiredTime);
    
    if (pause) {
      playback = false;
    } else {
      playback = true;
      audio.pause();
    }
    
    audio.currentTime = desiredTime;
    
    longBorder();
    put_current_time();
  }, false);

  window.addEventListener('mouseup', function(e){
    if (borderMouseDown) {
      borderMouseDown = false;
      
      if (playback) audio.play();
    }
  }, false);

  window.addEventListener('mousemove', function(e){
    let x = 0;
    
    if (borderMouseDown) {
      x = e.clientX - borderSpace.offsetLeft;
      
      if (x < 0) x = 0;
      else if(x > borderSpace.clientWidth) x = borderSpace.clientWidth;
      
      desiredTime = audio.duration * x / borderSpace.clientWidth;
      audio.currentTime = desiredTime;
      
      longBorder();
      put_current_time();
    }
  }, false);

  // モバイル専用イベント
  borderCircle.addEventListener('touchmove', function(e){
    let x = 0;
    let touch = e.touches[0];
    
    x = touch.clientX - borderSpace.offsetLeft;
    
    if (x < 0) x = 0;
    else if(x > borderSpace.clientWidth) x = borderSpace.clientWidth;
    
    desiredTime = audio.duration * x / borderSpace.clientWidth;
    audio.currentTime = desiredTime;
    
    longBorder();
    put_current_time();
  }, false);

  // 再生時間を取得する
  audio.addEventListener('timeupdate',function(){
    var sec = '0' + Math.floor(audio.currentTime % 60); //秒数
    var min = '0' + Math.floor(audio.currentTime / 60); //分数
    
    sec = sec.substr(sec.length-2, 2);
    min = min.substr(min.length-2, 2);
    var totalSec = '0' + Math.floor(audio.duration % 60); // 秒数
    var totalMin = '0' + Math.floor(audio.duration / 60); // 分数
    totalSec = totalSec.substr(totalSec.length-2, 2);
    totalMin = totalMin.substr(totalMin.length-2, 2);
    audioSecTime.innerHTML = min+":"+sec;
    audioMinTime.innerHTML = totalMin+':'+totalSec; 
  })

  // 画面幅伸縮時処理
  window.addEventListener('resize', longBorder, false);
  
  // 進捗棒の長さ計算とポジションマークの位置
  function longBorder() {
    // 進捗棒
    border.style.width = 100 / audio.duration * audio.currentTime + '%';
    // ポジションマーク
    borderCircle.style.marginLeft = -5 + borderSpace.clientWidth *
        audio.currentTime / audio.duration + 'px';
    //~ console.log('The line gets longer...');
  }
  
  // 自動起動
  if (autoplay) audioPlayer(autoplay);
  
  /**
   * Audio Player
   * 
   * elm：要素（必須）
   * filepath：音楽ファイルのパス（半必須）
   * autoplay：自動再生の可否（省略可）
   * 　　pause　一時停止で開始
   * 　　省略　　再生で開始
   */
  function audioPlayer(elm, filepath) {
    let file = '';
    let imgfile = '';
    let info = {
      'music' : '',
      'title' : '',
      'album' : '',
      'artist' : '',
      'image' : '',
      'state' : '',
    };
    
    // 情報取得
    if (elm.getAttribute('data-music')) info['music'] =
        elm.getAttribute('data-music');
    if (elm.getAttribute('data-title')) info['title'] =
        elm.getAttribute('data-title');
    if (elm.getAttribute('data-album')) info['album'] =
        elm.getAttribute('data-album');
    if (elm.getAttribute('data-artist')) info['artist'] =
        elm.getAttribute('data-artist');
    if (elm.getAttribute('data-image')) imgfile = info['image'] =
        elm.getAttribute('data-image');
    if (elm.getAttribute('data-state')) autoplay = info['state'] =
        elm.getAttribute('data-state');
    
    // 属性hrefがなかったらfilepathを代入
    if (elm.href) file = elm.href;
    else if (filepath) file = filepath;
    else if (info['music']) file = info['music'];
    else console.log('ERROR: not found audio file.')
    
    console.log(file);
    
    // 情報表示
    if (document.getElementById('audioplayer-title')) {
      document.getElementById('audioplayer-title').innerText =
          info['title'];
    }
    if (document.getElementById('audioplayer-album')) {
      document.getElementById('audioplayer-album').innerText =
          info['album'];
    }
    if (document.getElementById('audioplayer-artist')) {
      document.getElementById('audioplayer-artist').innerText =
          info['artist'];
    }
    
    // 入れ子にimgタグがあれば画像ファイル名を取得
    if (!imgfile && elm.querySelector('img')) {
      imgfile = elm.querySelector('img').src;
      console.log('img = ' + imgfile);
    }
    
    // 画像表示
    if (imgfile) {
      console.log('imgfile: ' + imgfile);
      document.getElementById('audioplayer_img').src = imgfile;
    }
    
    // プレーヤー表示
    //~ pauseButton.innerText = 'PLAY';
    audioplayer.style.display = 'block';
    
    // 音楽ファイル読込・再生
    audio.src = file;
    audio.load();
    
    if (info['state'] !== 'pause') {
      audio.play();
    } else {
      pause = true;
      audio.pause();
      pauseButton.querySelector('img').src = myScriptDir + '/play.png';
    }
  }

  // oggファイルからID3タグを取得
  function getTags(file) {
    let tags = loadFile(file).match(/(ALBUM|TITLE|ARTIST)=([\w\d\s]*)/g);
    let tag_arr = {};
    let result = null;
    let p = 0;
    let k = '';
    let v = '';
    
    tags.forEach(function(elm){
      p = elm.search(/=/);
      k = elm.substring(0, p);
      v = elm.substring(++p);
      tag_arr[k] = v;
    });
    
    console.dir(tag_arr);
    
    return tag_arr;
  }

  // ファイル読込
  function loadFile(filePath) {
    let result = null;
    let xmlhttp = new XMLHttpRequest();
    
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    
    return result;
  }
  
  // コントローラーを出力
  function setAudioHTML() {
    let el = document.createElement('div');
    
    //========================
    // アイコンのサイズ（単位：px）
    let imgwidth = 100; // 横
    let imgheight = 100; // 縦
    
    // プレーヤーの幅 ***//
    let player_width = '1130px';
    //========================
    let toprow = imgheight - 4 - 32;
    
    el.innerHTML = `
      <!-- AudioPlayer -->
      <div id="audioplayer"
           style="display: none;
                  width: 100%;
                  min-width: 375px;
                  overflow-x: auto;
                  background-color: none;
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  text-align: center;
                  z-index: 9999;">
        <div style="display: inline-block;
                    width: 97%;
                    height: ${imgheight}px;
                    max-width: 100%;
                    background-color: #707070;
                    margin: 0em auto;
                    display: grid;
                    grid-template-rows: ${toprow}px 4px 32px;
                    grid-template-columns: ${imgwidth}px 1fr;">
          <!-- Audio Package -->
          <div style="grid-column: 1; grid-row: 1 / 4;">
            <img id="audioplayer_img" src="${myScriptDir}/sample.png"
                 style="width: 100%; object-fit: contain;"/ >
          </div>
          <div style="text-align: left;
                      padding: 10px;
                      box-sizing: border-box;
                      min-width: 100%;">  
            <!-- Audio Title-->
            <div id="audioplayer-title"
                 style="color:white;
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 2px;
                        white-space: nowrap;
                        overflow-x: auto;">TITLE</div>
            <!-- Audio Artist -->
            <div style="color:white;
                        font-size: 10px;
                        font-weight: 500;"
                >by <span id="audioplayer-artist">Artist</span></div>
          </div>
          <!-- border -->
          <!-- Play Bar -->
          <div id="audioplayer-border-maxspace" style="position: relative; left : 10%; height: 200px; width: 80%; height: 2px; background-color: #707070;">
            <div id="border"
                 style="margin-top:-10px;
                        width: calc(100% * 0); 
                        height: 3px; padding: 2px 0px; 
                        background:-webkit-linear-gradient(135deg, #427eff 0%, #f13f79 70%) no-repeat;
                        background: linear-gradient(135deg, #427eff 0%, #f13f79 70%) no-repeat;/*Gradation ①*/
                        background: -webkit-liner-gradient(#ffdb2c 10%, rgba(255, 105, 34, 0.65) 55%, rgba(255, 88, 96, 0) 70%);
                        background: liner-gradient(#ffdb2c 10%, rgba(255, 105, 34, 0.65) 55%, rgba(255, 88, 96, 0) 70%);/*Gradation ②*/">
            </div>
            <div id="audioplayer-circle"
                style="display: block;
                       position: absolute;
                       margin-top: -7.5px;
                       margin-left: -5px;
                       width: 10px;
                       height: 10px;
                       border-radius: 5px;
                       background-color: red;"></div>
          </div>
          <!-- /border -->
          <!-- GiGs Logo -->
          <div class="audio_logo"
               style="background-color: #707070;
                      background-image: url('${myScriptDir}/GiGs_logo.png');
                      background-repeat: no-repeat;
                      background-size: 4.5vw;
                      background-position: 95% 100%;
                      line-height: 25px;
                      padding-top: 1px;
                      padding-bottom: 3px;">
            <!-- Audio Time -->
            <output id="audioplayer-time"
                    style="font-size: 10px;
                           color: white;
                           height: 27px;"> 00:00</output>
            <!-- Play & Pause -->
            <button id="audioplayer-prev"
                    style="background: none;
                           border-width: 0px;
                           cursor: pointer;"
                ><img src="${myScriptDir}/prev_arr.png"
                      style="height: 27px;" alt="&lt;" /></button>
  <!--
            <button id="audioplayer-pause">START</button>
  -->
            <!-- 15 Seconds Back -->
            <button id="audioplayer-pause"
                    style="background: none;
                           border-width: 0px;
                           cursor: pointer;"
                ><img src="${myScriptDir}/pause.png"
                      style="height: 27px;" /></button>
            <!-- 15 Seconds Skip -->
            <button id="audioplayer-next"
                    style="background: none;
                           border-width: 0px;
                           cursor: pointer;"
                ><img src="${myScriptDir}/next_arr.png"
                      style="height: 27px;" alt="&gt;" /></button>
            <!-- Audio Total Time -->
            <output id="audioplayer-totaltime"
                    style="font-size: 10px;
                           color:white; height: 27px;"> </output>
          </div>
        </div>
      </div>
      <!-- /AudioPlayer -->
`;
    //~ document.body.appendChild(el);
    document.body.insertAdjacentHTML('beforeend', el.innerHTML);
  }
  
  // Barba使用時のイベントリスナー再設定
  Barba.Dispatcher.on('transitionCompleted', function() {
    //~ console.dir(document.getElementsByClassName('ap_music'));
    musics.length = 0;
    
    for (let i = 0; i < musics.length; i++) {
      musics[i].addEventListener('click', function(event){
        audioPlayer(musics[i]);
      });
    }
  });
});
