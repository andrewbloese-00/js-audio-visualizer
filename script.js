const FFT_SIZE = 256
var ctxAudio = null
var playing = false

function mid(a,b){
    return (a + b) / 2 
}

function within(i,interval){
    return i && i <= interval[1] && i >= interval[0]
}

const COLORS = {
    DEEPRED: "#4d0000",
    RED: "#f00c0c",
    ORANGE: "#ff7300",
    GOLD: "#ffd000",
    YELLOW: "#ffea00",
    GREEN: "#37ff00",
    AQUAMARINE:"#00ffc3",
    BLUE: "#2651ed",
    PURPLE: "#9900ff",
    DEEPPURPLE: "#5d009c"
}
const $colors = new Map()

function getColor(bucketIdx,n){

    const categoryMax = (v)=>{
        return Math.floor((v/100)*n)
    }
    let c = "#fff";
    //cache to reduce comparisons
    if($colors.has(bucketIdx)) return $colors.get(bucketIdx)

    if(within(bucketIdx,[0,categoryMax(10)])|| bucketIdx === 0){
        c= COLORS.DEEPRED
    }
    if(within(bucketIdx,[categoryMax(10),categoryMax(20)])){
        c= COLORS.RED
    }
    if(within(bucketIdx,[categoryMax(20),categoryMax(30)])){
        c= COLORS.ORANGE
    }
    if(within(bucketIdx,[categoryMax(30),categoryMax(40)])){
        c= COLORS.GOLD
    }
    if(within(bucketIdx,[categoryMax(40),categoryMax(50)])){
        c= COLORS.YELLOW
    }
    if(within(bucketIdx,[categoryMax(50),categoryMax(60)])){
        c= COLORS.GREEN
    }
    if(within(bucketIdx,[categoryMax(60),categoryMax(70)])){
        c= COLORS.AQUAMARINE
    }
    if(within(bucketIdx,[categoryMax(70),categoryMax(80)])){
        c= COLORS.BLUE
    }
    if(within(bucketIdx,[categoryMax(80),categoryMax(90)])){
        c= COLORS.PURPLE
    }
    if(within(bucketIdx,[categoryMax(90),categoryMax(100)])){
        c= COLORS.DEEPPURPLE
    }
    console.log(c)
    $colors.set(bucketIdx,c)
    return c

}

async function getStream(){
    let _stream;
    //get audio stream from microphone
    try {
        _stream = await navigator.mediaDevices.getUserMedia({video: false, audio: true, })
        return {stream: _stream, error: false}
    } catch (error) {
        console.warn("failed to get audio stream");
        console.error(error)
        return { stream: false, error: error.message||error}
    } 

}


async function main(){
    const startButton = document.querySelector("#start"),
    stopButton = document.querySelector("#stop")

    startButton.addEventListener("click", e=>{
        startButton.style.display = "none"
        stopButton.style.display = "block"
        _init()
    })
    document.querySelector("#stop").addEventListener("click", e=>{
        startButton.style.display = "block"
        stopButton.style.display = "none"
        _pause()
    })
    
 
    

}



function getCanvas(){
    const canvas = document.querySelector('canvas')
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.background = "#000";
    
    const canvasCtx = canvas.getContext("2d");
    return {canvas,canvasCtx}
}


async function getAudioShit(){
    //create context
    if(!ctxAudio){
        ctxAudio = new AudioContext()
    }
    //create analyzer
    const analyzer = ctxAudio.createAnalyser()
    analyzer.fftSize = FFT_SIZE


    //get mic stream
    const micInput = await getStream()
    if(!micInput.stream){
        return console.error(micInput.error)
    }
    const mic = ctxAudio.createMediaStreamSource(micInput.stream)
    mic.connect(analyzer)
    return { analyzer, mic}
}

const { canvas , canvasCtx } = getCanvas()
var binWidth = canvas.width / (FFT_SIZE/ 2)
window.addEventListener("resize",(ev)=>{
    canvas.width = window.innerWidth,
    canvas.height = window.innerHeight
    let n = FFT_SIZE / 2
    binWidth =  canvas.width / n;

    
})
async function _pause(){
 playing = false;
}

async function _init(){
    //get the canvas 
    playing = true;
    const { analyzer , mic  } = await getAudioShit()
    const numBins = analyzer.fftSize /2

    if(!analyzer || !mic ) return false
    //initialize an array to hold the frequency values 
    var audio_data = new Uint8Array(numBins);
    function play(){
        //clear the canvas
        if(!playing) return
        canvasCtx.clearRect(0,0, canvas.width, canvas.height);
        //get frequency values
        analyzer.getByteFrequencyData(audio_data);
        
        for(let i = 0; i < numBins; i++){
            //get the appropriate color
            const color = getColor(i,numBins);
            canvasCtx.fillStyle = color;
            //get the x pos of the bar
            const [x,y] = [
                i * binWidth, 0.0
            ]


            //top down
            canvasCtx.fillRect(x,y,binWidth, (audio_data[i] * 2.5) + 20);


        }
        requestAnimationFrame(play);
    }
    play()

}
main()

