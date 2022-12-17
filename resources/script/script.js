//Declare variables
var model = undefined;
const spin = document.getElementsByClassName('spinner-border')[0];
const grow = document.getElementsByClassName('spinner-grow')[0];
const displayDiv = document.getElementById('display-div');
const displayImage = document.getElementById('display-image')
const newStatus = document.getElementById('newStatus');
//Generate random color for highlighter background incase multiple objects are detected
let newArray = []
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
      const highlight = document.querySelectorAll('.highlighter');
      predictions.forEach((item)=> displayDiv.removeChild(item));
      highlight.forEach((item)=>  displayDiv.removeChild(item))
    }
    setTimeout(()=>{
      imageDetector(displayImage)
    },5000)
  });
  reader.readAsDataURL(this.files[0]);
  

});

cocoSsd.load().then(function (loadedModel){
  model = loadedModel;
  newStatus.innerText = 'Tensorflow model loaded - Version ' + tf.version.tfjs
  displayDiv.classList.remove('invisible');
  spin.classList.add('invisible');
})


function imageDetector(image){
  model.detect(image).then(predictions=>{
    console.log(predictions)
    if(predictions.length > 0) {
    for(let i = 0; i < predictions.length; i++){
      let color = colorGenerator();
      grow.classList.add('invisible');
      const text = document.createElement('p')
      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      text.setAttribute('class', 'predictions')
      text.style = `background: ${color};`
      highlighter.style = `left: ${25+predictions[i].bbox[0]}px;
      top: ${15+predictions[i].bbox[1]}px;
      width: ${predictions[i].bbox[2]}px;
      height: ${50+predictions[i].bbox[3]}px;
      background: ${color};
      position: absolute
      `;
      newArray.push(1)
      displayDiv.appendChild(text);
      displayDiv.appendChild(highlighter);
      if(predictions[i].score > 0.5){
        text.innerText = predictions[i].class + ' with ' + Math.round(parseFloat(predictions[i].score)*100)+'% confidence';
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