const React = require('react');

const Navbar = require('react-bootstrap/lib/Navbar');
const Nav = require('react-bootstrap/lib/Nav');
const NavItem = require('react-bootstrap/lib/NavItem');
const NavDropdown = require('react-bootstrap/lib/NavItem');
const MenuItem = require('react-bootstrap/lib/MenuItem');

const Grid = require('react-bootstrap/lib/Grid');
const Row = require('react-bootstrap/lib/Row');

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navExpanded: false };
  }
  render() {
    let button;
    if (this.props.auth && this.props.auth.isAuthenticated) {
      button = <NavItem href="/logout">{this.props.auth.username} 로그아웃</NavItem>;
    } else {
      button = <NavItem href="/login">로그인</NavItem>;
    }
    return (
      <html lang="ko">
        <head>
          <title>긴급 공지사항 등록 시스템</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/public/assets/client.bundle.css" />
        </head>
        <body>
          <Navbar expanded={this.state.navExpanded} onToggle={navExpanded => this.setState({ navExpanded })}>
            <Navbar.Header>
              <Navbar.Brand>긴급 공지사항 등록 시스템</Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav activeKey={1}>
                <NavItem eventKey={1} href="/">공지사항 관리</NavItem>
                <NavItem eventKey={2} href="/">설정</NavItem>
              </Nav>
              <Nav pullRight>{button}</Nav>
            </Navbar.Collapse>
          </Navbar>
          <Grid>
            <Row id="app-main" />
          </Grid>
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
  auth: React.PropTypes.object,
  state: React.PropTypes.string,
};

module.exports = Layout;
