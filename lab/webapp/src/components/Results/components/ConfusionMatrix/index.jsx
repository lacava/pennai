/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import InvertedCard from '../../../InvertedCard';
import { Header, Image, Loader } from 'semantic-ui-react';

class ConfusionMatrix extends Component {
  constructor(props) {
    super(props);
    this.state = { image_url: null };
  }

  componentDidMount() {
    const { file } = this.props;

    if(file) {
      fetch(`/api/v1/files/${file._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }  
          return response.blob();
        })
        .then(blob => {
          this.setState({ 
            image_url: URL.createObjectURL(blob) 
          });
        });
    }
  }

  render() {
    const { file } = this.props;
    const { image_url } = this.state;

    if(!file) {
      return (
        <Header inverted size="tiny" content="Confusion matrix is not available." />
      );
    }

    if(!image_url) {
      return (
        <Loader active inverted inline="centered" content="Retrieving confusion matrix..." />
      );
    }

    return (
      <InvertedCard
        header="Confusion Matrix"
        content={<Image src={image_url} />}
      />
    );
  }
}

export default ConfusionMatrix;
