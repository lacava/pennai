import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Dropdown, Form } from 'semantic-ui-react';
import Papa from 'papaparse';

class DependentColumnInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

// TODO - fix dropdown values
  render() {
    const { depColDropdown, dependentCol, depColCallback } = this.props;
    return (
      <div>

        <Dropdown
          style={{
            backgroundColor: "white",
            paddingLeft: "12px"
          }}
          selection
          text="Select dependent column"
          options={depColDropdown}
        >
        </Dropdown>
        <Form.Input
          id="dep_column_form_input"
          style={{
            width: '65%'
          }}
        >
          <input
            id="dependent_column_text_field_input"
            className="file-upload-dependent-text-field"
            placeholder="Or enter dataset dependent column manually"
            value={dependentCol ? dependentCol : ""}
            type="text"
            onChange={depColCallback}
          />
        </Form.Input>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { DependentColumnInput };
export default connect(mapStateToProps)(DependentColumnInput);
