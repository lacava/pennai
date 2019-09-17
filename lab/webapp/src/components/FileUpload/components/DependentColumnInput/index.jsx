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

    this.dropDwnHandler = this.dropDwnHandler.bind(this);

    this.depColHelpText = `The column that describes how each row is classified.
    For example, if analyzing a dataset of patients with different types of diabetes,
    this column may have the values "type1", "type2", or "none".`;

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

  dropDwnHandler(e, d) {
    window.console.log('cat drop down handler', e.target.innerText);
    window.console.log('cat drop down handler', d.value);
  }

  render() {
    const { depColDropdown, dependentCol, depColCallback } = this.props;
    //window.console.log('dependentCol', dependentCol);
    return (
      <div>
        <p style={{color: 'white'}}>
          Dependent Column
        </p>
        <Form.Input
          id="dep_column_form_input_two"
          style={{
            width: '70%'
          }}
        >
          <Dropdown
            style={{
              backgroundColor: "white",
              paddingLeft: "12px"
            }}
            text={dependentCol ? dependentCol : "Select dependent column"}
            selection
            search
            onChange={depColCallback}
            options={depColDropdown}
          >
          </Dropdown>
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
