var React = require('react'),
	ReactRedux = require('react-redux'),
	_ = require('lodash'),
	axios = require('axios'),
	Loading = require("./loading"),
	Link = require('react-router').Link;

var Followers = React.createClass({
	componentWillMount: function() {
		this.setState({users: []});
		this.getFollowers();
	},
	getFollowers: function() {
		axios.get('//api.steemjs.com/getFollowers?following=fabien&startFollower=0&followType=blog&limit=10')
			.then(response => {
				this.setState({users: response.data});
			});
	},
	render: function(){
		return (
			<div className="users">
				{this.state.users.length > 0 && <ul>
					{this.state.users.map(function(user, key) {
						return <li key={key}><Link to={'/@' + user.follower}>@{user.follower}</Link></li>;
					})}
				</ul>}
				{this.state.users.length == 0 && <Loading />}
			</div>
		);
	}
});

var mapStateToProps = function(state){
	return {
		auth: state.auth
	};
};

module.exports = ReactRedux.connect(mapStateToProps)(Followers);