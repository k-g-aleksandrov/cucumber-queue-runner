import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';

import TestCasesColumn from './TestCasesColumn';

import stringSimilarity from 'string-similarity';

import Diff from 'text-diff';

import './ScenarioPanel.css';

const propTypes = {
  scenario: PropTypes.any
};

class ScenarioPanel extends Component {

  constructor(props) {
    super(props);
  }

  getColor(value) {
    const hue = (value * 120).toString(10);

    return [ `hsl(${hue},100%,76%)` ].join('');
  }

  getDiffHtml(scName, tcName) {
    const diff = new Diff();
    const textDiff = diff.main(tcName, scName);

    diff.cleanupSemantic(textDiff);
    return diff.prettyHtml(textDiff);
  }

  removeTag(str, tag) {
    return str.replace(new RegExp(`<${tag}>(.*?)</${tag}>`, 'g'), '');
  }

  render() {
    const { scenario } = this.props;
    let row = null;
    let similarity = 1;
    let color = this.getColor(similarity);

    if (scenario.noTagsWarning) {
      color = 'lightgray';
    } else if (scenario.incorrectTags) {
      similarity = 0;
      color = this.getColor(similarity);
    } else if (scenario.testCases) {
      for (const testCase of scenario.testCases) {
        const currentSimilarity = stringSimilarity.compareTwoStrings(scenario.scenarioName, testCase.title);

        if (currentSimilarity < similarity) {
          similarity = currentSimilarity < similarity ? currentSimilarity : similarity;
          color = this.getColor(similarity);
          const html = this.getDiffHtml(scenario.scenarioName, testCase.title);

          scenario.scenarioNameDiff = this.removeTag(html, 'del');
          scenario.testCaseTitleDiff = this.removeTag(html, 'ins');
        }
      }
    }

    row = (
      <Row
        style={{
          padding: '8px',
          paddingLeft: '10px',
          borderTop: '1px solid #ccc',
          borderLeft: '1px solid #ccc',
          backgroundColor: color
        }}
      >
        <Col md={4} key='title'>
          {!scenario.scenarioNameDiff && <span>{scenario.scenarioName}</span>}
          {scenario.scenarioNameDiff && (
            <span>
              <span><b>Aut:&nbsp;</b></span><span dangerouslySetInnerHTML={{ __html: scenario.scenarioNameDiff }}/><br/>
              <span><b>TR:&nbsp;&nbsp;</b></span><span dangerouslySetInnerHTML={{ __html: scenario.testCaseTitleDiff }}/>
            </span>
          )}
          {
            scenario.filters.includes('disabled')
            && <span style={{ color: 'red', fontStyle: 'italic' }}><br/>[disabled]&nbsp;</span>
          }
        </Col>
        <TestCasesColumn scenario={scenario}/>
      </Row>
    );
    return row;
  }
}

ScenarioPanel.propTypes = propTypes;

export default ScenarioPanel;
