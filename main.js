// command guide:
// up, down, left, right - to move on the map
// hp - check current hp
// prize - check current prize count
// exit - short-circuit the program

//try adding angular later for a better front end than raw css

//to aid in debugging
"use strict";

//USE EOT TO LIST UPDATED INFO

var MAX_WALLS = 7;
var MAX_ROWS = 8;
var MAX_COLS = 8;
var EXIT_FLAG = 0;
var CHALLENGE_WAIT = 0; //flag to wait to start challenge or not
var CHALLENGE_CONT = 0; //flag to continue challenge or not

//generalize challenge function

var adventurer = {
  first_move : true,
  on_tile : 'S',
  hp : 10,
  damage : 1,
  cur_pos : ['', ''], //cur_pos = row, col
  inventory : {}, //originally empty object
  prize : 0,
  map : [
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+'],
    ['+', '+', '+', '+', '+', '+', '+', '+']
  ],
  addToInventory : function(item, inventory = adventurer.inventory) {
    inventory.item = item;
  },
  updateMap : function(row, col, tile, map = adventurer.map) {
    map[row][col] = tile;
  },
  viewMap : function(map = adventurer.map) {
    for(var i = 0; i < 8; i++) {
      var output = '';
      for(var j = 0; j < 8; j++) {
        switch(map[i][j]) {
          case '':
            output += 'X ';
            break;
          case '+':
            output += '+ ';
            break;
          case 'C':
            output += 'C ';
            break;
          case 'W':
            output += 'W ';
            break;
          case 'O':
            output += 'O ';
            break;
          case 'G':
            output += 'G ';
            break;
          case 'S':
            output += 'S ';
            break;
          case 'P':
            output += 'P ';
            break;
        }
      }
      printText(output);
    }
  },
  viewInventory : function(inventory = adventurer.inventory) {
    //list members of inventory map
  }
}

//master map
var map = [
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '']
];

var treasurePile = ['iron_sword', 'cozy_hat', 'one_gold_coin', 'potion'];

//rebuild askContinue in order to keep the skeleton and slime objects
//functioning
var askContinue = function(cont, challengeM) {
  switch(cont) {
    case 'yes':
      challengeM();
      break;
    default:
      printText('You flee from the battle');
      CHALLENGE_CONT = 0;
      break;
  }
}

var skeleton = {
  name : 'skeleton',
  hp : 3,
  damage : 2,
  challenge : function() {
    var dieRoll = 0;

    dieRoll = randomNum(10);
    if(dieRoll > 3) { //adventurer hits
      skeleton.hp -= adventurer.damage;
      printText('You punch for ' + adventurer.damage + ' damage');
      printText('The skeleton now has ' + skeleton.hp + ' hp left.');
    }
    else { //skeleton hits
      adventurer.hp -= skeleton.damage;
      printText('The skeleton slashes for ' + skeleton.damage + ' damage');
      printText('You now have ' + adventurer.hp + ' hp left.');
    }

    if(skeleton.hp <= 0) {
      printText('You slay the skeleton');
      rollPrize();
      endOfTurn();
      adventurer.on_tile = 'P';
      CHALLENGE_CONT = 0;
    }
    else if(adventurer.hp <= 0) {
      CHALLENGE_CONT = 0;
      gameOver();
    }

  }
}

var slime = {
  name : 'slime',
  hp : 1,
  damage : 1,
  challenge : function() {
    var dieRoll = 0;

    dieRoll = randomNum(10);
    if(dieRoll >= 9) { //adventurer hits
      slime.hp -= adventurer.damage;
      printText('You punch for ' + adventurer.damage + ' damage');
      printText('The slime now has ' + slime.hp + ' hp left.');
    }
    else { //skeleton hits
      adventurer.hp -= slime.damage;
      printText('The slime splashes for ' + slime.damage + ' damage');
      printText('You now have ' + adventurer.hp + ' hp left.');
    }

    if(slime.hp <= 0) {
      printText('You slay the slime');
      rollPrize();
      endOfTurn();
      adventurer.on_tile = 'P';
      CHALLENGE_CONT = 0;
    }
    else if(adventurer.hp <= 0) {
      CHALLENGE_CONT = 0;
      gameOver();
    }

  }
}

var gameOver = function() {
  printText('You failed to clear the challenge');
  printText('GAME OVER');
  EXIT_FLAG = 1;
}

//redundant and can probably remove
var printMap = function(map) {
  for(var i = 0; i < 8; i++) {
    var output = '';
    for(var j = 0; j < 8; j++) {
      switch(map[i][j]) {
        case '':
          output += 'X ';
          break;
        case 'C':
          output += 'C ';
          break;
        case 'W':
          output += 'W ';
          break;
        case 'O':
          output += 'O ';
          break;
        case 'G':
          output += 'G ';
          break;
        case 'S':
          output += 'S ';
          break;
        case 'P':
          output += 'P ';
          break;
      }
    }
    printText(output);
  }
}

