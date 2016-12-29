const React = require('react');
const BSTable = require('react-bootstrap/lib/Table');

class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: this.props.options.key ? this.props.item[this.props.options.key] : '',
    };
    if (typeof this.props.options.display === 'function') {
      const displayResult = this.props.options.display(this.props.item);
      if (displayResult instanceof Promise) {
        displayResult.then(content => this.setState({ content })).catch(error => this.setState({ content: error.message }));
      } else {
        this.state.content = displayResult;
      }
    }
  }
  render() {
    return <td>{this.state.content}</td>;
  }
}
Column.propTypes = {
  item: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
};

class Row extends React.Component {
  render() {
    return <tr>{this.props.columns.map(col => <Column item={this.props.item} options={col} />)}</tr>;
  }
}
Row.propTypes = {
  item: React.PropTypes.object.isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

class ChildRow extends React.Component {
  render() {
    return (
      <tr>
        <td colSpan={this.props.columns.length}>
          <BSTable responsive>
            {this.props.columns.map(col => {
              return <tr><th>{col.label}</th><Column item={this.props.item} options={col} /></tr>;
            })}
          </BSTable>
        </td>
      </tr>
    );
  }
}
ChildRow.propTypes = {
  item: React.PropTypes.object.isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};


class Table extends React.Component {
  render() {
    const mainCols = this.props.columns.filter(column => !column.isChildRow);
    const childCols = this.props.columns.filter(column => column.isChildRow);
    return (
      <BSTable responsive>
        <thead>
          <tr>
            {mainCols.map(col => <th>{col.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(item => (<Row item={item} columns={mainCols} />/*, <ChildRow item={item} columns={childCols} />*/))}
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

