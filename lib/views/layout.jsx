const React = require('react');
const Button = require('react-bootstrap/lib/Button');

// TODO Login/Logout 버튼
class Layout extends React.Component {
  render() {
    let header;
    if (this.props.auth && this.props.auth.isAuthenticated) {
      header = <Button href="/logout">Logout {this.props.auth.credentials.username}</Button>;
    } else {
      header = <Button href="/login">Login</Button>;
    }
    return (
      <html lang="ko">
        <head>
          <title>{this.props.title}</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
        </head>
        <body>
          <div id="header">{header}</div>
          <div id="content" dangerouslySetInnerHTML={{ __html: this.props.children }} />
          <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" />
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" />
        </body>
      </html>
    );
  }
}

module.exports = Layout;
