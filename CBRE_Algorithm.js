//Variables 
var allCombinations = [];

// maximum storage of each floor
var floorSizes = [43, 81, 73, 54, 97];

// the population of each team
var groupSizes = [22, 45, 34, 51, 11, 37, 42, 16, 29, 56, 49];

// a list of each team's preferred teams
var groupPreferred = [[1,3,7,10],[0,2,4],[0,1,10],[9],[0,1,2,3],[6,9],[0,1,2,3,4,5],[0,9],[0,4],[1,5,6,10],[0,3,4]];

// a list of each team's tolerated teams
var groupTolerated = [[2,7,9],[5,6,10],[6],[0,2],[8,9,10],[0,7],[9,10],[1,3,10],[1,9],[3,4,7],[1,2,5,6,8,9]];

// a list of each team's no way teams
var groupNo = [[4,6,8],[3,7,8,9],[3,4,5,7,8,9],[1,4,5,6,7,8,10],[5,6,7],[1,2,3,4,8,10],[7,8],[2,4,5,6,8],[2,3,5,6,7,10],[0,2,8],[7, -1]];

// produces every possible combination of groups
function combinationUtil(arrayOfGroups,data,start,end,index,groupsPerCombination, out, removeHaters)
{
    // Current combination is ready to be printed, print it
    if (index == groupsPerCombination)
    {
        if(removeHaters) { //optional: removes all lists that have haters together
            for(var groupIndex = 0; groupIndex < data.length; groupIndex++) {
                for(var otherGroupIndex = 0; otherGroupIndex < groupNo[data[groupIndex]].length; otherGroupIndex++) {
                    if(groupNo[data[groupIndex]].includes(data[otherGroupIndex])) {
                        return;
                    }
                }
            }
        }
        
        out.push(data.slice(0, groupsPerCombination)); 
    }
        
    // replace index with all possible elements. The condition
    // "end-i+1 >= groupsPerCombonation-index" makes sure that including one element
    // at index will make a combination with remaining elements
    // at remaining positions
    for (let i=start; i<=end && end-i+1 >= groupsPerCombination-index; i++)
    {
        data[index] = arrayOfGroups[i];
        combinationUtil(arrayOfGroups, data, i+1, end, index+1, groupsPerCombination, out, removeHaters);
    }
}

function clearImpossibleFloors(allCombos){
    //assigns team groups to floors that they that fit on
    possibleCombos = [[],[],[],[],[]];

    for (b = 0; b < 5; b++) {
        for (i = allCombos.length-1; i >= 0; i--) {
            var sum = 0;
            for(j = 0; j < allCombos[i].length; j++) {
                sum += groupSizes[allCombos[i][j]];
            }
            if(sum <= floorSizes[b] && sum >= floorSizes[b]*0.25) {
                possibleCombos[b].push(allCombos[i]);
            }
        } 
    }
    return possibleCombos;
}

//var possibleCombinationsByFloor = [[],[],[],[],[]];
//possibleCombinationsByFloor = clearImpossibleFloors(allCombinations);

function checkForDuplicates(arrayToCheck) {
    // takes an array and returns true if there is a duplicate value in it
    var RepeatsRemoved = new Set(arrayToCheck);
    return (RepeatsRemoved.size != arrayToCheck.length);
}

