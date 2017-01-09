const React = require('react');
const BSTable = require('react-bootstrap/lib/Table');
const Checkbox = require('react-bootstrap/lib/Checkbox');

class Column extends React.Component {
  render() {
    let content = this.props.options.key ? this.props.item[this.props.options.key] : '';
    if (typeof this.props.options.display === 'function') {
      const displayResult = this.props.options.display(this.props.item);
      if (displayResult instanceof Promise) {
        displayResult.then((content) => {
          React.Children.map(this.props.children, (child => React.cloneElement(child, {}, content)));
        }).catch((error) => {
          React.Children.map(this.props.children, (child => React.cloneElement(child, {}, error.message)));
        });
      } else {
        content = displayResult;
      }
    }
    return <td>{content}</td>;
  }
}
Column.propTypes = {
  item: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
};

class Row extends React.Component {
  onCheckboxChanged(e) {
    this.props.onCheckboxChange(e.target.checked, this.props.item);
  }

  render() {
    return (
      <tr className={this.props.className}>
        {this.props.showCheckbox ? (
          <td><Checkbox onChange={e => this.onCheckboxChanged(e)} checked={this.props.checked} /></td>
        ) : ''}
        {this.props.columns.map((col, idx) => <Column key={idx} item={this.props.item} options={col} />)}
      </tr>
    );
  }
}
Row.propTypes = {
  item: React.PropTypes.object.isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  checked: React.PropTypes.bool,
  onCheckboxChange: React.PropTypes.func,
  className: React.PropTypes.string,
  showCheckbox: React.PropTypes.boolean,
};

class ChildRow extends React.Component {
  render() {
    return (
      <tr>
        {this.props.showCheckbox ? <td /> : ''}
        <td colSpan={this.props.colSpan}>
          <BSTable bsClass="table inner-table">
            <colgroup>
              <col style={{ width: '100px' }} />
              <col />
            </colgroup>
            <tbody>
              {this.props.columns.map((col, idx) => {
                return <tr key={idx}><th>{col.title}</th><Column item={this.props.item} options={col} /></tr>;
              })}
            </tbody>
          </BSTable>
        </td>
      </tr>
    );
  }
}
ChildRow.propTypes = {
  item: React.PropTypes.object.isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  colSpan: React.PropTypes.number,
  showCheckbox: React.PropTypes.boolean,
};

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      allChecked: false,
      checkedItems: [],
    };
  }

  setChecked(checked, item) {
    this.onCheckboxChanged(checked, item);
  }

  getChecked() {
    return this.state.checkedItems;
  }

  onCheckboxChanged(checked, targetItem) {
    let checkedItems = this.state.checkedItems;
    let allChecked = this.state.allChecked;
    if (!targetItem) {  // all
      checkedItems = checked ? this.props.items.slice(0) : [];
      allChecked = checked;
    } else {
      if (checked) {
        checkedItems = checkedItems.concat(targetItem);
        if (checkedItems.length === this.props.items.length) {
          allChecked = true;
        }
      } else {
        const idx = checkedItems.indexOf(targetItem);
        if (idx > -1) {
          checkedItems.splice(idx, 1);
          allChecked = false;
        }
      }
    }
    this.setState({ checkedItems, allChecked });
    this.props.onCheckboxChange(checkedItems);
  }

  render() {
    const self = this;
    const mainCols = this.props.columns.filter(column => !column.isChildRow);
    const childCols = this.props.columns.filter(column => column.isChildRow);

    const mainColsLength = this.props.showCheckbox ? mainCols.length + 1 : mainCols.length;

    let rows = <tr><td colSpan={mainColsLength} style={{ 'text-align': 'center' }}>아이템이 없습니다.</td></tr>;
    if (this.props.items.length > 0) {
      rows = this.props.items.map((item, idx) => {
        const checked = self.state.checkedItems.includes(item);
        if (childCols.length > 0) {
          return [
            <Row
              className="main-row"
              key={idx}
              item={item}
              columns={mainCols}
              onCheckboxChange={(isChecked, targetItem) => this.onCheckboxChanged(isChecked, targetItem)}
              checked={checked}
              showCheckbox={this.props.showCheckbox}
            />,
            <ChildRow
              item={item}
              columns={childCols}
              colSpan={mainCols.length}
              showCheckbox={this.props.showCheckbox}
            />,
          ];
        }
        return (
          <Row
            key={idx}
            item={item}
            columns={mainCols}
            onCheckboxChange={(isChecked, targetItem) => this.onCheckboxChanged(isChecked, targetItem)}
            checked={checked}
          />
        );
      });
    }

    return (
      <BSTable responsive>
        <thead>
          <tr>
            {this.props.showCheckbox ? (
              <th>
                <Checkbox onChange={e => this.onCheckboxChanged(e.target.checked)} checked={this.state.allChecked}/>
              </th>
            ) : ''}
            {mainCols.map((col, idx) => <th key={idx}>{col.title}</th>)}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </BSTable>
    );
  }
}
Table.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onCheckboxChange: React.PropTypes.func,
  showCheckbox: React.PropTypes.boolean,
};

module.exports = Table;

