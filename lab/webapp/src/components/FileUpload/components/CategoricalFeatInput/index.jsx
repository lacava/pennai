import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';

class CategoricalFeatInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.dropDwnHandler = this.dropDwnHandler.bind(this);

    this.catFeatHelpText = (<p>Categorical features have a discrete number of categories that do not have an intrinsic order.
    Some examples include sex ("male", "female") or eye color ("brown", "green", "blue"...).
    <br/><br/>
    Describe these features using a comma separated list of the field names:
    <i>sex, eye_color</i></p>);
  }

  dropDwnHandler(e, d) {
    window.console.log('cat drop down handler', e.target.innerText);
    window.console.log('cat drop down handler', d.value);
  }

  render() {
    const { catDropdown, catFeatures, catFeatCallback, catDropdownTest } = this.props;
    let listToDisplay = catFeatures.split(",");
    return (
      <div>
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
        <select
          style={{
            width: '65%'
          }}
          name='plain_dropdown_category'
          multiple
          onChange={catFeatCallback}
        >
          <option value="" disabled>--Please select categorical features--</option>
          {catDropdownTest}
        </select>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { CategoricalFeatInput };
export default connect(mapStateToProps)(CategoricalFeatInput);
