const React = require('react');
const PropTypes = require('prop-types');
const config = require('../config/server.config');

class Layout extends React.Component {
  render() {
    return (
      <html lang="ko">
        <head>
          <title>긴급 공지사항 등록 시스템</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
        </head>
        <body>
          <div id="app-main">{this.props.children}</div>
          <script id="app-state" dangerouslySetInnerHTML={{ __html: this.props.state }} />
          <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" />
          <script src="https://use.fontawesome.com/5e6940792d.js" />
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" />
          <script src="https://unpkg.com/react@15.4.1/dist/react.min.js" />
          <script src="https://unpkg.com/react-dom@15.4.1/dist/react-dom.min.js" />
          <script src={`${config.url.publicPrefix}/client.bundle.js`} />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.30.7/react-bootstrap.min.js" />
        </body>
      </html>
    );
  }
}

Layout.propTypes = {
  state: PropTypes.string,
};

module.exports = Layout;
