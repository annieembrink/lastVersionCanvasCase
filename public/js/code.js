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

const canvas = document.querySelector("#canvas");
canvas.width = 350
canvas.height = 400
const ctx = canvas.getContext("2d");
let isPainting = false;

let nickname;
let id;

// const websocket = new WebSocket("ws://localhost:80");


fetch('motive.json')
  .then((response) => response.json())
  .then((data) => {

    //Generating three random words
    const GenerateRandomWords = () => {
      let test = []
      for (let i = 0; i < 3; i++) {
        test[i] = data.words[Math.floor(Math.random() * data.words.length)]
      }
      createRandomWordElement(test);
    }
    GenerateRandomWords()

    //Filling the wordDiv with three random wordTags
    function createRandomWordElement(data) {
      data.map((tag) => {
        let pTag = document.createElement('p');
        pTag.classList = "randomWordTag"
        pTag.innerText = tag;
        wordDiv.appendChild(pTag)
      })
    }

    //For each word withing word Div, add listener to each tag, create element for the chosen word, remove the div with the words to choose from, and start timer
    wordDiv.querySelectorAll('p').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        let pTag = document.createElement('h1');
        pTag.textContent = e.target.innerText;
        chosenWord.appendChild(pTag);
        wordDiv.remove()

        //Start timer
        // init()
        printDuration()
      })
    })

    //Generat colors
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
        let pTag = document.createElement('p');
        pTag.classList = `pen ${onePen}`
        pTag.id = onePen.slice(-1);
        penContainer.appendChild(pTag);
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






//TIMER------------------------------
var check = null;

function printDuration() {
  if (check == null) {
    var cnt = 60;

    check = setInterval(function () {
      cnt -= 1;
      document.getElementById('timer').innerText = `${cnt} seconds left`;

      if (cnt === 0) {
        canvas.onmousedown = null;
        isPainting = false;
        stop()
      }
    }, 1000);
  }
}

function stop() {
  clearInterval(check);
  check = null;
  document.getElementById("timer").innerHTML = 'Time out';
}

// ------------------






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

  // enable input field
  document.getElementById("inputText").removeAttribute("disabled");

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

  // change content...
  newMsg.querySelector("span").textContent = obj.nickname;
  // body.baseURI.split('=')[1]
  newMsg.querySelector("p").textContent = obj.msg;

  // new date object
  let objDate = new Date();

  // visual: 10:41 .. 9:5 ... leading zero....
  newMsg.querySelector("time").textContent =
    objDate.getHours() + ":" + objDate.getMinutes();

  // set datetime attribute - see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
  newMsg
    .querySelector("time")
    .setAttribute("datetime", objDate.toISOString());

  // render using prepend method - last message first
  document.getElementById("conversation").append(newMsg);
}

// --------------------------------------------------




