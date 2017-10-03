console.clear();

const elements = {
  simonBack: document.querySelector('.back'),
  simonFront: document.querySelector('.front'),
  buttons: document.querySelectorAll('.button'),
  btnSelector: {
    1: document.querySelector('.topLeft'),
    2: document.querySelector('.topRight'),
    3: document.querySelector('.botRight'),
    4: document.querySelector('.botLeft'),
  },
  opBtns: document.querySelectorAll('.inner-button'),
  onOffBtn: document.querySelector('.on-off'),
  startBtn: document.querySelector('.start'),
  aboutBtns: document.querySelectorAll('.about'),
  onOffText: document.querySelector('.on-off-text'),
  count: document.querySelector('.count'),
  countText: document.querySelector('.count-text'),
  event: new Event('click'),
  tones: [new Audio ('http://beachlightsmusic.com/simon_tones/tone1.mp3'),
         new Audio ('http://beachlightsmusic.com/simon_tones/tone2.mp3'),
         new Audio ('http://beachlightsmusic.com/simon_tones/tone3.mp3'),
         new Audio ('http://beachlightsmusic.com/simon_tones/tone4.mp3')]
}
const _e = elements;

const State = function(newGame) {
  this.onOff = newGame.onOff;
  this.strict = newGame.strict;
  this.start = newGame.start;
  this.gameSeq = newGame.gameSeq;
  this.userSeq = newGame.userSeq;
  this.curSeq = newGame.curSeq;
  this.count = newGame.count;
  this.userInput = newGame.userInput;
  this.gameTiming = newGame.gameTiming;
  this.timer = newGame.timer;
  this.gameEnd = newGame.gameEnd;
}//end of state object

let curState = null;

