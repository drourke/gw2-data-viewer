'use strict';
console.log('init main.js');



(function() {
  var httpRequest;
  var global_url = '';

  document.getElementById('getDistinctBtn').onclick = function() {
    console.log('get distinct values');

    var url = 'api/recipes/distinct/';
    var uri = document.getElementById('inputFieldName').value;
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

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      classList.remove('api-details-expanded');
    }
    else if (uri.length < 1) {
      document.getElementById('inputRecipeId').parentElement.className += " has-error";
    }
    else {
      url += uri;
      requestRecipe(url);
    }
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
        console.log(httpRequest.responseText);
        console.log(document.baseURI);
        console.log(httpRequest);

        var txt_title      = document.createElement('h4');
        var txt_container  = document.createElement('code');
        var code_container = document.createElement('div');


        var txt   = document.createTextNode(httpRequest.responseText);
        var title = document.createTextNode('Response Details');
        var title_code = document.createElement('code');

             txt_title.appendChild(title);
         txt_container.appendChild(txt);
        code_container.appendChild(txt_container);

        code_container.className = 'code-container';
        
        document.getElementById('api-recipe-details').className = 'api-details-expanded';
        document.getElementById('api-recipe-details').appendChild(txt_title);
        document.getElementById('api-recipe-details').appendChild(code_container);
      } 
      else {
        console.log('There was a problem with the request.');
      }
    }
  }

  function updateDistinctDetails() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(httpRequest.responseText);
        console.log(document.baseURI);
        console.log(global_url);

        var txt_title      = document.createElement('h4');
        var url_title      = document.createElement('h4');

        var url_code       = document.createElement('code');
        var txt_container  = document.createElement('code');
        var code_container = document.createElement('div');
        var url_container  = document.createElement('p');


        var url_raw       = document.createTextNode(document.baseURI + global_url);

        var txt           = document.createTextNode(httpRequest.responseText);
        var title         = document.createTextNode('Response Details');
        var url_title_txt = document.createTextNode('Request URL');

             txt_title.appendChild(title);
             url_title.appendChild(url_title_txt);

         txt_container.appendChild(txt);
        code_container.appendChild(txt_container);

              url_code.appendChild(url_raw);
         url_container.appendChild(url_code);

        code_container.className = 'code-container';

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

