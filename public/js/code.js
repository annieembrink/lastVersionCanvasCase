// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");
const nicknameInput = document.getElementById("nicknameInput");
const chatDiv = document.getElementById("chatDiv");
const wordDiv = document.getElementById("wordDiv");
const chosenWord = document.getElementById("chosenWord");
const colors = document.getElementById("colors");
const penContainer = document.getElementById("penContainer");
const clearBtn = document.getElementById("clearBtn");
const body = document.querySelector('body')
const playerDiv = document.getElementById('players')
const gameBody = document.getElementById('gameBody')
const colorPen = document.getElementById('colorPen')

const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth / 2.2
canvas.height = window.innerHeight / 2;
const ctx = canvas.getContext("2d");
let isPainting = false;

let nickname;
let id;

fetch('motive.json')
  .then((response) => response.json())
  .then((data) => {

    //Generate colors
    function generateColors() {
      data.colors.map(color => {
        let pTag = document.createElement('p');
        pTag.classList = "theColorTags"
        pTag.id = color;
        pTag.style.backgroundColor = color;
        colors.appendChild(pTag);
      })
    }
    generateColors()

    //Generate pensize
    function generatePen() {
      data.pen.map(onePen => {
        let imgTag = document.createElement('img');
        imgTag.src = "img/carrot-darker.png"
        imgTag.classList = `pen ${onePen}`
        imgTag.id = onePen.slice(-1);
        penContainer.appendChild(imgTag);

        // let pTag = document.createElement('p');
        // pTag.classList = `pen ${onePen}`
        // pTag.id = onePen.slice(-1);
        // penContainer.appendChild(pTag);
      })
    }
    generatePen()

    //Not good code, but solved for now
    let pTags = document.getElementsByClassName('pen')

    for (let i = 0; i < pTags.length; i++) {
      const element = pTags[i];

      element.addEventListener('click', (e) => {
        objWithCurrentPen.pen = e.target.id

        for (let i = 0; i < pTags.length; i++) {
          const element = pTags[i];

          if (element.classList.contains("penBoxFocus")) {
            element.classList.remove("penBoxFocus")
          }
        }

        e.target.classList.add('penBoxFocus');

      })
    }


  })
  .catch(err => console.log(err))

//Outside fetch

//Chosen pen size
let objWithCurrentPen = {
  pen: '2'
}

//Chosen color
let objWithCurrentColor = {
  color: 'black'
}

colors.addEventListener('click', (e) => {
  objWithCurrentColor.color = e.target.id;

  let pTags = colors.querySelectorAll('p');

  for (let i = 0; i < pTags.length; i++) {
    const element = pTags[i];
    if (element.classList.contains('colorBoxFocus')) {
      element.classList.remove('colorBoxFocus')
    }
  }
  e.target.classList.add('colorBoxFocus');
})

// ---------------------------------

function startGame() {
  // get value from input nickname
  nickname = document.getElementById("nicknameInput").value;

  // if set - disable input nickname
  document.getElementById("nicknameInput").setAttribute("disabled", true);
  document.getElementById("setNickname").setAttribute("disabled", true);

  // document.getElementById('setNicknameContainer').style.flexDirection = 'column'
  document.getElementById('setNicknameContainer').style.display = 'none'

  // document.getElementById('carrotImg').style.margin = '40% 0 0 0'
  document.getElementById('nicknameInput').style.margin = '0'
  document.getElementById('head').innerText = nickname

  // enable input field
  // document.getElementById("inputText").removeAttribute("disabled");

  // focus input field
  document.getElementById("inputText").focus();
}


/* functions...
------------------------------- */

/**
 * parse JSON
 *
 * @param {*} data
 * @return {obj}
 */
function parseJSON(data) {
  // try to parse json
  try {
    let obj = JSON.parse(data);

    return obj;
  } catch (error) {
    // log to file in real application....
    return {
      error: "An error receving data...expected json format"
    };
  }
}


// --------------------------------------------------


