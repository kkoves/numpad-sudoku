var actionList = [0, 0, 0];
var currAction = -1;

$(document).ready(function() {
	$(document).keypress(function(e) {
		console.log(e.key);

		if(e.key >= 0 && e.key <= 9) {
			$(".highlighted").removeClass("highlighted");
			highlight3By3(e.key);
		}
	});
});

function highlight3By3(squareNumber) {
	$(".square" + squareNumber).addClass("highlighted");
}

function highlightOneSquare(squareNumber) {

}