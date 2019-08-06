import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';
import Papa from 'papaparse';

class OrdinalFeatInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    Describe these features using a json map. The map key is the name of the field,
     and the map value is an ordered list of the values the field can take:
    <i>{"{\"rank\":[\"first\", \"second\", \"third\"], \"size\":[\"small\", \"medium\", \"large\"]}"}</i></p>);

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

// className="file-upload-categorical-help-icon"
  render() {
    const { ordDropdown, ordTextAreaVal, ordFeatCallback } = this.props;
    return (
      <div>
          <Dropdown
            style={{
              backgroundColor: "white",
              width: '100%'
            }}
            text="Select ordinal features"
            search
            multiple
            options={ordDropdown}
          >
          </Dropdown>
          <textarea
            className="file-upload-ordinal-text-area"
            id="ordinal_features_text_area_input"
            label="Ordinal Features"
            value={ordTextAreaVal}
            placeholder={"{\"ord_feat_1\": [\"SHORT\", \"TALL\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
            onChange={ordFeatCallback}
          />
          <Popup
            on="click"
            position="right center"
            header="Categorical Features Help"
            content={
              <div className="content">
               {this.ordFeatHelpText}
              </div>
            }
            trigger={
              <Icon
                inverted
                size="large"
                color="orange"
                name="info circle"
              />
            }
          />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { OrdinalFeatInput };
export default connect(mapStateToProps)(OrdinalFeatInput);
