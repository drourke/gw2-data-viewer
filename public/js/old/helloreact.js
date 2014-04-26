/** @jsx React.DOM */
var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function (comment) {
      return <Comment author={comment.author}>{comment.text}</Comment>;
    });

    return (
      <div className="commentList">
        {commentNodes} 
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function() {
    var author = this.refs.author.getDOMNode().value.trim();
    var text   = this.refs.text.getDOMNode().value.trim();
    if (!text || !author) {
      return false;
    }
    // TODO: send request to server
    this.refs.author.getDOMNode().value = '';
    this.refs.text.getDOMNode().value= '';
    return false;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input 
          type="text" 
          placeholder="Your name" 
          ref="author" />
        <input 
          type="text" 
          placeHolder="Say something..." 
          ref="text" />
        <input type="submit" value="Post" />
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("comments.json", status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {

  },
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentForm />
      </div>
    );
  }
});


var converter = new Showdown.converter();
var Comment = React.createClass({
  render: function() {
    var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});


/*
 * React.renderComponent() instantiates the root component, 
 * starts the framework, and injects the markup into a raw 
 * DOM element, provided as the second argument. */

React.renderComponent(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);