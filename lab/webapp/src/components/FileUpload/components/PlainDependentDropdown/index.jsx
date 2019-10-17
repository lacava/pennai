import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';

// these 'plain' dropdowns create ui form fields using a list of keys/Column 
// names from a given uploaded dataset - parent component handles managing list of
// available options to select from and any currently selected option(s). Desired
// behavior is to only present unselected keys/column names. Use a bit of custom logic
// based on type of input (dependent, ordinal, categorical) to take list of available
// options and currently selected option(s) to create proper dropdown list for each
// respective field
class PlainDependentDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { options, fieldType, dropdownHandler, multiple, selectedValue } = this.props;
    window.console.log('PlainDependentDropdown', options);
    let tempOpts = [];
    //let testOpts = options.concat(selectedValue);
    if( selectedValue && selectedValue !== "" ){
      options.push(selectedValue);
    }
    // let testOpts = [...options];
    // testOpts.sort();
    // window.console.log('PlainDependentDropdown', testOpts);
    options.sort();
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
        <CurrentlySelectedKeys
          fieldType="Dependent"
          selectionToDisplay={selectedValue}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainDependentDropdown };
export default connect(mapStateToProps)(PlainDependentDropdown);
