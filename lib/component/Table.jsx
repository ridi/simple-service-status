const React = require('react');
const BSTable = require('react-bootstrap/lib/Table');

class Column extends React.Component {
  render() {
    return <td>{this.props.item ? this.props.item.toString() : ''}</td>;
  }
}
Column.propTypes = {
  item: React.PropTypes.object.isRequired,
};

class Row extends React.Component {
  render() {
    return (
      <tr>
        {this.props.columns.map(col => <Column item={this.props.item[col]} />)}
      </tr>
    );
  }
}
Row.propTypes = {
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

class Table extends React.Component {
  render() {
    return (
      <BSTable responsive>
        <thead>
          <tr>
            {this.props.columns.map(col => <th>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(item => <Row item={item} columns={this.props.columns} />)}
        </tbody>
      </BSTable>
    );
  }
}
Table.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

module.exports = Table;

