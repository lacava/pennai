import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Segment } from 'semantic-ui-react';

class CurrentlySelectedKeys extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

  }

  render() {
    const { selectionToDisplay, fieldType } = this.props;
    window.console.log('CurrentlySelectedKeys', selectionToDisplay);
    return (
      <div
      >
        <label>
          {fieldType ? fieldType + " selection:" : "Current selection:"}
          <Segment
            inverted
            compact
          >
            {selectionToDisplay && selectionToDisplay.length
              ? selectionToDisplay : 'n/a'}
          </Segment>
        </label>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { CurrentlySelectedKeys };
export default connect(mapStateToProps)(CurrentlySelectedKeys);