function createPlayersEl(obj) {

  const colors = [
    "#995D81",
    "#F75C03",
    "#F1C40F",
    "#2E933C"
  ]

  const images = [
    "img/rabbit.png",
    "img/rabbit2.png",
    "img/rabbit3.png"
  ]

  playerDiv.innerHTML = '';
  // console.log(obj.length)

  // function getRandomColor() {
  //   var r = 255 * Math.random() + 110 | 0,
  //     g = 255 * Math.random() + 110 | 0,
  //     b = 255 * Math.random() + 110 | 0;
  //   return 'rgb(' + r + ',' + g + ',' + b + ')';
  // }

  let i = 0
  a = 0

  obj.forEach(player => {
    const onePlayerDiv = document.createElement('div');
    if (i === 4) {
      i = 0
    }
    onePlayerDiv.style.backgroundColor = colors[i++]
    // onePlayerDiv.style.backgroundColor = getRandomColor();
    playerDiv.appendChild(onePlayerDiv)

    const playerEl = document.createElement('p')
    playerEl.innerText = `${player.nickname}: ${player.points} points`
    onePlayerDiv.appendChild(playerEl)

    if (a === 3) {
      a = 0
    }

    const playerImg = document.createElement('img');
    playerImg.src = images[a++];
    playerImg.style.width = '30px';
    playerImg.style.height = '30px';
    playerImg.style.marginRight = '10px';
    onePlayerDiv.appendChild(playerImg)

    onePlayerDiv.style.display = 'flex'
    onePlayerDiv.style.justifyContent = 'space-between'
    onePlayerDiv.style.alignItems = 'center'
  })



}


function toFewPlayers(bool) {
  if (bool) {
    document.getElementById('theGameContainer').style.display = 'none';
  }
}