//wrapper to avoid typing <p></p> all the time
var printText = function(text) {
  // document.body.innerHTML += '<p>' + text + '</p>';
  $("body").append("<p>" + text + "</p>");
  window.scrollTo(0,document.body.scrollHeight);
}

var randomNum = function(max) {
  return parseInt(Math.random() * max);
}

var placeObjectives = function(map) {
  populateWalls(map);
  placeStart(map);
  placeExit(map);
  placePrizes(map);
  placeChallenges(map);
}

var populateWalls = function(map) {
  var wallCount = 0;
  var row = 0;
  var col = 0;
  while(wallCount < MAX_WALLS) {
    row = randomNum(MAX_ROWS - 1);
    col = randomNum(MAX_COLS - 1);
    if((row != 0 && col != 0) && (row != 7 && col != 7)) {
      map[row][col] = 'W';
    }
    wallCount++;
  }

  //return void;
}

var placeStart = function(map) {
  var row = 0;
  var col = 0;
  var tile = '';

  do {
    row = randomNum(7);
    col = randomNum(7);
    tile = map[row][col];
  } while(tile == 'W');

  //place an 'O' where starting location is and switch to 'S' after player moves from it
  map[row][col] = 'O';
  adventurer.updateMap(row, col, 'O');
  adventurer.cur_pos = [row, col];
}

var placeExit = function(map) {
  var row = 0;
  var col = 0;
  var tile = '';

  do { //avoid collisions with walls the the player's starting location
    row = randomNum(7);
    col = randomNum(7);
    tile = map[row][col];
  } while(tile == 'W' || tile == 'O');

  //place an 'O' where starting location is and switch to 'S' after player moves from it
  // adventurer.updateMap(row, col, 'G');
  map[row][col] = 'G';
}

var placePrizes = function(map) {
  var row = 0;
  var col = 0;
  var tile = '';

  for(var i = 0; i < 2; i++) {
    do { //avoid collisions with walls the the player's starting location
      row = randomNum(7);
      col = randomNum(7);
      tile = map[row][col];
    } while(tile == 'W' || tile == 'O' || tile == 'G');

    //place an 'O' where starting location is and switch to 'S' after player moves from it
    map[row][col] = 'P';
  }

}

var placeChallenges = function(map) {
  var row = 0;
  var col = 0;
  var tile = '';

  for(var i = 0; i < 4; i++) {
    do { //avoid collisions with walls the the player's starting location
      row = randomNum(7);
      col = randomNum(7);
      tile = map[row][col];
    } while(tile == 'W' || tile == 'O' || tile == 'G' || tile == 'P');

    //place an 'O' where starting location is and switch to 'S' after player moves from it
    map[row][col] = 'C';
  }
}

var isAtGoal = function() {
  if(adventurer.on_tile == 'G') {
    if(adventurer.prize >= 2) {
      printText('You arrive at the goal');
      EXIT_FLAG = 1;
      return 1;
    }
    else {
      printText('You do not have enough prizes to escape');
    }
  }
  return 0;
}

//clean up the logic here
var isValidMovement = function(nextRow, nextCol, map) {
    var nextIsWall = false;
    var validRow = (nextRow > -1 && nextRow < 8);
    var validCol = (nextCol > -1 && nextCol < 8);

    if(validRow && validCol) {
      nextIsWall = (map[nextRow][nextCol] == 'W');
    }
    else {
      return false;
    }

    if(!nextIsWall) {
      return true;
    }

    //the next space is a wall and not a valid movement
    adventurer.updateMap(nextRow, nextCol, 'W');

    return false;
}

var move = function(direction) {
  var coord = adventurer.cur_pos;
  var nextRow = coord[0];
  var nextCol = coord[1];
  var garbage = false; //flag for garbage input
  var whereTo = '';
  var tile = '';

  switch(direction) {
    case 'left':
      nextCol -= 1;
      whereTo = 'west';
      break;
    case 'right':
      nextCol += 1;
      whereTo = 'east';
      break;
    case 'up':
      nextRow -= 1;
      whereTo = 'north';
      break;
    case 'down':
      nextRow += 1;
      whereTo = 'south';
      break;
    default: //throw out bad input
      garbage = true;
      break;
  }

  if(isValidMovement(nextRow, nextCol, map) && !garbage) {

    if(adventurer.first_move == true) {
      map[coord[0]][coord[1]] = 'S';
      adventurer.updateMap(coord[0], coord[1], 'S');
      adventurer.first_move = false;
    }
    else {
      if(adventurer.on_tile == 'P') {
        adventurer.on_tile = ''; //erase prizes from the map
      }

      map[coord[0]][coord[1]] = adventurer.on_tile;
      adventurer.updateMap(coord[0], coord[1], adventurer.on_tile);
    }

    tile = map[nextRow][nextCol];
    adventurer.on_tile = tile;

    adventurer.cur_pos = [nextRow, nextCol];
    map[nextRow][nextCol] = 'O';
    adventurer.updateMap(nextRow, nextCol, 'O');

    //improve upon this text
    printText('You walk to the ' + whereTo);

    if(tile == 'P') {
      //prize func
      rollPrize();
    }
    else if(tile == 'C') {
      //start waiting for an input of y or no for challenge
      CHALLENGE_WAIT = 1;
      printText('You sense something around the corner'
        + ' would you like to check it out? (y or n)');
    }
  }
  else {
    if(nextRow >= 0 && nextRow <= 7
      && nextCol >=0 && nextRow <= 7) {
      adventurer.updateMap(nextRow, nextCol, 'W');
    }
    printText('You can\'t go there');
  }

}

