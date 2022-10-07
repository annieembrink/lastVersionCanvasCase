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

const canvas = document.querySelector("#canvas");
canvas.width = 350
canvas.height = 350
const ctx = canvas.getContext("2d");
let isPainting = false;


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
        init()
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
  })
  .catch(err => console.log(err))

//Outside fetch

//TIMER------------------------------
var check = null;

function printDuration() {
  if (check == null) {
    var cnt = 5;

    check = setInterval(function () {
      cnt -= 1;
      let timerEl = document.getElementById('timer').innerText = `${cnt} seconds left`;

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

//Chosen pen size
let objWithCurrentPen = {
  pen: '2'
}
penContainer.addEventListener('click', (e) => {
  objWithCurrentPen.pen = e.target.id

  let pTags = penContainer.querySelectorAll('p');

  for (let i = 0; i < pTags.length; i++) {
    const element = pTags[i];
    if (element.classList.contains('penBoxFocus')) {
      element.classList.remove('penBoxFocus')
    }
  }
  e.target.classList.add('penBoxFocus');
})

// use WebSocket >>> make sure server uses same ws port!
const websocket = new WebSocket("ws://localhost:80");

/* event listeners
------------------------------- */

// listen on close event (server)
websocket.addEventListener("close", (event) => {
  // console.log('Server down...', event);
  document.getElementById("status").textContent = "Sry....server down";
});

// listen to messages from client | server
websocket.addEventListener("message", (event) => {
  // console.log(event.data);

  let obj = parseJSON(event.data);

  // todo
  // use obj property 'type' to handle message event
  switch (obj.type) {
    case "text":
      break;
    case "somethingelse":
      break;
    default:
      break;
  }

  // ...
  renderMessage(obj);
});

inputText.addEventListener("keydown", (event) => {
  // press Enter...make sure at least one char
  if (event.key === "Enter" && inputText.value.length > 0) {
    // chat message object
    let objMessage = {
      msg: inputText.value,
      // nickname: nickname,
    };

    // show new message for this user
    renderMessage(objMessage);

    // send to server
    websocket.send(JSON.stringify(objMessage));

    // reset input field
    inputText.value = "";
  }
});

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
  document.getElementById("conversation").prepend(newMsg);
}

const log = (message) => console.log(`[CLIENT] ${message}`);

//DRAW FUNCTION
function init(e) {

  // DONE: Handle painting
  const initPaint = (e) => {
    isPainting = true;
    paint(e); 
  };

  const finishPaint = () => {
    isPainting = false;
    ctx.stroke()
    ctx.beginPath()
  };

  const paint = (e) => {
    if (!isPainting) return;
    ctx.strokeStyle = objWithCurrentColor.color;

    ctx.lineWidth = objWithCurrentPen.pen;
    ctx.lineCap = 'round';

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();

  };

  // TODO: Connecting events with functions
  canvas.onmousedown = initPaint
  canvas.onmousemove = paint
  window.onmouseup = finishPaint

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })
}


//funktionalitet att lägga till ------------------
//timer för att välja ord, om inte valt inom 60 sek, slumpa fram ord att rita
//poängräknare för deltagarna, den som svarar först får flest poäng
//kontrollera ord som skrivs i chatten, matchar rätt ord
//bara möjligt att svara rätt ord en gång, man kan inte lura sig till fler poäng
//en i taget kan rita på canvas, loop för vems tur det är helt enkelt
//den som ritar får också poäng ju fler som gissar rätt ord
//en div där deltagarna presenteras med poäng
//den som ritar ska inte kunna skriva i chatten och får poäng för rätt gissning
//orden ska bara synas för den som ritar
//startsida där man börjar välja nickname, kanske förklarar regler SEN canvas och chatt