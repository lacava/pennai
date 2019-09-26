import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';

class PlainOrdinalDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    const { options, fieldType, dropdownHandler, multiple, ordValues } = this.props;
    //window.console.log('PlainOrdinalDropdown', options);
    //window.console.log('PlainCategoryDropdown ordValues', ordValues);
    let tempOpts = [];
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
          PlainDropdown {fieldType}:
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
            <option value="" disabled>--Please select {fieldType}--</option>
            {tempOpts}
          </select>
        </Segment>
        <CurrentlySelectedKeys
          fieldType="Ordinal"
          selectionToDisplay={ordValues}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainOrdinalDropdown };
export default connect(mapStateToProps)(PlainOrdinalDropdown);
