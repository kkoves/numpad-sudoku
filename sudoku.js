var actionSet = [0, 0, 0];
var currAction = -1;

var cellLookupTable = [null, 6, 7, 8, 3, 4, 5, 0, 1, 2];

$(document).ready(function() {
	$(document).keypress(function(e) {
		// 1-9 are used to select a block or cell, or to fill a cell
		if(e.key >= 1 && e.key <= 9) {
			currAction++;
			clearHighlight();

			if(currAction == 0) {
				actionSet[0] = e.key;
				highlightBlock(e.key);
			}
			else if(currAction == 1) {
				actionSet[1] = e.key;
				highlightCell(actionSet.slice(0, 2));
			}
			else if(currAction == 2) {
				actionSet[2] = e.key;
				writeValueToCell(actionSet.slice(0, 2), actionSet[2]);
			}
		}
		// 0 will be used to clear the value of a cell on the grid, or to cancel an action set
		else if(e.key == 0) {
			currAction++;

			if(currAction == 1)
				clearActionSet();

			if(currAction == 2) {
				actionSet[2] = e.key;
				writeValueToCell(actionSet.slice(0, 2), actionSet[2]);
			}
		}
		// The period (.) key will be used to cancel an action set
		else if(e.key == ".") {
			clearActionSet();
		}
	});
});

function highlightBlock(blockNumber) {
	$(".square" + blockNumber).addClass("highlighted");
}

function highlightCell(coordinates) {
	var selector = ".square" + coordinates[0];
	var block = $(selector);
	var index = cellLookupTable[coordinates[1]];

	var cell = block[index];

	$(cell).addClass("highlighted");
}

function clearHighlight() {
	$(".highlighted").removeClass("highlighted");
}

function writeValueToCell(coordinates, value) {
	var selector = ".square" + coordinates[0];
	var block = $(selector);
	var index = cellLookupTable[coordinates[1]];

	var cell = block[index];

	// Null value will clear the cell when 0 key has been pressed
	if(value == 0)
		value = null;

	$(cell).text(value);

	clearActionSet();
}

function clearActionSet() {
	clearHighlight();

	actionSet = new Array(3);
	currAction = -1;
}