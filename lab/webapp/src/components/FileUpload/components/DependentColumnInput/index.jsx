import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';
import Papa from 'papaparse';

class DependentColumnInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.depColHelpText = `The column that describes how each row is classified.
    For example, if analyzing a dataset of patients with different types of diabetes,
    this column may have the values "type1", "type2", or "none".`;

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

// TODO - fix dropdown values
  render() {
    const { depColDropdown, dependentCol, depColCallback } = this.props;
    return (
      <div>
        <p style={{color: 'white'}}>
          Dependent Column
        </p>
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
          id="dep_column_form_input_two"
          style={{
            width: '70%'
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
          <Popup
            on="click"
            position="right center"
            header="Dependent Column Help"
            content={
              <div className="content">
                <p>
                  {this.depColHelpText}
                </p>
              </div>
            }
            trigger={
              <Icon
                className="file-upload-dependent-help-icon-standalone"
                inverted
                size="large"
                color="orange"
                name="info circle"
              />
            }
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
