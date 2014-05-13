/** @jsx React.DOM */
console.log('react-template');


var reqHeader = React.createClass({
  render: function() {
    return (
      <h4 className='list-group-item-heading api-request-header'>
        <span id='api-request-type'>GET</span>
        <span className='api-request-route'>api/crafting/distinct/fieldname</span>
        <span className='api-request-summary'>Find all unique values associated with a field of the recipe model</span>
      </h4>
    );
  }
});

var reqDetails = React.createClass({
  handleInput: function() {
    var fieldName = this.refs.fieldName.getDOMNode().value.trim();
    var req_url   = 'api/recipes/distinct/' + fieldName;

    // Invalid if fieldname empty
    if (!fieldName) {
      return false;
    }

    // Clear the fieldName input value
    this.refs.fieldName.getDOMNode().value = '';

    // Call the parent function onUserSubmit with the url for the request.
    this.props.onUserSubmit(req_url);
  },
  render: function() {
    return (
      <div className='api-request-details'>
        <div className='row'>
          <div className='col-md-2'>
            <div className='input-group'>
              <label>Field Name</label>
              <input type='text' className='form-control' ref='fieldName' placeholder='Name'></input>
            </div>
          </div>
          <div className='col-md-3'>
            <button type='button' id='getDistinctBtn' className='btn btn-default' onClick={this.handleInput}>GET</button>
          </div>
        </div>
        <div id='api-distinct-details' className='api-details-closed' ref='distinctDetails'>
          <h4>Response URL</h4>
            <p>
              <code>{this.props.resUrl}</code>
            </p>
          <h4>Response Details</h4>
          <div className='code-container'>
            <code>{this.props.resCode}</code>
          </div>
        </div>
      </div>
    );
  }
});

var reqContainer = React.createClass({
  getInitialState: function() {
    return {
      resUrl: '',
      resCode: ''
    };
  },

  // Handles submitting request to server and updating UI
  handleSubmit: function(url) {
    console.log('handleSubmit');

    // When the response arrives, store the data in state,
    // triggering a render to update the UI.
    $.get(url, function (resCode) {

      var api_container = document.getElementById('api-distinct-details');
          api_container.className += ' api-details-expanded';

      var result_string = JSON.stringify(resCode, null, 2);
      var full_url      = document.baseURI + url;

      this.setState({ 
        resCode : result_string,
        resUrl  : full_url
      });
    }.bind(this));

    return false;
  },

  render: function() {
    return (
      <div className='col-md-10 col-md-offset-2'>
        <div className='list-group'>
          <a className="list-group-item api-request-container">
            <reqHeader />
            <reqDetails
              resUrl={this.state.resUrl}
              resCode={this.state.resCode}
              onUserSubmit={this.handleSubmit}
            />
          </a>
        </div>
      </div>
    );
  }
});

React.renderComponent(<reqContainer />, document.getElementById('react-example'));