// pCBF == possible combinations by floor
function CreateFullBuildings (pCBF) {
    // creates a list of buildings (list of floors) that do not have any duplicate floors
    var holder = [];
    for (var a = 0; a < pCBF[0].length; a++) {
        var blankArray = [];
        var completeComboUsedGroups = blankArray.concat(pCBF[0][a]);
        if (checkForDuplicates(completeComboUsedGroups)) {
            continue; // if there is a duplicate team on another floor the loop continues to the next value
        }
        for (var b = 0; b < pCBF[1].length; b++) {
            var blankArray = [];
            var completeComboUsedGroups = blankArray.concat(pCBF[0][a],pCBF[1][b]);
            if (checkForDuplicates(completeComboUsedGroups)) {
                continue;
            }
            for (var c = 0; c < pCBF[2].length; c++) {
                var blankArray = [];
                var completeComboUsedGroups = blankArray.concat(pCBF[0][a],pCBF[1][b],pCBF[2][c]);
                if (checkForDuplicates(completeComboUsedGroups)) {
                    continue;
                }
                for (var d = 0; d < pCBF[3].length; d++) {
                    var blankArray = [];
                    var completeComboUsedGroups = blankArray.concat(pCBF[0][a],pCBF[1][b],pCBF[2][c],pCBF[3][d]);
                    if (checkForDuplicates(completeComboUsedGroups)) {
                        continue;
                    }
                    for (var e = 0; e < pCBF[4].length; e++) {
                        var blankArray = [];
                        var completeComboUsedGroups = blankArray.concat(pCBF[0][a],pCBF[1][b],pCBF[2][c],pCBF[3][d],pCBF[4][e]);
                        if (checkForDuplicates(completeComboUsedGroups)) {
                            continue;
                        }
                        holder.push([pCBF[0][a],pCBF[1][b],pCBF[2][c],pCBF[3][d],pCBF[4][e]]);
                        //console.log(checkForDuplicates(completeComboUsedGroups));
                    }   
                }
            }
        }
    }
    return holder;
}

//var allFullBuildings = CreateFullBuildings(possibleCombinationsByFloor);

function ScoreBuilding(building, houseMult, prefMult, hateMult, tolMult) {
    // gives a score for each building
    var score = 0;
    var PeopleHoused = 0;
    var PeopleHappy = 0;
    var PeopleAngry = 0;
    var PeopleTolerant = 0;
    for(var floor = 0; floor < 5; floor++) {
        for(var group=0; group < building[floor].length; group++) {
            score += houseMult*groupSizes[building[floor][group]];
            PeopleHoused += groupSizes[building[floor][group]];
            
            for(var lovers=0; lovers<groupPreferred[building[floor][group]].length;lovers++) {
                if(building[floor].includes(groupPreferred[building[floor][group]][lovers])) {
                    score += prefMult*groupSizes[building[floor][group]];
                    PeopleHappy += groupSizes[building[floor][group]];
                }
            }
            for(var haters=0; haters<groupNo[building[floor][group]].length;haters++) {
                if(building[floor].includes(groupNo[building[floor][group]][haters])) {
                    score += hateMult*groupSizes[building[floor][group]];
                    PeopleAngry += groupSizes[building[floor][group]];
                }
            }
            for(var tolerators=0; tolerators<groupNo[building[floor][group]].length;tolerators++) {
                if(building[floor].includes(groupTolerated[building[floor][group]][tolerators])) {
                    score += tolMult*groupSizes[building[floor][group]];
                    PeopleTolerant += groupSizes[building[floor][group]];
                }
            }
        }
    }
    return {"score":score, "PeopleHoused":PeopleHoused,"PeopleHappy":PeopleHappy,"PeopleAngry":PeopleAngry,"PeopleTolerant":PeopleTolerant};
}

function ChooseIdealBuilding(allBuildings, houseMult, prefMult, hateMult, tolMult) {
    // selects the best building based on scores
    var TopBuildingScore = -1;
    var TopBuilding;
    var PeopleHoused = 0;
    var PeopleHappy = 0;
    var PeopleAngry = 0;
    var PeopleTolerant = 0;
    for(var cc = 0; cc < allBuildings.length; cc++) {
        BuildingData = ScoreBuilding(allBuildings[cc], houseMult, prefMult, hateMult, tolMult);
        var NewBuildingScore = BuildingData["score"];
        //console.log(NewBuildingScore);
        if (NewBuildingScore > TopBuildingScore) {
            TopBuilding = allBuildings[cc];
            TopBuildingScore = NewBuildingScore;
            PeopleHoused = BuildingData["PeopleHoused"];
            PeopleHappy = BuildingData["PeopleHappy"];
            PeopleAngry = BuildingData["PeopleAngry"];
            PeopleTolerant = BuildingData["PeopleTolerant"];
        }
    }
    return {"Best Building": TopBuilding, "Workers Housed": PeopleHoused, "Workers Happy": PeopleHappy, "Workers Angry": PeopleAngry, "Workers Tolerant": PeopleTolerant};
}