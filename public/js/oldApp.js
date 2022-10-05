// import './App.css';
// import { useState, useEffect } from 'react';
// import Canvas from './components/Canvas';

// function App() {
//   const ws = new WebSocket("ws://localhost:8080");
//   ws.onclose = (evt) => console.log("closing", evt);
//   ws.onopen = (evt) => console.log("open", evt);
//   ws.onmessage= (evt) => console.log("message", evt);

//   const [arrOfWords, setArrOfWords] = useState([])

//   useEffect(() => {
//     fetch('motive.json')
//     .then((response) => response.json())
//     .then((data) => setArrOfWords(data))
//     .catch(err => console.log(err))
//   }, [])

//   useEffect(() => {
//     if (arrOfWords.length > 0) {
//     console.log(arrOfWords)

//     }
//   }, [arrOfWords])


//   return (
//     <div className="App">
//       <Canvas obj={arrOfWords}/>
//     </div>
//   );
// }

// export default App;
