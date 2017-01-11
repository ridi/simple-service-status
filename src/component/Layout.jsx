const React = require('react');

class Layout extends React.Component {
  render() {
    return (
      <html lang="ko">
        <head>
          <title>긴급 공지사항 등록 시스템</title>
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/public/assets/client.bundle.css" />
        </head>
        <body>
          <div id="app-main" />
          <script id="app-state" dangerouslySetInnerHTML={{ __html: this.props.state }} />
          <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" />
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" />
          <script src="https://unpkg.com/react@15.4.1/dist/react.min.js" />
          <script src="https://unpkg.com/react-dom@15.4.1/dist/react-dom.min.js" />

          <script src="https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.30.7/react-bootstrap.min.js" />

          <script src="/public/assets/client.bundle.js" />
        </body>
      </html>
    );
  }
}

Layout.propTypes = {
  state: React.PropTypes.string,
};

module.exports = Layout;
