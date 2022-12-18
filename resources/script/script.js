//Declare variables
var model = undefined;
const spin = document.getElementsByClassName('spinner-border')[0];
const grow = document.getElementsByClassName('spinner-grow')[0];
const displayDiv = document.getElementById('display-div');
const displayImage = document.getElementById('display-image')
const newStatus = document.getElementById('newStatus');
let newArray = []
let arrayOutput = [];
let array1 = []          

//import the movenet model
const MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
let movenet = null;
//Generate random color for highlighter background incase multiple objects are detected
function colorGenerator(){
  let color = '#'
  let array1 = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
  for (let i =0; i<6;i++) {
      color+=array1[Math.floor(Math.random(i)*16)]
  };
  return color
}
//Read the image file
const image_input = document.querySelector("#image-input");
image_input.addEventListener("change", function() {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const uploaded_image = reader.result;
    displayImage.src = uploaded_image;
    grow.classList.remove('invisible');
    if(newArray.length > 0){
      const predictions = document.querySelectorAll('.predictions');
      const positions = document.querySelectorAll('.positions');
      const highlight = document.querySelectorAll('.highlighter');
      array1 = []
      predictions.forEach((item)=> displayDiv.removeChild(item));
      positions.forEach((item)=> displayDiv.removeChild(item));
      highlight.forEach((item)=>  displayDiv.removeChild(item))
    }
    setTimeout(()=>{
      imageDetector(displayImage)
    },5000)
  });
  reader.readAsDataURL(this.files[0]);
  

});
//load the cocossd model
cocoSsd.load().then(function (loadedModel){
  model = loadedModel;
  newStatus.innerText = 'Tensorflow model loaded - Version ' + tf.version.tfjs
  displayDiv.classList.remove('invisible');
  spin.classList.add('invisible');
})


function imageDetector(image){
  model.detect(image).then(predictions=>{
    if(predictions.length > 0) {
    for(let i = 0; i < predictions.length; i++){
      let color = colorGenerator();
      grow.classList.add('invisible');
      const text = document.createElement('p')
      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      text.setAttribute('class', 'predictions')
      text.style = `background: ${color};`
      highlighter.style = `left: ${predictions[i].bbox[0]}px;
      top: ${5+predictions[i].bbox[1]}px;
      width: ${predictions[i].bbox[2]}px;
      height: ${50+predictions[i].bbox[3]}px;
      background: ${color};
      position: absolute
      `;
      newArray.push(1)
      displayDiv.appendChild(text);
      displayDiv.appendChild(highlighter);
      if(predictions[i].score > 0.6){
        text.innerText = predictions[i].class + ' with ' + Math.round(parseFloat(predictions[i].score)*100)+'% confidence';
        if(predictions[i].class==='person'){
          async function loadAndRunModel() {
          movenet = await tf.loadGraphModel(MODEL_PATH, {fromTFHub: true});
          let imageTensor = tf.browser.fromPixels(image);
          let cropSize;
          //first value is the starting y-coordinate, then x-coordinate, the 0 for red channel
          let cropStartPoint = [parseInt(predictions[i].bbox[1]),parseInt(predictions[i].bbox[0]), 0];
          //convert a rectangle into a square by resizing using the height or width attribute depending on which is larger.
          if(imageTensor.shape[0] > imageTensor.shape[1]){
             cropSize = [parseInt(predictions[i].bbox[2]), parseInt(predictions[i].bbox[2]), 3];
             array1.push(1)
          }
          else{
             cropSize = [parseInt(predictions[i].bbox[3]+50), parseInt(predictions[i].bbox[3]+50), 3];
          }
          croppedTensor = tf.slice(imageTensor, cropStartPoint, cropSize);

          let resizedTensor = tf.image.resizeBilinear(croppedTensor, [192, 192], true).toInt();
          let tensorOutput = movenet.predict(tf.expandDims(resizedTensor));
          arrayOutput = await tensorOutput.array();



          for(let j = 0; j < arrayOutput[0][0].length; j++){
            if(arrayOutput[0][0][j][2] > 0.4){
            const newDiv = document.createElement('div');
            newDiv.setAttribute('class', 'positions');
            if(array1.length > 0){
              newDiv.style = `background: ${color};
              left: ${arrayOutput[0][0][j][1]*parseInt(predictions[i].bbox[2])+parseInt(predictions[i].bbox[0])-3}px;
              top: ${arrayOutput[0][0][j][0]*parseInt(predictions[i].bbox[2])+parseInt(predictions[i].bbox[1])+12}px;`
              displayDiv.appendChild(newDiv);
            }
            else{
            newDiv.style = `background: ${color};
            left: ${arrayOutput[0][0][j][1]*parseInt(predictions[i].bbox[3]+50)+parseInt(predictions[i].bbox[0])-3}px;
            top: ${arrayOutput[0][0][j][0]*parseInt(predictions[i].bbox[3]+50)+parseInt(predictions[i].bbox[1])+12}px;`
            displayDiv.appendChild(newDiv);
            }
          }
        }
  }
  loadAndRunModel()
        }
  }
  else{
        text.innerText = `possibly ${predictions[i].class} with ${Math.round(parseFloat(predictions[i].score)*100)} % confidence`;
  }
}
    }
  else{
    const text = document.createElement('p');
    text.innerText = 'Can\'t make any predictions right now, please try again with another picture. '
    text.style = `background: ${colorGenerator()};`
    newArray.push(1);
    text.setAttribute('class', 'predictions')
    displayDiv.appendChild(text);
    grow.classList.add('invisible');

  }
  })
}
//clean up used ten
if(arrayOutput.length > 0){
  tf.tidy(loadAndRunModel)
}