function createPlayersEl(obj) {

  const colors = [
    "red",
    "blue",
    "lightblue",
    "yellow",
    "green",
    "brown",
    "orange",
    "pink",
    "purple",
    "gold",
    "grey",
    "lightgrey"
  ]

  playerDiv.innerHTML = '';
  // console.log(obj.length)

  function getRandomColor() {
    var r = 255*Math.random()+128|0,
    g = 255*Math.random()+128|0,
    b = 255*Math.random()+128|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

  let i=0
  obj.forEach(player => {
    const onePlayerDiv = document.createElement('div');
    if (i === 12) {
      i = 0
    }
    // onePlayerDiv.style.backgroundColor = colors[i++]
    onePlayerDiv.style.backgroundColor = getRandomColor();
    playerDiv.appendChild(onePlayerDiv)

    const playerEl = document.createElement('p')
    playerEl.innerText = player.nickname
    onePlayerDiv.appendChild(playerEl)
  })

}











//FUNCTION ----------------------------
function init(e) {

  const websocket = new WebSocket("ws://localhost:80");

  function nickNameOnEnter(e) {
    if (e.key === "Enter" && nicknameInput.value.length > 0) {
      document.getElementById('theGameContainer').style.display = 'grid';
      websocket.send(JSON.stringify({type: 'start', nickname: nicknameInput.value}));
      startGame()
    }
  }
  
  function nickNameOnButton() {
    if(nicknameInput.value.length > 0) {
      document.getElementById('theGameContainer').style.display = 'grid';
      websocket.send(JSON.stringify({type: 'start', nickname: nicknameInput.value}));
      startGame()
    }
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
      };

      // show new message for this user
      renderMessage(objMessage);

      // send to server
      websocket.send(JSON.stringify(objMessage));

      if (objMessage.msg === chosenWord.textContent) {
        console.log('correct')
        objMessage.msg = `${nickname} guessed the right word`
        inputText.disabled = true;
      }

      // reset input field
      inputText.value = "";
    }
  }




  // PAINT MESSAGE FUNCTIONS
  const initPaint = (e) => {
    isPainting = true;
    // ctx.beginPath()
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

    // ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    // ctx.stroke();

  };

  const recreateCanvas = (state) => {
    state.forEach((message) => {
      if (message.type == "paint") {
        paintLine(ctx, message.payload);
      }
    });
  };

  // const recreatePlayersList = (history) => {
  //   console.log(history)
  // }

  const handleSocketOpen = (e) => {
    // const message = JSON.parse(e.data);
    console.log('Socket has been opened');
    websocket.send(JSON.stringify({
      type: "init"
    }));
  }


  const handleSocketMessage = (e) => {
    const message = JSON.parse(e.data);
    console.log('message', message)

    //switch statement
    switch (message.type) {
      case "init":
        const state = message.payload.state;
        console.log(message.type)
        // console.log('new arr INIT', message.payload.newArr)
        // createPlayersEl(message.payload.newArr)
        console.log(message.payload.howManyClients)
        recreateCanvas(state);
        break;
      case "text":
        console.log(message.type)
        console.log(message.arrayOfPlayersLeft)
        console.log('players left', message.nr)
        // createPlayersEl(message.arrayOfPlayersLeft)
        renderMessage(message)
        break;
      case "start":
        console.log(message.type)
        // console.log('new arr START', message.data.newArr)
        createPlayersEl(message.data.nicknameHistory)
        break;
      case "paint":
        console.log(message.type)
        // console.log(message.payload)
        const args = message.payload;
        paintLine(ctx, args);
        break;
      case "disconnect":
        console.log(message.data)
        break;
      default:
        // console.log("default case")
    }
  }

  // listen on close event (server)
  websocket.addEventListener("close", (e) => {
    // const data = JSON.parse(e.data)
    // console.log('data', data)

    document.getElementById("status").textContent = "Sry....server down";
  });

  // TODO: Connecting events with functions
  nicknameInput.onkeydown = nickNameOnEnter;
  setNickname.onclick = nickNameOnButton;
  inputText.onkeydown = newTextMessage;
  websocket.onopen = handleSocketOpen;
  websocket.onmessage = handleSocketMessage;
  canvas.onmousedown = initPaint
  canvas.onmousemove = paint
  window.onmouseup = finishPaint

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })

}

function paintLine(ctx, args) {

  ctx.fillStyle = args.color;
  ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle);
  ctx.fill();
  ctx.beginPath();

  // ctx.strokeStyle = args.color;

  // ctx.lineWidth = args.line;
  // ctx.lineCap = 'round';

  // ctx.lineTo(args.x, args.y);
  // ctx.stroke();
}

window.onload = init;

//funktionalitet att lägga till ------------------

//timer för att välja ord, om inte valt inom 60 sek, slumpa fram ord att rita
//poängräknare för deltagarna, den som svarar först får flest poäng
//kontrollera ord som skrivs i chatten, matchar rätt ord
//DONE: bara möjligt att svara rätt ord en gång, man kan inte lura sig till fler poäng
//en i taget kan rita på canvas, loop för vems tur det är helt enkelt
//den som ritar får också poäng ju fler som gissar rätt ord
//en div där deltagarna presenteras med poäng
//den som ritar ska inte kunna skriva i chatten och får poäng för rätt gissning
//orden ska bara synas för den som ritar
//DONE: startsida där man börjar välja nickname, kanske förklarar regler SEN canvas och chatt
//DONE: när tiden är ute, kan man inte rita längre