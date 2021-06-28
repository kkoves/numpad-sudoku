	// TODO: might make actionSet an object so it can be more readable,
	//       e.g. actionSet['boxSelection'] or actionSet.boxSelection
	var actionSet = [0, 0, 0];
	var currAction = -1;

	var cellLookupTable = [null, 6, 7, 8, 3, 4, 5, 0, 1, 2];

	// TODO: remove this once all functions are inside (or referenced in) Vue object
	var app = null;

$(document).ready(function() {
	var sudokuGrid = [Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9)];
	var startingGrid = "14.7...6985.6.31....3..4..53.....71.2..1.5..4.91.....85..8..9....65.7.8372...1.56";
	var difficulties = ['easy', 'medium', 'hard', 'expert'];

	// TODO: change this to "[let||var] app =" once all functions are inside (or referenced in) Vue object
	app = new Vue({
		el: '#main-cnt',
		data: {
			difficulties,
			sudokuGrid,
			isGridVisible: false,
			currentDifficulty: undefined,
			highlightedCells: undefined
		},

		methods: {
			/**
			 * Shows the grid after a difficulty is selected, calls fillSudokuGrid()
			 * to fill the grid with a puzzle of the selected difficulty
			 */
			showGrid: function(difficulty) {
				this.isGridVisible = true;
				this.fillSudokuGrid(startingGrid)
				// TODO: add logic for showing different grids based on difficulty
			},

			/**
			 * Fills in the sudoku grid on the page, given a string representation of a sudoku grid
			 * with numbers where the clues are and periods ('.') representing empty cells
			 */
			fillSudokuGrid: function(gridString) {
				for(var row = 0; row < 9; row++) {
					for(var col = 0; col < 9; col++) {
						var strIndex = (row * 9) + col

						// TODO: make an actual class for sudoku cells so that the `if` and `else` here aren't almost exactly the same code
						if(gridString.charAt(strIndex) === '.') {
							var cell = {
								isClue: false,
								isHighlighted: false,
							};
							cell = {
								val: undefined,
								clueClass: (cell.isClue ? "clue" : ""),
								highlightedClass: (cell.isHighlighted ? "highlighted" : ""),
								boxNumClass: ("box" + ((Math.floor(row / 3) * 3) + Math.floor(col / 3)))
							};

							this.$set(this.sudokuGrid[row], col, cell);
							// this.sudokuGrid[row][col] = cell;
						}
						else {
							var cell = {
								isClue: true,
								isHighlighted: false,
							};
							cell = {
								val: parseInt(gridString.charAt(strIndex)),
								clueClass: (cell.isClue ? "clue" : ""),
								highlightedClass: (cell.isHighlighted ? "highlighted" : ""),
								boxNumClass: ("box" + ((Math.floor(row / 3) * 3) + Math.floor(col / 3)))
							};

							this.$set(this.sudokuGrid[row], col, cell);
							// this.sudokuGrid[row][col] = cell;
						}
					}
				}
			},

			/**
			 * Given the box selection number (in "numpad counting", as entered on keyboard),
			 * returns the row and column numbers for the top-left corner of the selected box
			 */
			getBoxCoordinates: function(boxNum) {
				var boxCoordinates = { 7: [0, 0], 8: [0, 3], 9: [0, 6],
				                       4: [3, 0], 5: [3, 3], 6: [3, 6],
				                       1: [6, 0], 2: [6, 3], 3: [6, 6] };
				return boxCoordinates[boxNum];
			},

			/**
			 * Given the coordinates for the top-left corner of the selected box, returns the row and column numbers for the cell
			 */
			getCellCoordinates: function(boxCornerRow, boxCornerCol, cellNum) {
				// "shift" is how many rows/columns to "move" within the selected box to get to the cell we want
				var cellShiftTable = { 7: [0, 0], 8: [0, 1], 9: [0, 2],
				                       4: [1, 0], 5: [1, 1], 6: [1, 2],
				                       1: [2, 0], 2: [2, 1], 3: [2, 2] };

				// indexes to notate when row or column is being pulled out
				// of arrays in above object, for better readability
				var row = 0;
				var col = 1;

				var cellRow = boxCornerRow + cellShiftTable[cellNum][row];
				var cellCol = boxCornerCol + cellShiftTable[cellNum][col];
				return [cellRow, cellCol];
			},

			/**
			 * Highlights a box (3x3 group of cells) on the grid, given its box
			 * number (in "numpad format" from keyboard entry, not zero-indexed)
			 */
			highlightBox: function(boxNum) {
				console.log("TODO: write highlightBox function");
				return;
			},

			/**
			 * Highlights a cell on the grid, given the box and cell numbers in "numpad format"
			 */
			highlightCell: function(boxNum, cellNum) {
				var boxCoords = this.getBoxCoordinates(boxNum);
				var cellCoords = this.getCellCoordinates(boxCoords[0], boxCoords[1], cellNum);

				var row = cellCoords[0];
				var col = cellCoords[1];
				var cell = this.sudokuGrid[row][col];

				this.$set(this.sudokuGrid[row][col], "isHighlighted", true);
				var highlightedClass = (cell.isHighlighted ? "highlighted" : "");
				this.$set(this.sudokuGrid[row][col], "highlightedClass", highlightedClass);
				this.$set(this, "highlightedCells", [[row, col]]);
			},

			clearHighlights: function() {
				if(!this.highlightedCells || this.highlightedCells.length == 0) {
					return;
				}

				for(var cellCoords of this.highlightedCells) {
					var row = cellCoords[0];
					var col = cellCoords[1];

					var cell = this.sudokuGrid[row][col];
					this.$set(cell, "isHighlighted", false);

					var highlightedClass = (cell.isHighlighted ? "highlighted" : "");
					this.$set(cell, "highlightedClass", highlightedClass);
				}
			}
		}
	});

	// This function outlines the core mechanic of Numpad Sudoku
	// (will probably move it to a separate function soon)
	$(document).keypress(function(e) {
		// 1-9 are used to select a block or cell, or to fill a cell
		if(e.key >= 1 && e.key <= 9) {
			currAction++;
			app.clearHighlights();

			if(currAction == 0) {
				actionSet[0] = e.key;
				app.highlightBox(parseInt(e.key));
			}
			else if(currAction == 1) {
				actionSet[1] = e.key;
				app.highlightCell(actionSet[0], actionSet[1]);
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
		// The period key will be used to cancel an action set
		else if(e.key == ".") {
			clearActionSet();
		}
	});
});

/*
function highlightBlock(blockNumber) {
	$(".box" + blockNumber).addClass("highlighted");
}
*/

/*
function highlightCell(coordinates) {
	var selector = ".box" + coordinates[0];
	var block = $(selector);
	var index = cellLookupTable[coordinates[1]];

	var cell = block[index];

	$(cell).addClass("highlighted");
}
*/

/*
function clearHighlight() {
	$(".highlighted").removeClass("highlighted");
}
*/

function writeValueToCell(coordinates, value) {
	var selector = ".box" + coordinates[0];
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
	app.clearHighlights();

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
 *       the puzzles before they are loaded on the page.
 *
 * @param  {string} gridString - string of clues and blanks in format described above
 */
/*
function fillSudokuGrid(gridString) {
	$("td").each(function(index) {
		currValue = gridString.charAt(index);

		if(currValue != '.')
			$(this).text(currValue).addClass("clue");
		else
			$(this).text(null).removeClass("clue");
	});
}
*/
