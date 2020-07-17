var actionSet = [0, 0, 0];
var currAction = -1;

var cellLookupTable = [null, 6, 7, 8, 3, 4, 5, 0, 1, 2];

$(document).ready(function() {
	// Our data object
	var sudokuGrid = { grid: [] }

	// The object is added to a Vue instance
	var vm = new Vue({
	  el: '#main-cnt',
	  data: {
		sudokuGrid,
		isGridVisible: false
	  },
	  methods: {
	     showGrid: function(difficulty) {
			this.isGridVisible = true;
			// TODO: add logic for making different grids based on difficulty
	     }
	   }
	});

	// Fill in a starting sudoku grid
	fillSudokuGrid("14.7...6985.6.31....3..4..53.....71.2..1.5..4.91.....85..8..9....65.7.8372...1.56");

	// This function outlines the core mechanic of Numpad Sudoku
	// (will probably move it to a separate function soon)
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

			if(currAction == 1) {
				clearActionSet();
			}
			else if(currAction == 2) {
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

	// Only change the cell's value if it is not a pre-filled cell (clue)
	if(!$(cell).hasClass("clue"))
		$(cell).text(value);

	clearActionSet();
}

function clearActionSet() {
	clearHighlight();

	actionSet = new Array(3);
	currAction = -1;
}

/**
 * Fills the sudoku grid from a string that lists the cells to be filled in
 * (clues) and the ones to be left empty (I will call them "blanks").
 *     Example string (one row only): "1..4.67.9"
 * The entire grid is represented in one string, with no separating character
 * between the rows or boxes, so the string should be 81 characters long.
 *
 * Note: format may be changed later, as I have not yet decided how to store
 *       the puzzles before they are loaded on the page (I do not want to
 *       randomly generate them every time, as this would require validation
 *       of whether the puzzles have unique solutions).
 *
 * @param  {string} gridString - string of clues and blanks in format described above
 */
function fillSudokuGrid(gridString) {
	$("td").each(function(index) {
		currValue = gridString.charAt(index);

		if(currValue != '.')
			$(this).text(currValue).addClass("clue");
		else
			$(this).text(null).removeClass("clue");
	});
}