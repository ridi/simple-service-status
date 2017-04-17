/* global window */
const React = require('react');
const PropTypes = require('prop-types');

const Navbar = require('react-bootstrap/lib/Navbar');
const Nav = require('react-bootstrap/lib/Nav');
const NavItem = require('react-bootstrap/lib/NavItem');
const Grid = require('react-bootstrap/lib/Grid');
const Row = require('react-bootstrap/lib/Row');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navExpanded: false };
  }

  onMenuSelected(viewName) {
    this.setState({ navExpanded: false });
    const menuSelected = this.props.menus.find(m => m.viewName === viewName);
    window.location.href = menuSelected ? menuSelected.url : '/';
  }

  render() {
    const ChildComponent = require(`./${this.props.viewName}`);
    const children = React.createElement(ChildComponent, this.props);
    let button;
    if (this.props.auth && this.props.auth.isAuthenticated) {
      button = <NavItem href="/logout">{this.props.auth.username} 로그아웃</NavItem>;
    } else {
      button = <NavItem href="/login">로그인</NavItem>;
    }

    return (
      <div>
        <Navbar expanded={this.state.navExpanded} onToggle={navExpanded => this.setState({ navExpanded })}>
          <Navbar.Header>
            <Navbar.Brand><a href="/">긴급 공지사항 등록 시스템</a></Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav role="navigation" activeKey={this.props.viewName} onSelect={viewName => this.onMenuSelected(viewName)}>
              {this.props.menus.map((menu, idx) => <NavItem key={idx} eventKey={menu.viewName} href={menu.url}>{menu.title}</NavItem>)}
            </Nav>
            <Nav pullRight>{button}</Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid>
          <Row>
            {children}
          </Row>
        </Grid>
      </div>
    );
  }
}

App.defaultProps = {
  auth: {
    isAuthenticated: false,
  },
  menus: [],
};

App.propTypes = {
  viewName: PropTypes.string.isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    username: PropTypes.string,
  }),
  menus: PropTypes.arrayOf(PropTypes.shape({
    viewName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })),
};

module.exports = App;