//FUNCTION ----------------------------
function init(e) {

  const websocket = new WebSocket("ws://localhost:80");

  function scrollToBottom() {
    let conv = document.getElementById('conversation')
    conv.scrollTop = conv.scrollHeight
  }


  /**
   * render new message
   *
   * @param {obj}
   */
  function renderMessage(obj) {
    // use template - cloneNode to get a document fragment
    let template = document.getElementById("message").cloneNode(true);

    // access content
    let newMsg = template.content;

    if (obj.msg === obj.chosenWordArr[0]) {
      obj.msg = `guessed the right word!`
      newMsg.querySelector("p").style.color = 'green'
      newMsg.querySelector("p").style.fontWeight = 'bold'
    }

    // change content...
    newMsg.querySelector("span").textContent = obj.nickname;
    // body.baseURI.split('=')[1]
    newMsg.querySelector("p").textContent = obj.msg;

    // render using prepend method - last message first
    document.getElementById("conversation").append(newMsg);


  }



  //TIMER------------------------------
  var check = null;

  function printDuration() {
    if (check == null) {
      var cnt = 30;

      check = setInterval(function () {

        canvas.onmousedown = initPaint

        websocket.send(JSON.stringify({
          type: 'timerStarted',
          data: true,
          time: cnt
        }));

        cnt -= 1;

        if (cnt === 0) {
          canvas.onmousedown = null;
          isPainting = false;
          stop()

          websocket.send(JSON.stringify({
            type: 'timerStarted',
            data: false
          }));

        }
      }, 1000);
    }
  }

  function stop() {
    clearInterval(check);
    check = null;
  }

  function addlistenerForWords() {

    wordDiv.querySelectorAll('p').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        let pTag = document.createElement('h1');
        pTag.textContent = e.target.innerText;
        chosenWord.appendChild(pTag);
        wordDiv.style.display = 'none';

        websocket.send(JSON.stringify({
          type: 'text',
          data: e.target.innerText
        }));

        printDuration()
        websocket.send(JSON.stringify({
          type: 'clearCanvas',
          data: true
        }));
      })
    })
  }

  function createRandomWordElement(data) {
    wordDiv.style.display = 'block';
    wordDiv.textContent = '';
    chosenWord.textContent = '';

    data.map((tag) => {
      let pTag = document.createElement('p');
      pTag.classList = "randomWordTag"
      pTag.innerText = tag;
      wordDiv.appendChild(pTag)
    })
    addlistenerForWords()
  }

  //Not working perfect
  function createWaitEl() {
    let pTag = document.createElement('h2');
    pTag.id = 'waiting'
    pTag.textContent = '';
    pTag.textContent = 'Waiting for more players...';
    gameBody.appendChild(pTag);
  }

  function nickNameOnEnter(e) {
    if (e.key === "Enter" && nicknameInput.value.length > 0) {
      websocket.send(JSON.stringify({
        type: 'start',
        nickname: nicknameInput.value
      }));

      createWaitEl()
      startGame()
    }
  }

  function nickNameOnButton() {
    if (nicknameInput.value.length > 0) {
      // document.getElementById('theGameContainer').style.display = 'grid';
      websocket.send(JSON.stringify({
        type: 'start',
        nickname: nicknameInput.value
      }));
      createWaitEl()
      startGame()
    }
  }

  function theDiv() {
    // document.getElementById('waiting').style.display = 'none';
    document.getElementById('waiting').innerHTML = '';
    document.getElementById('theGameContainer').style.display = 'grid';

    // document.getElementById('setNicknameContainer').style.margin = '10px'
    // document.getElementById('setNicknameContainer').style.flexDirection = 'row'
    // document.getElementById('setNicknameContainer').style.justifyContent = 'flex-start'
    document.getElementById('setNicknameContainer').style.display = 'none'

    document.getElementById('carrotImg').style.margin = '10px 0 0 10px'

    // nicknameInput.style.margin = '10px 0 0 10px'
    // nicknameInput.style.textAlign = 'left'
    nicknameInput.style.display = 'none';

    clearBtn.style.width = `${canvas.width}px`
    colorPen.style.width = `${canvas.width}px`
    chatDiv.style.maxHeight = `${canvas.height}px`
    document.getElementById('players').style.maxHeight = `${canvas.height}px`
  }


  //TEXT MESSAGE FUNCTIONS
  function newTextMessage(e) {
    // press Enter...make sure at least one char
    if (e.key === "Enter" && inputText.value.length > 0) {
      // chat message object
      let objMessage = {
        type: "text",
        msg: inputText.value,
        id: id,
        nickname: nickname,
        sec: document.getElementById('timer').innerHTML.slice(0, 2),
      };

      // send to server
      websocket.send(JSON.stringify(objMessage));
      inputText.value = "";
    }

  }


  // PAINT MESSAGE FUNCTIONS
  const initPaint = (e) => {
    isPainting = true;
    ctx.beginPath()
    paint(e);

  };

  const finishPaint = () => {
    isPainting = false;
    // ctx.stroke()
    // ctx.closePath()

  };

  const paint = (e) => {
    if (!isPainting) return;

    const args = {
      id: null,
      color: objWithCurrentColor.color || 'black',
      x: e.clientX - canvas.offsetLeft,
      y: e.clientY - canvas.offsetTop,
      line: objWithCurrentPen.pen,
      radius: objWithCurrentPen.pen,
      startAngle: 0,
      endAngle: 2 * Math.PI,
    }


    websocket.send(JSON.stringify({
      type: "paint",
      payload: args
    }));

    // ctx.strokeStyle = objWithCurrentColor.color;
    // ctx.lineWidth = objWithCurrentPen.pen;

    // ctx.lineCap = 'round';

    // // ctx.beginPath()
    // // ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    // ctx.lineTo(args.x, args.y);
    // ctx.stroke();

    ctx.fillStyle = args.color;
    ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle);
    ctx.fill();
    ctx.beginPath();

  };

  function paintLine(ctx, args) {

    ctx.fillStyle = args.color;
    ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle);
    ctx.fill();
    ctx.beginPath();

    // ctx.strokeStyle = args.color;

    // ctx.lineWidth = args.line;
    // ctx.lineCap = 'round';

    // ctx.beginPath()
    // ctx.lineTo(args.x, args.y);
    // ctx.stroke();


  }

  const recreateCanvas = (state) => {
    state.forEach((message) => {
      if (message.type == "paint") {
        paintLine(ctx, message.payload);
      }
    });
  };

  const handleSocketOpen = (e) => {
    console.log('Socket has been opened');
    websocket.send(JSON.stringify({
      type: "init"
    }));
  }


  const handleSocketMessage = (e) => {
    const message = JSON.parse(e.data);

    //switch statement
    switch (message.type) {
      case "init":
        const state = message.payload.state;
        recreateCanvas(state);
        break;
      case "timerStarted":
        document.getElementById('timer').innerText = `${message.time-1} seconds left`;
        if (message.time === undefined) {
          document.getElementById("timer").innerHTML = 'Time out';
          createPlayersEl(message.nicknameHistory)

        }
        // createPlayersEl(message.nicknameHistory)
        break;
      case "getRandomWords":
        createRandomWordElement(message.data)
        break;
      case "getRandomPlayer":
        document.getElementById('whosTurn').textContent = `${message.data[0].nickname}s turn`

        if (!message.allowedToGuess) {
          inputText.disabled = true;
          inputText.placeholder = 'It`s your time to PAINT!'
        } else {
          inputText.disabled = false;
          inputText.placeholder = "Write your guess here..."
        }
        break;
      case "text":
        if (!message.allowedToGuess) {
          inputText.disabled = true;
          inputText.placeholder = 'It`s your time to PAINT!'

        } else {
          inputText.disabled = false;
          inputText.placeholder = "Write your guess here..."
        }
        renderMessage(message)
        scrollToBottom()
        break;
      case "start":
        theDiv()
        createPlayersEl(message.data.nicknameHistory)
        document.getElementById('whosTurn').textContent = `${message.data.randomPlayerState[0].nickname}s turn`
        break;
      case "paint":
        const args = message.payload;
        paintLine(ctx, args);
        break;
      case "disconnect":
        toFewPlayers(message.toFewPlayers)
        createPlayersEl(message.active)
        break;
      case "clearCanvas":
        if (message.data) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        break;
      default:
    }
  }

  // listen on close event (server)
  websocket.addEventListener("close", (e) => {
    gameBody.innerHTML = '';
    gameBody.innerText = 'Sorry, something went wrong, try again'
    gameBody.style.fontSize = '2rem';
    gameBody.style.fontWeight = 'bold';
    gameBody.style.color = '#F75C03'
    gameBody.style.textShadow = '1px 1px #242423';
    gameBody.style.padding = '20px';
  });

  // TODO: Connecting events with functions
  nicknameInput.onkeydown = nickNameOnEnter;
  setNickname.onclick = nickNameOnButton;
  inputText.onkeydown = newTextMessage;
  websocket.onopen = handleSocketOpen;
  websocket.onmessage = handleSocketMessage;
  // canvas.onmousedown = initPaint
  canvas.onmousemove = paint
  window.onmouseup = finishPaint

  clearBtn.addEventListener('click', () => {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    websocket.send(JSON.stringify({
      type: 'clearCanvas',
      data: true
    }));
  })

}



window.onload = init;

//funktionalitet att lägga till ------------------

//timer för att välja ord, om inte valt inom 60 sek, slumpa fram ord att rita
//Timern ska nollas om randomplayer sticker mitt i 
//time out bort när orden syns 
//rita linjer ist för prickar
//rita med linjer inte prickar
//använder jag ens allow to paint?
//städa kod
//Om alla gissat rätt, avsluta timern och slumpa ny spelare
//canvas clearas inte korrekt??? eller ...
//penn-ikoner

//Välja färger
//render
//read me
//STÄDA KOD
//snyggare text i player-div
//kommentera kod