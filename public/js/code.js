// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");
const nicknameInput = document.getElementById("nickname");
const chatDiv = document.getElementById("chatDiv");
const wordDiv = document.getElementById("wordDiv");
const chosenWord = document.getElementById("chosenWord");
const colors = document.getElementById("colors");
const pen = document.getElementById("pen");
const clearBtn = document.getElementById("clearBtn");

fetch('motive.json')
  .then((response) => response.json())
  .then((data) => {

    const GenerateRandomWords = () => {
      let test = []
      for (let i = 0; i < 3; i++) {
        test[i] = data.words[Math.floor(Math.random() * data.words.length)]
      }
      createRandomWordElement(test);
    }

    function createRandomWordElement(data) {

      data.map((tag) => {
        let pTag = document.createElement('p');
        pTag.classList = "randomWordTag"
        pTag.innerText = tag;
        wordDiv.appendChild(pTag)
      })

    }
    GenerateRandomWords()

    wordDiv.querySelectorAll('p').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        let pTag = document.createElement('p');
        pTag.textContent = e.target.innerText;
        chosenWord.appendChild(pTag);
        wordDiv.remove()
      })
    })

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

    function generatePen() {
      data.pen.map(onePen => {
        let pTag = document.createElement('p');
        pTag.classList = `pen ${onePen}`
        pTag.id = onePen.slice(-1);
        pen.appendChild(pTag);
      })
    }
    generatePen()
  })
  .catch(err => console.log(err))

//Outside fetch
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

let objWithCurrentPen = {
  pen: '2'
}
pen.addEventListener('click', (e) => {
  objWithCurrentPen.pen = e.target.id
})

// variable current user | nickname
let nickname;

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

nicknameInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    setNickName()
  }
})

setNickname.addEventListener("click", () => {
  setNickName()
});

function setNickName() {
  // get value from input nickname
  nickname = document.getElementById("nickname").value;

  // if set - disable input nickname
  document.getElementById("nickname").setAttribute("disabled", true);

  // enable input field
  document.getElementById("inputText").removeAttribute("disabled");

  // focus input field
  document.getElementById("inputText").focus();
}

inputText.addEventListener("keydown", (event) => {
  // press Enter...make sure at least one char
  if (event.key === "Enter" && inputText.value.length > 0) {
    // chat message object
    let objMessage = {
      msg: inputText.value,
      nickname: nickname,
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
  // DONE: Setup Canvas 
  const canvas = document.querySelector("#canvas");
  canvas.width = 350
  canvas.height = 350
  const ctx = canvas.getContext("2d");

  // DONE: Handle painting
  let isPainting = false;
  const initPaint = (e) => {
    isPainting = true;
    paint(e); // needed to be able to make dots
  };

  const finishPaint = () => {
    isPainting = false;
  };

  const paint = (e) => {
    if (!isPainting) return;
    ctx.fillStyle = objWithCurrentColor.color;
    ctx.arc(e.clientX, e.clientY, objWithCurrentPen.pen, 0, 2 * Math.PI);
    ctx.fill()
    ctx.beginPath()

  };

  // TODO: Connecting events with functions
  canvas.onmousedown = initPaint
  canvas.onmousemove = paint
  window.onmouseup = finishPaint

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })
}

window.onload = init