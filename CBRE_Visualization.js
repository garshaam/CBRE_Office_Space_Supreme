var housingMultiplier = 1;
var preferredMultiplier = 1;
var hateMultiplier = -10;
var tolerateMultiplier = 0;

//There are 11 groups so we need to arrange them for all combos with 4 groups or less (impossible to fit more than that in any floors)
let groupIDs=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var allCombinations = [];

var possibleCombinationsByFloor = [[],[],[],[],[]];;

var allPossibleBuildings;

var analysisComplete = false;

//Canvas and drawing variables
var canvas;
var context;
var canvasSizeFraction = 0.49; //Percentage of the screen width the canvas should use
var canvasWidth;
var canvasHeight;

var canvasHolder;
var sizeFactor;

var bestBuilding;
var WorkersHoused;
var WorkersHappy;
var WorkersAngry;
const MaxCapacity = 348;
const TotalWorkers = 392;

var guys = [];

function PullUpTeamSettings(whichTeam) {
    var teamSettingsElements = document.getElementsByClassName("TeamSettings");
    for(var i =0; i < teamSettingsElements.length;i++) {
        teamSettingsElements[i].style.visibility = 'visible';
    }
    
}

function SetupCanvas() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d")
    sizeFactor = (document.body.clientWidth / 800) * canvasSizeFraction; 
    canvasHolder = document.getElementById("canvasHolder");
    canvasHolder.style.width = Math.floor(800 * sizeFactor) + "px";
    canvasHolder.style.height = Math.floor(700 * sizeFactor) + "px";
    canvas.width = Math.floor(800 * sizeFactor);
    canvas.height = Math.floor(700 * sizeFactor);
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    var numGuysLoaded = 0;
    
    //Setting up the guy sprites
    guys = [];
    for (var i = 1; i < 12; i++) {
        guys.push(new Image());
        guys[i-1].src = `guy${i}.png`;
        guys[i-1].onload = function() {
            numGuysLoaded += 1;
            //console.log(numGuysLoaded);
            //POTENTIAL BUG
            if (numGuysLoaded == 10) { //I don't know why this is 10 and not 11
                context.fillStyle = "white";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "black";
                context.beginPath();
                context.lineWidth = "4";
                
                context.fillStyle = "#c2c2c2";
                context.fillRect(0.1 * canvasWidth, 0.165*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.fillRect(0.1 * canvasWidth, 0.33*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.fillRect(0.1 * canvasWidth, 0.495*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.fillRect(0.1 * canvasWidth, 0.66*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.fillRect(0.1 * canvasWidth, 0.825*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);

                context.strokeStyle = "black";
                context.rect(0.1 * canvasWidth, 0.165*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.rect(0.1 * canvasWidth, 0.33*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.rect(0.1 * canvasWidth, 0.495*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.rect(0.1 * canvasWidth, 0.66*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.rect(0.1 * canvasWidth, 0.825*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
                context.stroke();
                context.fillStyle = "black";

                var numsToLetters = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E"}
                //console.log(numsToLetters[JSON.stringify(0)]);
                
                context.font = 65*sizeFactor + "px Arial";
                for(var floor=0; floor < 5; floor++) {
                    context.fillText(numsToLetters[floor], 0.03*canvasWidth, 0.27*canvasHeight+floor*0.165*canvasHeight);
                }
                for(i = 0; i < 11; i++) {
                    context.drawImage(guys[i], 0.725*canvasWidth, 0.07*(i+2.5)*canvasHeight,0.02*canvasWidth, 0.06*canvasHeight);
                    context.font = 30*sizeFactor + "px Arial";
                    context.fillText('Key:', 0.725*canvasWidth, 0.15*canvasHeight);
                    context.font = 15*sizeFactor + "px Arial";
                    context.fillText(` = Team ${i+1}`, 0.75*canvasWidth, 0.07*(i+3)*canvasHeight);
                }
            }
        }
    }
    /*
    //This relies on the DANGEROUS assumption that images load in order
    //It is better to count up all the callbacks until it hits 11 then draw
    guys[10].onload = function() {
        
    }*/
}

//Gives a delay long enough for DOM elements to update.
//https://forum.freecodecamp.org/t/how-to-make-js-wait-until-dom-is-updated/122067/3
function call_after_DOM_updated(fn)
{
    intermediate = function () {window.requestAnimationFrame(fn)}
    window.requestAnimationFrame(intermediate)
}

function RunAnalysis() {
    document.getElementById("my-button").innerHTML = "Loading...";

    call_after_DOM_updated(function() {
        //If possible buildings have been detected already, do not detect them again
        if (analysisComplete) {
            ReturnBestBuilding();
            DisplayResults();
            document.getElementById("my-button").innerHTML = "Run Analysis";
            return;
        }

        //var ignoreHaters = document.getElementById("checkbox").checked;
        var ignoreHaters = false;
        
        //We run the combinationUtil for combos of length 4, 3, 2, and 1 and put results into allCombinations
        combinationUtil(groupIDs, [], 0, groupIDs.length-1, 0, 4, allCombinations, ignoreHaters);
        combinationUtil(groupIDs, [], 0, groupIDs.length-1, 0, 3, allCombinations, ignoreHaters);
        combinationUtil(groupIDs, [], 0, groupIDs.length-1, 0, 2, allCombinations, ignoreHaters);
        combinationUtil(groupIDs, [], 0, groupIDs.length-1, 0, 1, allCombinations, ignoreHaters);

        possibleCombinationsByFloor = clearImpossibleFloors(allCombinations);

        console.log(possibleCombinationsByFloor);

        allPossibleBuildings = CreateFullBuildings(possibleCombinationsByFloor);

        analysisComplete = true;
        ReturnBestBuilding();
        DisplayResults();
        document.getElementById("my-button").innerHTML = "Run Analysis";
    });
}

function ReturnBestBuilding() {
    //PullUpTeamSettings(0);
    housingMultiplier = document.getElementById("slider1").value;
    preferredMultiplier = document.getElementById("slider2").value;
    hateMultiplier = document.getElementById("slider4").value; //slider is negative so don't need to flip
    tolerateMultiplier = document.getElementById("slider3").value;

    var FinalData = ChooseIdealBuilding(allPossibleBuildings, housingMultiplier, preferredMultiplier, hateMultiplier, tolerateMultiplier);
    bestBuilding = FinalData["Best Building"];
    WorkersHoused = FinalData["Workers Housed"];
    WorkersHappy = FinalData["Workers Happy"];
    WorkersAngry = FinalData["Workers Angry"];
    WorkersTolerant = FinalData["Workers Tolerant"];
    console.log(bestBuilding);
    // console.log("Workers Housed" + WorkersHoused);
    // console.log("Workers Happy" + WorkersHappy);
    // console.log("Workers Angry" + WorkersAngry);
    // console.log("Workers Tolerant" + WorkersTolerant);
}

function DisplayResults() {
    //context.fillText("Success!", 0.1 * canvasWidth, 0.1 * canvasHeight);
    
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.beginPath();
    context.lineWidth = "4";
    
    context.fillStyle = "#c2c2c2";
    context.fillRect(0.1 * canvasWidth, 0.165*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.fillRect(0.1 * canvasWidth, 0.33*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.fillRect(0.1 * canvasWidth, 0.495*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.fillRect(0.1 * canvasWidth, 0.66*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.fillRect(0.1 * canvasWidth, 0.825*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);

    context.strokeStyle = "black";
    context.rect(0.1 * canvasWidth, 0.165*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.rect(0.1 * canvasWidth, 0.33*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.rect(0.1 * canvasWidth, 0.495*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.rect(0.1 * canvasWidth, 0.66*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.rect(0.1 * canvasWidth, 0.825*canvasHeight, 0.5*canvasWidth, 0.165*canvasHeight);
    context.stroke();
    context.fillStyle = "black";

    var numsToLetters = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E"}
    
    
    context.font = 35*sizeFactor + "px Arial";
    context.fillText(`${WorkersHoused}/${MaxCapacity} = ${Math.round(100*WorkersHoused/MaxCapacity)}% Filled`, 0.03*canvasWidth, 0.05*canvasHeight);
    context.font = 20*sizeFactor + "px Aria ";
    context.fillText(`${WorkersHappy} Worker synergies`, 0.035*canvasWidth, 0.09*canvasHeight);
    context.fillText(`${WorkersTolerant} Worker tolerances`, 0.035*canvasWidth, 0.14*canvasHeight);
    context.fillText(`${WorkersAngry} Worker conflicts`, 0.335*canvasWidth, 0.09*canvasHeight);
    
    for(i = 0; i < 11; i++) {
        context.drawImage(guys[i], 0.725*canvasWidth, 0.07*(i+2.5)*canvasHeight,0.02*canvasWidth, 0.06*canvasHeight);
        context.font = 30*sizeFactor + "px Arial";
        context.fillText('Key:', 0.725*canvasWidth, 0.15*canvasHeight);
        context.font = 15*sizeFactor + "px Arial";
        context.fillText(` = Team ${i+1}`, 0.75*canvasWidth, 0.07*(i+3)*canvasHeight);
    }
    
    context.font = 65*sizeFactor + "px Arial";
    for(var floor=0; floor < 5; floor++) {
        context.fillText(numsToLetters[floor], 0.03*canvasWidth, 0.27*canvasHeight+floor*0.165*canvasHeight);
        if (!bestBuilding) {
            continue;
        }
        for(var groupIndex=0; groupIndex < bestBuilding[floor].length; groupIndex++) {
            context.drawImage(guys[bestBuilding[floor][groupIndex]], 0.15*canvasWidth+groupIndex*0.1*canvasWidth, 0.185*canvasHeight+floor*0.165*canvasHeight, 0.04*canvasWidth, 0.12*canvasHeight);
        }
    } 
    
    
    
}
