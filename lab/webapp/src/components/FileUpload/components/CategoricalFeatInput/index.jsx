import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';
import Papa from 'papaparse';

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

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

// className="file-upload-categorical-help-icon"
  render() {
    const { catDropdown, catFeatures, catFeatCallback, dropDwnCallback } = this.props;
    const options = [
      { key: 'angular', text: 'Angular', value: 'angular' },
      { key: 'css', text: 'CSS', value: 'css' },
      { key: 'design', text: 'Graphic Design', value: 'design' },
      { key: 'ember', text: 'Ember', value: 'ember' },
      { key: 'html', text: 'HTML', value: 'html' },
      { key: 'ia', text: 'Information Architecture', value: 'ia' },
      { key: 'javascript', text: 'Javascript', value: 'javascript' },
      { key: 'mech', text: 'Mechanical Engineering', value: 'mech' },
      { key: 'meteor', text: 'Meteor', value: 'meteor' },
      { key: 'node', text: 'NodeJS', value: 'node' },
      { key: 'plumbing', text: 'Plumbing', value: 'plumbing' },
      { key: 'python', text: 'Python', value: 'python' },
      { key: 'rails', text: 'Rails', value: 'rails' },
      { key: 'react', text: 'React', value: 'react' },
      { key: 'repair', text: 'Kitchen Repair', value: 'repair' },
      { key: 'ruby', text: 'Ruby', value: 'ruby' },
      { key: 'ui', text: 'UI Design', value: 'ui' },
      { key: 'ux', text: 'User Experience', value: 'ux' },
    ];
    return (
      <div>
        <Dropdown
          style={{
            width: '65%'
          }}
          placeholder="Select categorical features"
          search
          selection
          multiple
          options={catDropdown}
          onChange={dropDwnCallback}
        >
        </Dropdown>
        <textarea
          style={{
            width: '65%'
          }}
          id="categorical_features_text_area_input"
          label="Categorical Features"
          placeholder={"cat_feat_1, cat_feat_2"}
          value={catFeatures ? catFeatures : ""}
          onChange={catFeatCallback}
        />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { CategoricalFeatInput };
export default connect(mapStateToProps)(CategoricalFeatInput);
/*
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
      inverted
      size="large"
      color="orange"
      name="info circle"
    />
  }
/>
*/
