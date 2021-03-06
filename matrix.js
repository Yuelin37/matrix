var term = require('terminal-kit').terminal ;

var fs = require('fs'), Log = require('log'),
  log = new Log('debug', fs.createWriteStream('my.log'));

function terminate() {
  setTimeout(function() {
    term.grabInput(false);
    term.fullscreen(false);
    term.applicationKeypad(false);
    term.hideCursor(false);
    // term.beep();

    // stop drawing screen before quit.
    clearPaint(1, term.width);
    // Add a 100ms delay, so the terminal will be ready when the process
    // effectively exit, preventing bad escape sequences drop
    setTimeout(function() {process.exit();}, 100);
  }, 100);
}



// Switch to fullscreen (alternate) buffer mode
term.fullscreen() ;
term.hideCursor();
term.grabInput( {mouse: 'button' , focus: true} ) ;

var randomPower = 1000;
var curWidth = term.width;
function randomChar() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr' +
  '\'\"stuvwxyz0123456789!@#$%&*()+{}<>/åßç√†®∑œ¥øπ¬∆µ≤≥÷↑←' +
  '¡™£¢∞§¶ªº–≠«¿Çæü§';

  for( var i=0; i < 1; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function getInterval() {
  var interval = Math.floor(Math.random()*randomPower);
  if (interval < 20){
    interval += 10;
  }
  return interval;
}

var matrix = [];
term.clear();

function preparePaint(firstCol, lastCol){
  for (var i = firstCol; i <= lastCol; i++) {
    var cur_col = i;
    var cur_pos = 1;
    var cur_erease_pos = 1;
    var printInterval = getInterval();
    var ereaseInterval = printInterval * 1.75;

    var printHandle;
    var ereaseHandle;

    var print = function() {
      term.moveTo( this.cur_col , this.cur_pos) ;
      var charToPrint = randomChar();
      term.green(charToPrint);

      if (this.cur_pos< term.height) {
        this.cur_pos++;
      }else {
        this.cur_pos = 1;
        this.printInterval = getInterval();

        clearInterval(this.printHandle);
        this.printHandle = setInterval(()=>{this.print();}, this.printInterval);

        if (this.ereaseInterval > this.printInterval){
          this.ereaseInterval = this.printInterval/5;
          clearInterval(this.ereaseHandle);
          this.ereaseHandle = setInterval(()=>{this.erease();}, this.ereaseInterval);
        }
        // term.moveTo(4, windowHight-3);
        // term.green('printInterval: ' + this.printInterval + '   ');
        // term.moveTo(4, windowHight-2);
        // term.green('ereaseInterval: ' + this.ereaseInterval+ '   ');
        // debugInfo();
      }
    };
    var erease = function() {
      term.moveTo( this.cur_col , this.cur_erease_pos) ;
      term.green(' ');
      if (this.cur_erease_pos< term.height) {
        this.cur_erease_pos++;
      }else {
        this.cur_erease_pos = 1;
        this.ereaseInterval = getInterval();
        var timelimit = this.printInterval * (term.height - this.cur_pos);
        var expteded  = this.ereaseInterval * term.height;
        if (expteded < timelimit){
          this.ereaseInterval = (timelimit/term.height)* 1.1;
        }
        clearInterval(this.ereaseHandle);
        this.ereaseHandle = setInterval(()=>{this.erease();}, this.ereaseInterval);
      }
      // term.moveTo(4, windowHight-3);
      // term.green('printInterval: ' + this.printInterval + '   ');
      // term.moveTo(4, windowHight-2);
      // term.green('ereaseInterval: ' + this.ereaseInterval+ '   ');
    };

    matrix[i] = {cur_col, cur_pos, cur_erease_pos, printInterval,
      ereaseInterval, print, erease, printHandle, ereaseHandle};
  }
}



// for (let i = 1; i < 2; i++) {
function paint(firstCol, lastCol){
  for (let i = firstCol; i <= lastCol; i++) {
    setTimeout(()=>{
      matrix[i].printHandle = setInterval(()=>{matrix[i].print();}, matrix[i].printInterval);
      matrix[i].ereaseHandle = setInterval(()=>{matrix[i].erease();}, matrix[i].ereaseInterval);
    }, Math.floor(Math.random()*15000));
  }
}


preparePaint(1, curWidth);
paint(1, curWidth);

term.on('key' , function(key) {
  switch (key){
  case 'q':
  case 'CTRL_C' : terminate();
    break;
  }
});

function clearPaint(firstCol, lastCol){
  log.info('clearPaint... '+ firstCol + ' ' + lastCol);
  for (let i = firstCol; i <= lastCol; i++) {
    if (typeof matrix[i] === 'undefined'){
      break;
    }
    clearInterval(matrix[i].printHandle);
    clearInterval(matrix[i].ereaseHandle);
  }
}

term.on('resize', function(){
  term.clear();
  if (curWidth > term.width){
    clearPaint(term.width +1 , curWidth);
    term.clear();
    log.info(term.width);
  }else {
    preparePaint(curWidth+1, term.width);
    paint(curWidth+1, term.width);
  }
  curWidth = term.width;
});
