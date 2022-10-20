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

//Canvas elements
const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth / 2.2
canvas.height = window.innerHeight / 2;
const ctx = canvas.getContext("2d");
let isPainting = false;

//Few global variables
let nickname;
let id;
let chosenWordArr = [];

//Fetch json
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

    //call function
    generateColors()

    //Generate pensize
    function generatePen() {
      data.pen.map(onePen => {
        let imgTag = document.createElement('img');
        imgTag.src = "img/carrot-darker.png"
        imgTag.classList = `pen ${onePen}`
        imgTag.id = onePen.slice(-1);
        penContainer.appendChild(imgTag);
      })
    }

    //Call function
    generatePen()

    //The following code seems a bit complicated, but I couldn´t make it work in any other way
    //Why is pen-listener inside fetch, and color-listener outside?
    //Wrap in function...
    //Connect with pen-element
    let pTags = document.getElementsByClassName('pen')

    //For every pen size...
    for (let i = 0; i < pTags.length; i++) {
      const element = pTags[i];

      //... add event listener
      element.addEventListener('click', (e) => {
        objWithCurrentPen.pen = e.target.id

        for (let i = 0; i < pTags.length; i++) {
          const element = pTags[i];

          //Every time a pen is clicked, check if it has classlist and remove it
          if (element.classList.contains("penBoxFocus")) {
            element.classList.remove("penBoxFocus");
          };
        };

        //The add classlist for clicked element
        e.target.classList.add('penBoxFocus');

      });
    };
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

//Eventlistener for colors
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


//Call this function when setnicknameinput is done
function startGame() {
  // get value from input nickname
  nickname = document.getElementById("nicknameInput").value;

  // if set - disable input nickname
  document.getElementById("nicknameInput").setAttribute("disabled", true);
  document.getElementById("setNickname").setAttribute("disabled", true);

  document.getElementById('setNicknameContainer').style.display = 'none'

  document.getElementById('nicknameInput').style.margin = '0'
  document.getElementById('head').innerText = nickname

  // focus input field
  document.getElementById("inputText").focus();
}

//Where is this function called?
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

//Create the div with active players
function createPlayersEl(obj) {

  //Backgroundcolors for players
  const colors = [
    "#995D81",
    "#F75C03",
    "#F1C40F",
    "#2E933C"
  ]

  //Rabbit-images for player
  const images = [
    "img/rabbit.png",
    "img/rabbit2.png",
    "img/rabbit3.png"
  ]

  //Every time div is created, start by emptying it
  playerDiv.innerHTML = '';
 
  //To iterate over colors and images
  let i = 0
  a = 0

  //For every object with info about player (nickname, id etc)
  obj.forEach(player => {

    //Create a div
    const onePlayerDiv = document.createElement('div');

    //For colors, if i is 4, start from the beginning
    if (i === 4) {
      i = 0
    }

    //Backgroundcolor for eveyr player div
    onePlayerDiv.style.backgroundColor = colors[i++]

    //Append div to parentdiv
    playerDiv.appendChild(onePlayerDiv)

    //Every div contains a p-tag
    const playerEl = document.createElement('p')

    //With nickname and player points
    playerEl.innerText = `${player.nickname}: ${player.points} points`

    //Append it to div
    onePlayerDiv.appendChild(playerEl)

    //Iterate over images
    if (a === 3) {
      a = 0
    }

    //Create img-element
    const playerImg = document.createElement('img');

    //Source from array of images
    playerImg.src = images[a++];

    //Some img-styling
    playerImg.style.width = '30px';
    playerImg.style.height = '30px';
    playerImg.style.marginRight = '10px';

    //Append it to div
    onePlayerDiv.appendChild(playerImg)

    //And some more styling
    onePlayerDiv.style.display = 'flex'
    onePlayerDiv.style.justifyContent = 'space-between'
    onePlayerDiv.style.alignItems = 'center'
  })
}

//If to few players, dont show gamecontainer yet
function toFewPlayers(bool) {
  if (bool) {
    document.getElementById('theGameContainer').style.display = 'none';
  }
}

//Fixing with url. Use when hosting on render.com
const trimSlashes = str => str.split('/').filter(v => v !== '').join('/');

