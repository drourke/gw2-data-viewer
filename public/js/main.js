'use strict';
console.log('init main.js');



(function() {
  var httpRequest;
  var global_url = '';

  document.getElementById('getDistinctBtn').onclick = function() {
    console.log('get distinct values');

    var url       = 'api/recipes/distinct/';
    var uri       = document.getElementById('inputFieldName').value;
    var container = document.getElementById('api-distinct-details');
    var classList = container.classList;


    if (classList.contains('api-details-expanded')) {

      classList.remove('api-details-expanded');
      var container = container;

      setTimeout(function() {
        console.log('test remove delay');
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }, 1400);
    }
    else if (uri.length < 1) {
      document.getElementById('inputFieldName').parentElement.className += " has-error";
    }
    else {
      url += uri;
      global_url = url;
      requestDistinct(url);
    }
  };

  document.getElementById('recipeIdBtn').onclick = function() {
    console.log('get recipe by id');

    var url       = 'api/recipes/';
    var uri       = document.getElementById('inputRecipeId').value;
    var container = document.getElementById('api-recipe-details');
    var classList = container.classList;


    if (classList.contains('api-details-expanded')) {
      document.getElementById('recipeIdBtn').innerText = 'GET';

      classList.remove('api-details-expanded');
      var container = container;

      setTimeout(function() {
        console.log('test remove delay');
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }, 1400);
    }
    else if (uri.length < 1) {
      document.getElementById('inputRecipeId').parentElement.className += " has-error";
    }
    else {
      document.getElementById('recipeIdBtn').innerText = 'Close';
      url += uri;
      global_url = url;
      requestRecipe(url);
    }
  };

  document.getElementById('findRecipesBtn').onclick = function() {
    console.log('find recipes...');
    var url = 'api/recipes';

    var whereFilter  = document.getElementById('inputWhereFilter').value;
    var equalsFilter = document.getElementById('inputEqualsFilter').value;
    var limitFilter  = document.getElementById('inputLimitFilter').value;
    var orderFilter  = document.getElementById('orderByFilter').value;
    var offsetFilter = document.getElementById('offsetFilter').value;
    
    

    $.ajax({
      dataType: 'json',
      url: 'api/recipes',
      data: {
        filter: {
          where: {
            type: 'Refinement',
            output_item_count: 1
          },
          limit: 10
        }
      },
      success: function (data) {
        console.log('data');
        console.log(data);
      }
    });
  };

  function requestRecipe(url) {
    httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = updateRecipeDetails;
    httpRequest.open('GET', url);
    httpRequest.send();
  }

  function requestDistinct(url) {
    httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = updateDistinctDetails;
    httpRequest.open('GET', url);
    httpRequest.send();
  }

  function updateRecipeDetails() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {

        // Create a title for to go above the requested URL
        var url_title     = document.createElement('h4');
        var url_title_txt = document.createTextNode('Request URL');

        url_title.appendChild(url_title_txt);


        // Container for the URL used in making the request.
        var url_container = document.createElement('p');
        var url_code      = document.createElement('code');
        var url_raw       = document.createTextNode(document.baseURI + global_url);

        url_code.appendChild(url_raw);
        url_container.appendChild(url_code);


        // Create a title to go above the recieved data from the server
        var txt_title = document.createElement('h4');
        var title     = document.createTextNode('Response Details');
        
        txt_title.appendChild(title);


        // Container for the recieved JSON.
        var txt_container  = document.createElement('code');
        var txt            = document.createTextNode(httpRequest.responseText);
        var code_container = document.createElement('div');
        
        code_container.className = 'code-container';
        txt_container.appendChild(txt);
        code_container.appendChild(txt_container);


        // Element being updated with response info
        var updateElem = document.getElementById('api-recipe-details');


        // Add classname to re-size, append new elements
        updateElem.className += ' api-details-expanded';
        updateElem.appendChild(url_title);
        updateElem.appendChild(url_container);
        updateElem.appendChild(txt_title);
        updateElem.appendChild(code_container);
      } 
      else {
        console.log('There was a problem with the request.');
      }
    }
  }

  function updateDistinctDetails() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {

        // Create a title for to go above the requested URL
        var url_title     = document.createElement('h4');
        var url_title_txt = document.createTextNode('Request URL');
        
        url_title.appendChild(url_title_txt);

        // Container for the URL used in making the request.
        var url_code      = document.createElement('code');
        var url_raw       = document.createTextNode(document.baseURI + global_url);
        var url_container = document.createElement('p');

        url_code.appendChild(url_raw);
        url_container.appendChild(url_code);
        

        // Create a title to go above the recieved data from the server
        var title     = document.createTextNode('Response Details');
        var txt_title = document.createElement('h4');

        txt_title.appendChild(title);


        // Container for the recieved JSON.
        var txt_container  = document.createElement('code');
        var code_container = document.createElement('div');
        var txt            = document.createTextNode(httpRequest.responseText);

        code_container.className = 'code-container';

        txt_container.appendChild(txt);
        code_container.appendChild(txt_container);

        // Element being updated with response info
        var updateElem = document.getElementById('api-distinct-details');

        updateElem.className += ' api-details-expanded';
        updateElem.appendChild(url_title);
        updateElem.appendChild(url_container);
        updateElem.appendChild(txt_title);
        updateElem.appendChild(code_container);
      } 
      else {
        console.log('There was a problem with the request.');
      }
    }
  }
})();

