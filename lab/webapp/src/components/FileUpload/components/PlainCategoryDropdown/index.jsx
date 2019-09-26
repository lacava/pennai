import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';

class PlainCategoryDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    window.console.log('componentDidUpdate - old options', prevProps);
    window.console.log('componentDidUpdate - new options', this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    window.console.log('shouldComponentUpdate - old options', this.props);
    window.console.log('shouldComponentUpdate - new options', nextProps);
    return true;
  }

  render() {
    const { options, fieldType, dropdownHandler, multiple, catValues } = this.props;
    window.console.log('PlainCategoryDropdown', options);
    window.console.log('PlainCategoryDropdown catValues', catValues);
    let tempOpts = [];
    // parse input, split on commas
    let catList = catValues.split(",");
    if( catList.length && catList[0] !== "" ){
      catList.forEach(cat => {
        // check current category value in option prop list to prevent adding
        // same thing twice
        !options.includes(cat) && options.push(cat);
      });
    }
    options.sort();
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
          PlainCategoryDropdown {fieldType}:
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
            value={catList.length ? catList : ''}
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
