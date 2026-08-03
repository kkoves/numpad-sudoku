  // TODO: might make actionSet an object so it can be more readable,
  //       e.g. actionSet["boxSelection"] or actionSet.boxSelection
  var actionSet = [0, 0, 0];
  var currAction = -1;

  // TODO: remove this once all functions are inside (or referenced in) Vue object
  var app = null;

$(document).ready(function() {
  var sudokuGrid = [Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9), Array(9)];
  var startingGrid = "14.7...6985.6.31....3..4..53.....71.2..1.5..4.91.....85..8..9....65.7.8372...1.56";
  var difficulties = ["easy", "medium", "hard", "expert"];

  // TODO: change this to "[let||var] app =" once all functions are inside (or referenced in) Vue object
  app = new Vue({
    el: "#main-cnt",
    data: {
      difficulties,
      sudokuGrid,
      isGridVisible: false,
      currentDifficulty: undefined,
      highlightedCells: [],
      lastBoxSelection: 0,
      holdBoxSelection: false,
      lastCellSelection: [1, 1],
      lastKeyEvent: ''
    },

    methods: {
      /**
       * Shows the grid after a difficulty is selected, calls fillSudokuGrid()
       * to fill the grid with a puzzle of the selected difficulty
       * @param {string} difficulty - "easy", "medium", "hard", or "expert" (not yet implemented)
       */
      showGrid: function(difficulty) {
        this.isGridVisible = true;
        this.fillSudokuGrid(startingGrid)
        // TODO: add logic for showing different grids based on difficulty
      },

      /**
       * Fills in the sudoku grid on the page, given a string representation of a sudoku grid
       * with numbers where the clues are and periods ('.') representing empty cells
       * @param {string} gridString
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
                ...cell,
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
                ...cell,
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

      clearActionSet: function() {
        this.clearHighlights();
        actionSet = new Array(3);

        if(this.holdBoxSelection) {
          actionSet[0] = this.lastBoxSelection;
          this.highlightBox(this.lastBoxSelection);
          currAction = 0;
        }
        else {
          currAction = -1;
        }
      },

      /**
       * Given coordinates for a cell (in "numpad format"), writes given new value to that cell (if it is not a clue cell)
       * @param {number[]} coordinates
       * @param {number} value
       */
      writeValueToCell: function(coordinates, value) {
        const ROW = 0;
        const COL = 1;
        if(!this.lastKeyEvent.startsWith("Arrow")) {
          boxCoords = this.getBoxCoordinates(coordinates[0]);
          cellCoords = this.getCellCoordinates(boxCoords[0], boxCoords[1], coordinates[1]);
          cellRow = cellCoords[ROW];
          cellCol = cellCoords[COL];
        }
        else {
          cellRow = this.lastCellSelection[ROW];
          cellCol = this.lastCellSelection[COL];
        }

        var cell = this.sudokuGrid[cellRow][cellCol];

        // null value will clear the cell when 0 key has been pressed
        if(value == 0) {
          value = undefined;
        }

        // only change the cell's value if it is not a pre-filled cell (clue)
        if(!cell.isClue) {
          this.$set(cell, "val", value);
        }

        this.clearActionSet();
      },

      /**
       * Given the box selection number (in "numpad format", as entered on keyboard),
       * returns the row and column numbers for the top-left corner of the selected box
       * @param {number} boxNum
       */
      getBoxCoordinates: function(boxNum) {
        var boxCoordinates = { 7: [0, 0], 8: [0, 3], 9: [0, 6],
                               4: [3, 0], 5: [3, 3], 6: [3, 6],
                               1: [6, 0], 2: [6, 3], 3: [6, 6] };
        return boxCoordinates[boxNum];
      },

      /**
       * Given the coordinates for the top-left corner of the selected box, returns the row and column numbers for the cell
       * @param {number} boxCornerRow
       * @param {number} boxCornerCol
       * @param {number} cellNum
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
       * Given the currently-selected box and cell numbers (in "numpad format", as entered on keyboard),
       * converts them to (x, y) coordinates and saves them to `this.lastCellSelection` for later use.
       * @param {number} boxNum
       * @param {number} cellNum
       */
      setLastCellSelectionFromBoxAndCell: function(boxNum, cellNum) {
        boxCoords = this.getBoxCoordinates(boxNum);
        cellRowCol = this.getCellCoordinates(boxCoords[0], boxCoords[1], cellNum);
        this.lastCellSelection = cellRowCol;
      },

      /**
       * Highlights a box (3x3 group of cells) on the grid, given its box
       * number (in "numpad format" from keyboard entry, not zero-indexed)
       * @param {number} boxNum
       */
      highlightBox: function(boxNum) {
        var boxCoords = this.getBoxCoordinates(boxNum);
        var startRow = boxCoords[0];
        var startCol = boxCoords[1];

        for(var row = startRow; row < (startRow + 3); row++) {
          for(var col = startCol; col < (startCol + 3); col++) {
            this.setCellHighlightedVars(row, col);
          }
        }
      },

      /**
       * Highlights a cell on the grid, given the box and cell numbers in "numpad format"
       * @param {number} boxNum
       * @param {number} cellNum
       */
      highlightCell: function(boxNum, cellNum) {
        var boxCoords = this.getBoxCoordinates(boxNum);
        var cellCoords = this.getCellCoordinates(boxCoords[0], boxCoords[1], cellNum);

        var row = cellCoords[0];
        var col = cellCoords[1];
        this.setCellHighlightedVars(row, col);
      },

      /**
       * Sets the proper variables and CSS classes in Vue object to highlight a cell in the sudoku grid
       * @param {number} row
       * @param {number} col
       */
      setCellHighlightedVars: function(row, col) {
        var cell = this.sudokuGrid[row][col];

        this.$set(this.sudokuGrid[row][col], "isHighlighted", true);

        var highlightedClass = (cell.isHighlighted ? "highlighted" : "");
        this.$set(this.sudokuGrid[row][col], "highlightedClass", highlightedClass);

        var highlightedCells = this.highlightedCells.concat([[row, col]]);
        this.$set(this, "highlightedCells", highlightedCells);
      },

      /**
       * Moves highlighted cell in the given direction
       * @param {string} direction - "up", "down", "left", or "right"
       */
      moveHighlightedCell: function(direction) { // TODO: this should also set lastBoxSelection so that keeps working
        cellCoords = this.lastCellSelection;
        const ROW = 0;
        const COL = 1;
        switch(direction) {
          case "up":
            cellCoords[ROW] -= 1;
            break;
          case "down":
            cellCoords[ROW] += 1;
            break;
          case "left":
            cellCoords[COL] -= 1;
            break;
          case "right":
            cellCoords[COL] += 1;
            break;
        }
        // Only attempt to change highlighted cell if new coordinates are valid
        rowNumValid = (cellCoords[ROW] >= 0 && cellCoords[ROW] <= 8)
        colNumValid = (cellCoords[COL] >= 0 && cellCoords[COL] <= 8)
        if(colNumValid && rowNumValid) {
          this.setCellHighlightedVars(cellCoords[ROW], cellCoords[COL]);
          this.lastCellSelection = [cellCoords[ROW], cellCoords[COL]];
        }
      },

      /**
       * Clears all highlighted cells on the sudoku grid
       */
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
        this.highlightedCells = [];
      }
    }
  });

  // This function outlines the core mechanic of Numpad Sudoku
  // (will probably move it to a separate function soon)
  $(document).keypress(function(e) {
    // Only register key presses after we're past the difficulty selection screen
    if(app.isGridVisible) {
      // 1-9 are used to select a block or cell, or to fill a cell
      if(parseInt(e.key) >= 1 && parseInt(e.key) <= 9) {
        currAction++;
        app.clearHighlights();

        if(currAction == 0) {
          actionSet[0] = parseInt(e.key);
          app.lastBoxSelection = parseInt(e.key);
          app.highlightBox(app.lastBoxSelection);
        }
        else if(currAction == 1) {
          actionSet[1] = parseInt(e.key);
          app.highlightCell(actionSet[0], actionSet[1]);
          app.setLastCellSelectionFromBoxAndCell(actionSet[0], actionSet[1]);
        }
        else if(currAction == 2) {
          actionSet[2] = parseInt(e.key);
          // If arrow key was used to move highlighted cell, last cell selection was already set in app.moveHighlightedCell()
          if(!app.lastKeyEvent.startsWith("Arrow")) {
            app.setLastCellSelectionFromBoxAndCell(actionSet[0], actionSet[1]);
          }
          app.writeValueToCell(actionSet.slice(0, 2), actionSet[2]);
        }
        app.lastKeyEvent = e.key;
      }
      // 0 will be used to clear the value of a cell on the grid, or to cancel an action set
      else if(parseInt(e.key) == 0) {
        currAction++;
        if(currAction == 2) {
          actionSet[2] = parseInt(e.key);
          // If arrow key was used to move highlighted cell, last cell selection was already set in app.moveHighlightedCell()
          if(!app.lastKeyEvent.startsWith("Arrow")) {
            app.setLastCellSelectionFromBoxAndCell(actionSet[0], actionSet[1]);
          }
          app.writeValueToCell(actionSet.slice(0, 2), actionSet[2]);
        }
        app.lastKeyEvent = e.key;
        app.clearActionSet();
      }
      // The period key will be used to cancel an action set
      else if(e.key == '.') {
        app.lastKeyEvent = e.key;
        app.clearActionSet();
      }
      // Asterisk will toggle "hold box selection" mode on/off, when on this will go back to
      // the last-selected box after a cell is written to, so that another cell in the same
      // box can be modified quicker
      else if(e.key == '*') {
        app.lastKeyEvent = e.key;
        if(app.lastBoxSelection != 0) {
          app.holdBoxSelection = !app.holdBoxSelection;
          if(!app.holdBoxSelection && currAction == 0) {
            app.clearActionSet();
          }
          else if(app.holdBoxSelection && currAction == -1) {
            app.clearActionSet();
          }
        }
      }
    }
  });

  // Arrow keys don't trigger keypress events, so we have to use keydown or keyup
  $(document).on("keyup", function(e) {
    // Only register key presses after we're past the difficulty selection screen
    if(app.isGridVisible) {
      if(e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowLeft" || e.key == "ArrowRight") {
        app.lastKeyEvent = e.key;
        if(app.holdBoxSelection) {
          app.holdBoxSelection = !app.holdBoxSelection;
        }
        app.clearHighlights();
        currAction = 1;
        // Arrow keys will get the last-edited cell and select the next cell in that direction from it for editing;
        // hand doesn't have to leave numpad if NumLock is turned off, then arrow key is pressed
        if(e.key == "ArrowUp") {
          app.moveHighlightedCell("up");
        }
        else if(e.key == "ArrowDown") {
          app.moveHighlightedCell("down");
        }
        else if(e.key == "ArrowLeft") {
          app.moveHighlightedCell("left");
        }
        else if(e.key == "ArrowRight") {
          app.moveHighlightedCell("right");
        }
      }
    }
  });
});