const control = {
  newGame: {
    onOff: false,
    strict: false,
    start: false,
    gameSeq: [],
    userSeq: [],
    curSeq: function(val){return val;},
    count: 0,
    userInput: false,
    gameTiming: 1000,
    timer: null,
    gameEnd: null
  },
  
  init: function() {
    
    _e.buttons.forEach((button) => {
      button.addEventListener('click', this.buttonClk);
      button.addEventListener('animationend', this.buttonClk);
    })
    _e.opBtns.forEach((button) => {
      button.addEventListener('click', this.opBtnClk);
    })
  },
  
  removeListeners: function() {
    _e.buttons.forEach((button) => {
      button.removeEventListener('click', this.buttonClk);
      button.removeEventListener('animationend', this.buttonClk);
    })
    _e.opBtns.forEach((button) => {
      button.removeEventListener('click', this.opBtnClk);
    })
  },
  
  buttonClk: function(e) {
    //keep user from pressing buttons while not user turn
    if (e.type === 'click' && !curState.userInput && e.bubbles) {
      return;
    } else {
      if (e.type === 'click') {
        e.target.classList.add('click');

        if (curState.userInput) {
          clearTimeout(curState.timer);
          control.compareSeq(e)
          //if user takes too long:
          curState.timer = setTimeout(() => {
            curState.gameEnd = 'lose';
            control.reset();
          }, 5000)
        }
      switch (true) {
        case e.target === _e.btnSelector[1]:
          _e.tones[0].pause();
          _e.tones[0].currentTime = 0;
          _e.tones[0].play();
          break;
        case e.target === _e.btnSelector[2]:
          _e.tones[1].pause();
          _e.tones[1].currentTime = 0;
          _e.tones[1].play();
          break;
        case e.target === _e.btnSelector[3]:
          _e.tones[2].pause();
          _e.tones[2].currentTime = 0;
          _e.tones[2].play();
          break;
        case e.target === _e.btnSelector[4]:
          _e.tones[3].pause();
          _e.tones[3].currentTime = 0;
          _e.tones[3].play();
          break;
                  }
        //remove animation class
        } else if (e.type === 'animationend') {
        e.target.classList.remove('click');
      }
    }
  },
  
  opBtnClk: function(e) {
    // console.log(e.target)  
      e.target.classList.toggle('inactive', e.target.classList.contains('active'));
      e.target.classList.toggle('active');
      switch (true) {
        case e.target.classList.contains('on-off'):
          control.onOff();
          break;
        case e.target.classList.contains('start'):
          control.start();
          break;
        case e.target.classList.contains('strict'):
          control.strict();
          break;
               }
  },
  
  onOff: function() {
    if (!curState || !curState.onOff) {
      //set newgame state onOff to true
      this.newGame.onOff = true;
      curState = new State(this.newGame);
      //generate gamesequence
      curState.gameSeq = this.generateSequence();
      _e.onOffText.innerHTML = '&nbsp;&nbsp;on!';
      this.toggleCountOn();
      this.init();
      // console.log(curState);
    } else if (curState.onOff) {
      curState.onOff = false;
      _e.onOffText.innerHTML = 'on-off';
      _e.startBtn.classList.remove('active');
      _e.countText.innerHTML = 'count';
      this.toggleCountOn();
      
      this.removeListeners();
      clearTimeout(curState.timer);
    }
  },
  
  start: function() {
    // console.log('@start, started')
    if (!curState.start) {
      curState.start = true;
      curState.count = 1;
      _e.countText.innerHTML = curState.count;
      let tempSeq = new curState.curSeq(curState.gameSeq.slice(0, curState.count));
      console.log('@ start', curState)
      // initiat simon sequence
      control.playSeq(tempSeq)
    } else if (curState.start) {
      this.reset();
    }
  },
  
  strict: function() {
    curState.strict ? curState.strict = false : curState.strict = true;
  },
  //update the counter and initiat next sequence
  updateCount: function() {

    curState.count++;
    let tempSeq = new curState.curSeq(curState.gameSeq.slice(0, curState.count));
    _e.countText.innerHTML = curState.count;
    this.playSeq(tempSeq);
  },
  
  playSeq: function(tempSeq) {
    if (!curState.onOff || !curState.start) return;
    clearTimeout(curState.timer);
    //set timer for user players move
    if (tempSeq.length === 0) {
      curState.userInput = true;
      curState.timer = setTimeout(function() {
        curState.gameEnd = 'lose'
        control.reset();
      }, 5000);
      return;
    }
    // playthough the current sequence removing one every iteration
    setTimeout(function() {
      _e.btnSelector[tempSeq[0]].dispatchEvent(_e.event);
      tempSeq.shift();
      control.playSeq(tempSeq);
    }, curState.gameTiming)
  },
  
  compareSeq: function(val) {
    //clear timer if user is playing
    clearTimeout(curState.timer);
    
    let tempSeq = new curState.curSeq(curState.gameSeq.slice(0, curState.count));

    if (+val.target.id !== tempSeq[curState.userSeq.length]) {
      curState.gameEnd = 'lose';
      setTimeout(() => {control.reset()}, 300)
      return;
    }
    curState.userSeq.push(+val.target.id);
    
    switch (true) {
      case curState.userSeq.length === 4:
        curState.gameTiming = 800;
        break;
      case curState.userSeq.length === 8:
        curState.gameTiming = 600;
        break;
      case curState.userSeq.length === 12:
        curState.gameTiming = 430;
        break;
      case curState.userSeq.length === curState.gameSeq.length:
        control.win();
        return;  
                }
    //simon's turn
    if (curState.userSeq.length === tempSeq.length) {
      curState.userInput = false;
      curState.userSeq = [];
      this.updateCount();
    } 
  },
  
  toggleAbout: function(e) {
    //style animation
    e.target.classList.toggle('active');
    if (e.type !== 'animationend') {
      _e.simonFront.classList.toggle('flip-front');
      _e.simonBack.classList.toggle('flip-back');
    }
  },
  
  toggleCountOn: function(e) {
    _e.count.classList.toggle('on');
    _e.countText.classList.toggle('textOn');
  },
  
  generateSequence: function() {
    let sequence = [];
    for (i=0; i<20; i++) {
      sequence.push(Math.floor(Math.random() * (5-1)) + 1)
    }
    return sequence; 
  },
  
  reset: function() {
    clearTimeout(curState.timer);
    if (curState.gameEnd === 'lose') {
      this.loseTone(0);
      this.toggleCountOn();
      _e.countText.innerHTML = '! ! !'
    }
    if (curState.strict) {
      this.newGame.userSeq = [];
      this.newGame.onOff = true;
      this.newGame.strict = true;
      
      curState = new State(this.newGame);
      // _e.startBtn.classList.remove('active');
      curState.gameSeq = this.generateSequence();
      setTimeout(() => {
        this.start();
      }, 2000)
      
    }
    if (!curState.strict) {
      this.newGame.userSeq = [];
      this.newGame.onOff = true;
      this.newGame.gameSeq = curState.gameSeq;
      
      curState = new State(this.newGame);
      _e.startBtn.classList.remove('active');
      console.log('@ reset ', curState)
    }
  },
  
  loseTone: function(countdown) {
    //reset the volume of the tones after playing lose tones
    if (countdown === 4) return setTimeout(() => {_e.tones.forEach((tone) => {tone.volume = 1;})}, 400)
    _e.tones[countdown].pause();
    _e.tones[countdown].currentTime = 0;
    _e.tones[countdown].volume = 0.4;
    _e.tones[countdown].play();
    
    setTimeout(() => {
      control.loseTone(countdown+1)
    },75)
  },
  
  win: function() {
    _e.countText.innerHTML = 'WIN!';
    alert('you win!');
    curState.gameEnd = 'win';
    this.reset();
  },

}//end of control object
const _c = control;

window.addEventListener('load', function() {
  _e.onOffBtn.addEventListener('click', _c.opBtnClk)
  _e.aboutBtns.forEach((btn) => {
        btn.addEventListener('click', _c.toggleAbout);
        btn.addEventListener('animationend', _c.toggleAbout);
      })
  })
