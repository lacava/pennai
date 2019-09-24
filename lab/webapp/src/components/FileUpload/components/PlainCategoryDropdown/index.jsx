import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';

class PlainCategoryDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { options, fieldType, dropdownHandler, multiple, catValues } = this.props;
    window.console.log('PlainCategoryDropdown', options);
    let tempOpts = [];
    // parse input, split on commas
    let catList = catValues.split(",");
    if( catList.length && catList[0] !== "" ){
      catValues.forEach(cat => {
        options.push(cat);
      })
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
          >
            <option value="fieldType_for_dropdown_menu" disabled>--Please select {fieldType}--</option>
            {tempOpts}
          </select>
        </Segment>
        <CurrentlySelectedKeys
          fieldType="Categorical"
          selectionToDisplay={catValues}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainCategoryDropdown };
export default connect(mapStateToProps)(PlainCategoryDropdown);
