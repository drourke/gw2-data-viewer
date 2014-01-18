console.log('loading Main.js');

(function() {
	var itemContainer = document.querySelector('.item-row-container');
	var rows          = itemContainer.querySelectorAll('.item-row');

	for (var key in rows) {
		rows[key].addEventListener('click', logItemDetails);
	}

	function logItemDetails() {
		var url = '/view_recipe?item_id=' + this.id;
		window.open(url);
	};
})();