var challengeStart = function(choice) {
  switch(choice) {
    case 'yes':
      printText('You start the challenge');
      // determineChallenge();
      break;
    case 'no':
      printText('You decided not to start the challenge');
      break;
  }

}

var endOfTurn = function() {
  printText('End of turn. Updated stats:');
  printText('You currently have ' + adventurer.hp + ' hp left.');
  printText('You currently have ' + adventurer.prize + ' prize(s)');
  adventurer.viewMap();
}

var turn = function(direction) {
  move(direction);

  if(CHALLENGE_WAIT) {
    //NO-OP
  }
  else if(CHALLENGE_CONT) {
    //NO-OP
  }
  else if(CHALLENGE_WAIT == 0 && CHALLENGE_CONT == 0) {
    endOfTurn();
  }
}

var determineChallenge = function() {
  var choice = randomNum(100);

  CHALLENGE_CONT = 1;

  //create resurrect fcn to re-use same object
  if(choice >= 70) {
    skeleton.hp = 3;
    return skeleton;
  }
  else {
    slime.hp = 1;
    return slime;
  }

}

var rollPrize = function() {
  var item = treasurePile[randomNum(3)];
  printText('And find a ' + item + '!');
  printText('You now have ' + (++(adventurer.prize)) + ' prize(s).');
  adventurer.addToInventory(item);
}

//the current issue is the fact that our returned function from determineChallenge
//does not set challengeHolder to an actual type which causes some undefined behaviour
//if we can fix that part, then we should be able to have the game functioning as intended

//figure out how to return a function from a function
//i think the problem resides in the fact that we aren't returning a function properly
//so the definition gets lost and trying to call () on challengeHolder does nothing
var addListeners = function() {
  var challengeHolder;
  window.addEventListener('keydown', function(event) {
    // printText("movement detected");

    if(!EXIT_FLAG && !isAtGoal()) {
      // printText(event.keyCode);
      if(CHALLENGE_WAIT) {
        // printText('You encounter a challenge');
        // printText('Challenge wait: ' + CHALLENGE_WAIT);
        // printText('Challenge cont: ' + CHALLENGE_CONT);
        switch(event.keyCode) {
          case 89: //'y'
            CHALLENGE_WAIT = 0;
            challengeStart('yes');
            challengeHolder = determineChallenge();
            challengeHolder.challenge();
            if(challengeHolder.hp > 0 && adventurer.hp > 0) {
              printText('Would you like to continue the challenge?');
            }
            break;
          case 78: //'n'
            CHALLENGE_WAIT = 0;
            challengeStart('no');
            break;
          default:
            printText("That is not a valid choice");
            break;
        }
      }
      else if(CHALLENGE_CONT) {
        switch(event.keyCode) {
          case 89: //'y'
            challengeHolder.challenge();
            if(challengeHolder.hp > 0 && adventurer.hp > 0) {
              printText('Would you like to continue the challenge?');
            }
            break;
          case 78: //'n'
            CHALLENGE_CONT = 0;
            askContinue('no');
            break;
          default:
            printText("That is not a valid choice");
            break;
        }
      }
      else {
        switch(event.keyCode) {
          case 37: //LEFT
            turn("left");
            break;
          case 38: //UP
            turn("up");
            break;
          case 39: //RIGHT
            turn("right");
            break;
          case 40: //DOWN
            turn("down");
            break;
          case 76: //'l' - master map
            printMap(map);
            break;
          case 27: //esc - exit game
            EXIT_FLAG = 1;
            break;
        }
      }
    }
  });
}

var runGame = function() {
  var direction = '';

  placeObjectives(map);

  printText('You arrive in the dungeon');
  printText('You currently have ' + adventurer.hp + ' hp left.');
  printText('You currently have ' + adventurer.prize + ' prize(s)');
  adventurer.viewMap();

  //the game runs based upon interrupts now
  addListeners();
}

//the main game loop runs from runGame()
// runGame();
