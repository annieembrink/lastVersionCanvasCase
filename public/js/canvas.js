
const Canvas = (props) => {

    //Variables

    let isPainting = false;
    let basicPenSize = 'thick-2'.charAt('thick-2'.length -1)
    
    const [inputValue, setInputValue] = useState([]);
    const [colors, setColors] = useState([]);
    const [randomWords, setRandomWords] = useState([]);
    const [theChosenWord, setTheChosenWord] = useState()
    const [theChosenColor, setTheChosenColor] = useState('black')
    const [theChosenPenSize, setTheChosenPenSize] = useState(basicPenSize)

    const canvasRef = useRef(null);
    const welcomeRef = useRef(null);
    const colorBoxRef = useRef(null);
    const chooseWordHeadingRef = useRef(null);
    const penRef = useRef(null);

    const GenerateRandomWords = () => {
            let test = []
            for (let i = 0; i < 3; i++) {
                test[i] = props.obj.words[Math.floor(Math.random()*props.obj.words.length)]   
            }
            setRandomWords([
                ...randomWords,
                ...test
            ])
    }

    const ChooseWordFunction = (e) => {
        e.preventDefault();

        //Update state with the chosen word
        setTheChosenWord(e.target.innerHTML)

        //Make canvas visible
        canvasRef.current.removeAttribute("hidden")

        //Make colorbox and penSize visible
        colorBoxRef.current.style.display = 'grid'
        penRef.current.style.display = 'grid'

        //After choosing the word, remove div with words and heading for that
        e.target.parentElement.remove()
        chooseWordHeadingRef.current.remove()
    }
   
    //Start the game
    const StartPlaying = (e) => {
        e.preventDefault();

        //Generate three words to choose from
        GenerateRandomWords()

        //Remove the welcome div after typing nickname
        welcomeRef.current.remove()
    }

    //After filling input and pressing enter, start the game and generate the colors
    const KeyPress = (e) => {
        if (e.key === "Enter") {
            StartPlaying(e);
            GenerateColors()
            chooseWordHeadingRef.current.style.display = 'block'
        } 
    }

    //Set all colors to choose from
    const GenerateColors = () => {
        setColors(props.obj.colors)
    }

    //Set value of input (nickname)
    const InputOnChange = (e) => {
        setInputValue(e.target.value)
    }

    //Draw function
    const Draw = (e) => {

        //Creating canvas and context of canvas
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        //Dont understand this ----------
        let BB = canvas.getBoundingClientRect()
        // console.log(BB)
  
        let offsetX=BB.left;
        let offsetY=BB.top;  
  
        let x = parseInt(e.clientX-offsetX);
        let y = parseInt(e.clientY-offsetY);
        //-------------------------

        context.fillStyle = theChosenColor;
        context.fillRect(x, y, theChosenPenSize, theChosenPenSize/2);

        console.log(isPainting)
    }

    //Set the chosen color
    const ChosenColor = (e) => {
        setTheChosenColor(e.target.id)

        let everyColorDiv = Array.from(e.target.parentElement.children)
        
        for (let i = 0; i < everyColorDiv.length; i++) {
            const element = everyColorDiv[i];

            if (element.classList.contains("colorBoxFocus")) {
                element.classList.remove("colorBoxFocus")
            } 
        }
        e.target.classList.add('colorBoxFocus');
    }

    //Set chosen penSize
    const ChoosePenSize = (e) => {
        let penValue = e.target.id.charAt(e.target.id.length -1)
        setTheChosenPenSize(penValue)
    }

    const ClearCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
        
        //Reset chosen color and pensize every time canvas is emptied
        setTheChosenColor('black')
        setTheChosenPenSize(basicPenSize)

        let theColor = Array.from(colorBoxRef.current.children)
        theColor.forEach(color => {
            color.classList.remove('colorBoxFocus');
        });
    }

    return ( 

    <div onMouseUp={() => isPainting = false}>
        {/* Welcome div with input field and label */}
        <div id="welcome" ref={welcomeRef}>
            <label htmlFor="nickname">Choose your nickname: </label>
      
            <input required onChange={(e)=> InputOnChange(e)} onKeyPress={(e) => KeyPress(e)} type="text" id="nickname"/>
        </div>

        {/* After submitting input, show chosen nickname */}
        <div>{`Nickname: ${inputValue}`}</div>

        {/* Choose the word */}
        <h3 style={{display: 'none'}} ref={chooseWordHeadingRef}>Choose the word you want to paint</h3>
        {/* Generate three random words to choose from */}
        <div className="randomWordsContainer">
            {randomWords.map(word => (<div onClick={(e) => ChooseWordFunction(e)}>{word}</div>))}
        </div>

        {/* Display the chosen word */}
        <h2>{theChosenWord}</h2>

        {/* Create canvas */}
        <canvas ref={canvasRef} id="canvas" hidden

        // Eventlisteners for mouse-events
        onMouseDown={() => isPainting = true} 
        onMouseMove={(e) => isPainting ? Draw(e) : ""}
        />

        {/* Eventlistener for color-container */}
        <div onClick={(e) => ChosenColor(e)} style={{display: 'none'}} ref={colorBoxRef} id="colorBoxContainer">
            {colors.map((color) => (<div id={color} className="colorBox" style={{backgroundColor: color}}></div>))}
        </div>

        {/* Choose size of pen */}
        <div onClick={(e) => ChoosePenSize(e)} id="penSize" ref={penRef}>
            <div id="thin-2" ></div>
            <div id="medium-4"></div>
            <div id="thick-6"></div>
        </div>

        <button onClick={ClearCanvas}>Clear canvas</button>

    </div> );
}
 
export default Canvas;