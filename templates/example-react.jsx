var CommentBox = React.createClass({
	getInitialState: function(){
		return {'data':[]};
	},
	componentDidMount: function(){
		// This is where we would go fetch the data and then this.setState() with the results;
		this.setState({'data': window.data});
		setTimeout(this.updateWithData2, 2000);
	},
	updateWithData2: function(){
		this.setState({'data': window.data2 });
	},
	render: function() {
		return (
			<div className="commentBox">
				I am a CommentBox.
				<CommentList data={this.state.data} />
			</div>
		);
	}
});

var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.data.map(function (comment) {
		  return (
		    <Comment author={comment.author}>
		      {comment.text}
		    </Comment>
		  );
		});
		return (
			<div className="commentList">
        		{commentNodes}
			</div>
		);
	}
});

var Comment = React.createClass({
	render: function() {
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				{this.props.children}
			</div>
		);
	}
});