//The great big init-function (should all code be inside of this?)
function init(e) {

  //Use this when using localhost
  // const websocket = new WebSocket("ws://localhost:80");

  //Use when hosting on render.com
  const baseURL = trimSlashes(window.location.href.split("//")[1]);
  const protocol = 'wss';
  const websocket = new WebSocket(`${protocol}://${baseURL}`);

  //For scrolling in conversation
  function scrollToBottom() {
    let conv = document.getElementById('conversation')
    conv.scrollTop = conv.scrollHeight
  }

  //Rendering messages to dom
  function renderMessage(obj) {
    // use template - cloneNode to get a document fragment
    let template = document.getElementById("message").cloneNode(true);

    // access content
    let newMsg = template.content;

    //If the message is the same as the right wors
    if (obj.msg === obj.chosenWordArr[0]) {

      //Dont type the word but type the following
      obj.msg = `guessed the right word!`

      //And style it
      newMsg.querySelector("p").style.color = 'green'
      newMsg.querySelector("p").style.fontWeight = 'bold'
    }

    // change content...
    newMsg.querySelector("span").textContent = obj.nickname;
    newMsg.querySelector("p").textContent = obj.msg;

    // render using append, last message last
    document.getElementById("conversation").append(newMsg);
  };

  //Timer function
  var check = null;

  function printDuration() {
    if (check == null) {

      //30 seconds to paint
      var cnt = 30;

      check = setInterval(function () {

        //When timer is started, you´re allowed to paint
        canvas.onmousedown = initPaint

        //Send message to server. Timer is started, and the count
        websocket.send(JSON.stringify({
          type: 'timerStarted',
          data: true,
          time: cnt
        }));

        //Count down from 30, -1 per second
        cnt -= 1;

        //When count is 0
        if (cnt === 0) {
          //Not possible to paint anymore
          canvas.onmousedown = null;
          isPainting = false;

          //Stop timer
          stop()

          //Send info to server that timer is stopped
          websocket.send(JSON.stringify({
            type: 'timerStarted',
            data: false
          }));
        }
      }, 1000);
    };
  };

  //The stop timer function
  function stop() {
    clearInterval(check);
    check = null;
  }

  //Eventlistener for the words to choose from
  function addlistenerForWords() {

    wordDiv.querySelectorAll('p').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        let pTag = document.createElement('h1');
        pTag.textContent = e.target.innerText;
        chosenWord.appendChild(pTag);
        wordDiv.style.display = 'none';

        //Send message to server, data is the chosen word
        websocket.send(JSON.stringify({
          type: 'text',
          data: e.target.innerText
        }));

        //When word is chosen - start the timer
        printDuration()

        //And clear the canvas, from last game
        websocket.send(JSON.stringify({
          type: 'clearCanvas',
          data: true
        }));
      })
    })
  }

  //Creating elements for the random words (three at a time)
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

    //Add listener for the words
    addlistenerForWords()
  }

  //If not enough players, create a element that says that
  function createWaitEl() {
    let pTag = document.createElement('h2');
    pTag.id = 'waiting'
    pTag.textContent = '';
    pTag.textContent = 'Waiting for more players...';
    gameBody.appendChild(pTag);
  }

  //Set nickname functions (for both enter and button click) ----------------
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
      websocket.send(JSON.stringify({
        type: 'start',
        nickname: nicknameInput.value
      }));
      createWaitEl()
      startGame()
    }
  }
  // ------------------------------------------------------

  //This function is called when players are enough (at least three) and game is ON
  //Change this terrible function-name...
  function theDiv() {
    document.getElementById('waiting').innerHTML = '';
    document.getElementById('theGameContainer').style.display = 'grid';
    document.getElementById('setNicknameContainer').style.display = 'none'
    document.getElementById('carrotImg').style.margin = '10px 0 0 10px'

    nicknameInput.style.display = 'none';

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
    //When randomplayer begins to paint, call function below
    paint(e);
  };

  const finishPaint = () => {
    isPainting = false;
  };

  //Painter paints and send data to server
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

    //send to server
    websocket.send(JSON.stringify({
      type: "paint",
      payload: args
    }));

    //Paint on client side
    ctx.fillStyle = args.color;
    ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle);
    ctx.fill();
    ctx.beginPath();

  };

  //Paint with info from server
  function paintLine(ctx, args) {

    ctx.fillStyle = args.color;
    ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle);
    ctx.fill();
    ctx.beginPath();

  }

  //Use this when new players arrive
  const recreateCanvas = (state) => {
    state.forEach((message) => {
      if (message.type == "paint") {
        paintLine(ctx, message.payload);
      }
    });
  };

  //Websocket functions

  //on open
  const handleSocketOpen = (e) => {
    console.log('Socket has been opened');
    websocket.send(JSON.stringify({
      type: "init"
    }));
  }


  //on message
  const handleSocketMessage = (e) => {
    const message = JSON.parse(e.data);

    //switch statement
    switch (message.type) {
      //When new window is opened
      case "init":
        const state = message.payload.state;
        recreateCanvas(state);
        break;
      //When timer is started
      case "timerStarted":
        //When started, count down on dom
        document.getElementById('timer').innerText = `${message.time-1} seconds left`;
        //saving the chosen word
        let test = message.chosenWordArr[0]
        //And push it to global variable
        chosenWordArr.push(test)

        //When timer is done
        if (message.time === undefined) {
          //Tell players the right word, using the global variable we declared above
          document.getElementById("timer").innerHTML = `The right word was "${chosenWordArr[0]}"`;
          //Recreate the players el, with new info about points
          createPlayersEl(message.nicknameHistory)
          //Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          //Reset the global variable chosenwordarr
          chosenWordArr.splice(0);
        }
        break;
        //When random words are generated
      case "getRandomWords":
        createRandomWordElement(message.data)
        break;
        //When random player is generated
      case "getRandomPlayer":
        document.getElementById('whosTurn').textContent = `${message.data[0].nickname}s turn`

        //With data from server, who is allowed to guess
        if (!message.allowedToGuess) {
          inputText.disabled = true;
        } else {
          inputText.disabled = false;
        }
        break;
        //When textmessages are sent
      case "text":
        //Using allowedtoguess again, from server
        if (!message.allowedToGuess) {
          inputText.disabled = true;
        } else {
          inputText.disabled = false;
        }
        //Rendering mesages
        renderMessage(message)
        //Scroll function for message div
        scrollToBottom()
        break;
        //when nickname is set
      case "start":
        //The div that shows the actual game
        theDiv()
        //The div with players
        createPlayersEl(message.data.nicknameHistory)
        //Whos turn
        document.getElementById('whosTurn').textContent = `${message.data.randomPlayerState[0].nickname}s turn`
        break;
        //When painting
      case "paint":
        //Info about x, y, color etc
        const args = message.payload;
        //Function that paints with info from server
        paintLine(ctx, args);
        break;
        //When client is disconnected
      case "disconnect":
        toFewPlayers(message.toFewPlayers)
        createPlayersEl(message.active)
        break;
        //When clearbutton is clicked
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

    //Some styling
    gameBody.style.fontSize = '2rem';
    gameBody.style.fontWeight = 'bold';
    gameBody.style.color = '#F75C03'
    gameBody.style.textShadow = '1px 1px #242423';
    gameBody.style.padding = '20px';
  });

  //Connecting events with functions
  nicknameInput.onkeydown = nickNameOnEnter;
  setNickname.onclick = nickNameOnButton;
  inputText.onkeydown = newTextMessage;
  websocket.onopen = handleSocketOpen;
  websocket.onmessage = handleSocketMessage;
  canvas.onmousemove = paint
  window.onmouseup = finishPaint

  //Clear button event listener
  clearBtn.addEventListener('click', () => {
    websocket.send(JSON.stringify({
      type: 'clearCanvas',
      data: true
    }));
  })
}

//Every time window is opened, load init-function
window.onload = init;

//funktionalitet att lägga till ------------------

//timer för att välja ord, om inte valt inom 60 sek, slumpa fram ord att rita
//Timern ska nollas om randomplayer sticker mitt i 
//rita med linjer inte prickar
//använder jag ens allow to paint?
//städa kod
//Om alla gissat rätt, avsluta timern och slumpa ny spelare
//penn-ikoner

//snyggare text i player-div
//kommentera kod
//clear canvas bör inte synas för de som gissar (färg och pennor?)
//the right word was - dosent work all the time... NÄR gör den fel?
//mellanpennan förvald
//synas vilken penna som är förvald, och färg
//transform, pennan
//Om folk lämnar, bara två kvar, waiting-meddelande
