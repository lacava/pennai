import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';
import { Header, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';

class CategoricalFeatInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.catFeatHelpText = (<p>Categorical features have a discrete number of categories that do not have an intrinsic order.
    Some examples include sex ("male", "female") or eye color ("brown", "green", "blue"...).
    <br/><br/>
    Describe these features using a comma separated list of the field names:
    <i>sex, eye_color</i></p>);
  }

  render() {
    const { catDropdown, catFeatures, catFeatCallback, catSelectOptions } = this.props;
    let listToDisplay = catFeatures.split(",");
    return (
      <div>
        <div
          style={{
            marginTop: '10px',
            marginBottom: '10px',
            width: '65%'
          }}
        >
          {/*<Dropdown
            style={{
              width: '65%'
            }}
            text={ catFeatures !== "" ? catFeatures : "Select categorical features"}
            search
            selection
            multiple
            options={catDropdown}
            onClose={catFeatCallback}
            onChange={catFeatCallback}
          >
          </Dropdown>*/}
          {/*<p style={{color: 'white'}}>
            Categorical Features
            <Popup
              on="click"
              position="right center"
              header="Categorical Features Help"
              content={
                <div className="content">
                 {this.catFeatHelpText}
                </div>
              }
              trigger={
                <Icon
                  className="file-upload-categorical-help-icon-standalone"
                  inverted
                  size="large"
                  color="orange"
                  name="info circle"
                />
              }
            />
          </p>*/}
          <select
            name='plain_dropdown_category'
            multiple
            onChange={catFeatCallback}
          >
            <option value="" disabled>--Please select categorical features--</option>
            {catSelectOptions}
          </select>
        </div>
        <CurrentlySelectedKeys
          fieldType={"Categorical"}
          selectionToDisplay={catFeatures}
        />
      </div>

    );
  }
}

const mapStateToProps = (state) => ({});

export { CategoricalFeatInput };
export default connect(mapStateToProps)(CategoricalFeatInput);
