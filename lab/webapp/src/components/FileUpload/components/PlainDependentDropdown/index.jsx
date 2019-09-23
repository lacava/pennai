import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';

class PlainDependentDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    //window.console.log('old options', prevProps.options);
    //window.console.log('new options', options);
  }

  shouldComponentUpdate(nextProps, nextState) {
    //window.console.log('old options', this.props.options);
    //window.console.log('new options', nextProps.options);
    return true;
  }

  render() {
    const { options, fieldType, dropdownHandler, multiple, selectedValue } = this.props;
    //window.console.log('PlainDropdown', options);
    let tempOpts = [];
    //let testOpts = options.concat(selectedValue);
    if( selectedValue && selectedValue !== "" ){
      options.push(selectedValue);
      options.sort();
    }
    // let testOpts = [...options];
    // testOpts.sort();
    // window.console.log('PlainDependentDropdown', testOpts);
    options.forEach((key, i) => {
    tempOpts.push(
      <option
       key={key + '_' + i}
       value={key}
      >
       {key}
      </option>)
    });
    return (
      <div>
        <label>
          PlainDependentDropdown {fieldType}:
        </label>
        <Segment
          inverted
          compact
        >
          <select
            style={{
              width: '100%'
            }}
            name={'plain_dropdown_' + fieldType}
            multiple={multiple}
            onChange={dropdownHandler}
            value={selectedValue ? selectedValue : ""}
          >
            <option value="fieldType_for_dropdown_menu" disabled>--Please select {fieldType}--</option>
            {tempOpts}
          </select>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainDependentDropdown };
export default connect(mapStateToProps)(PlainDependentDropdown);
