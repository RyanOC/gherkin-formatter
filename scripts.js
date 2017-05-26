
$(function() {
  Render();
});

$('#gherkinText').on('input', function (e) {
    delay(function(){
      Render();
    }, 1000 );   
});

function Render(){
  var fg = formatTables($('#gherkinText').val());
  $('#formattedGherkin').val(fg);
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var tableRowIndent = "  ";
function formatTables(transformedGherkin) {
	var syntaxError = false;

	var currentlyInTable = false;
	var maxColumns = 0;
	var maxRows = 0;

	// Add a new line to the end - need this for it to work properly
	transformedGherkin += "\n";

	// Split the text by the newline char \n
	var linesArray = transformedGherkin.split("\n");

	// Process array of lines
	for (var i = 0; i < linesArray.length; i++) {

		// Get the current line
		var currentLine = linesArray[i];

		// Look for a line with two or more |  << change this to say one or more | with values either side (excluding lines that are commented out)
		if(currentLine.match(/\|.*\|/g) != null && currentLine.match(/^(\s+)?#/) == null){

			// Note the line number of the first match and create a new array for the table rows
			if(!currentlyInTable) {
				var firstTableRowNumber = i;
				var rows = new Array();
				currentlyInTable = true;
			}

			// Create an array to contain the table cell values
			var columns = new Array();

			// Sensible to extract the lines below into a new method?
			// Replace first pipe in table
			currentLine = currentLine.replace(/^[ \t]*\|\s*/gm, '');
			// Remove last pipe and any trailing whitespace
			currentLine = currentLine.replace(/[ \t]*\|\s*$/gm, '');
			// Trim any remaining whitespace around pipes
			currentLine = currentLine.replace(/[ \t]*(\|)[ \t]*/g, '$1');

			// Extract into a new method?
			// Place the words between the pipes on that line into an array e.g. martin, mike, ammar, kartik
			var currentLineValues = currentLine.split("|");
			for (var j = 0; j < currentLineValues.length; j++) {
				columns.push(currentLineValues[j]);
			}
			rows.push(columns);
		}
		// When you come to a line without a pipe
		else if(currentlyInTable){

			// We're now outside of the table
			currentlyInTable = false;

			// Create a new array to hold the values we want our columns widths to be
			var columnSetWidthArray = new Array();

			// How many columns are there?
			maxColumns = rows[0].length;

			// How many rows are there?
			maxRows = rows.length;

			for (var col = 0; col < maxColumns; col++) { 					// For each column
				var columnLengthsArray = new Array(); 						// Find all the cell lengths for the current column
				for (var row = 0; row < maxRows; row++) { 					// For each row

					if(rows[row].length != maxColumns && !syntaxError){
						syntaxError = true;
						document.getElementById('errors').innerHTML = "Problem with table starting at line " + (firstTableRowNumber + 1) +
																			". Check the number of columns.";
						inputCodeMirror.addLineClass(firstTableRowNumber, "background", "syntaxHighlight");
						return;
					}
					columnLengthsArray.push(rows[row][col].length); 	// Get the string length of the cell value
				}
					// Find and record the largest string length for all rows in the current column
					columnSetWidthArray.push(Math.max.apply(Math, columnLengthsArray));
			}

			for (var row = 0; row < maxRows; row++){									// For each row
				var newLineText = tableRowIndent + "| ";								// Create the new line text
				for (var col = 0; col < maxColumns; col++){									// For each column
					var cellValue = rows[row][col];											// Get the cell value
					var callValueLength = cellValue.length;									// Get the cell value length
					var spacesToTrail = columnSetWidthArray[col] - (callValueLength);		// Find the number of spaces to append
					var spaceBuffer = "";													// Build the space buffer
					newLineText += cellValue;
					for (var m = 0; m < spacesToTrail; m++){
						spaceBuffer += " ";
					}
					newLineText += spaceBuffer + " | ";										// Append spaces and close with pipe - trim the last space off later
				}
				linesArray[firstTableRowNumber + row] = newLineText;						// Change the line text in the array
			}
		}
	}
	// Reconstruct the text from the array - is there a function that does this?
	transformedGherkin = "  ";
	for (var n = 0; n < linesArray.length; n++) {
		transformedGherkin += linesArray[n] + "\n  ";
	}
	// Remove trailing new lines
    transformedGherkin = transformedGherkin.slice(0, -6);
   return transformedGherkin;
}

$(document).delegate('#gherkinText', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});