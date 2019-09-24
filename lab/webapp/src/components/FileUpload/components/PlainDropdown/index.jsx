import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';

class PlainDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidUpdate(prevProps) {
  //   const { options } = this.props;
  //   window.console.log('componentDidUpdate - old options', prevProps.options);
  //   window.console.log('componentDidUpdate - new options', options);
  // }
  //
  // shouldComponentUpdate(nextProps, nextState) {
  //   window.console.log('shouldComponentUpdate - old options', this.props.options);
  //   window.console.log('shouldComponentUpdate - new options', nextProps.options);
  //   return true;
  // }

  render() {
    const { options, fieldType, dropdownHandler, multiple, selectedValue } = this.props;
    window.console.log('PlainDropdown', options);
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
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainDropdown };
export default connect(mapStateToProps)(PlainDropdown);
