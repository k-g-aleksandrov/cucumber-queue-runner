import React from 'react';
import PropTypes from 'prop-types';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import ReportStep from './ReportStep';

const propTypes = {
  report: PropTypes.any,
  sessionId: PropTypes.any
};

function Report(props) {
  if (!props.report) {
    return null;
  }

  const { report, sessionId } = props;

  console.log(`Report ${sessionId}`);

  return (
    <Row>
      <Col>
        {report.map((rep, i) => {
          let haveBackground = false;
          let scenarioElementsIndex = 0;

          if (rep.elements[0].type === 'background') {
            haveBackground = true;
            scenarioElementsIndex = 1;
          }

          return (
            <Grid fluid style={{ paddingTop: '4px', paddingBottom: '8px' }} key={i}
              onClick={(e) => e.stopPropagation()}
            >
              {rep.elements[scenarioElementsIndex].before
                && rep.elements[scenarioElementsIndex].before.map((before, j) => {
                  return (
                    <ReportStep key={j} type='before' step={before}
                      sessionId={sessionId}
                    />
                  );
                })
              }
              {haveBackground && rep.elements[0].steps.map((step, j) => {
                return (
                  <ReportStep key={j} type='step' step={step}
                    sessionId={sessionId}
                  />
                );
              })}
              {rep.elements[scenarioElementsIndex].steps.map((step, j) => {
                return (
                  <ReportStep key={j} type='step' step={step}
                    sessionId={sessionId}
                  />
                );
              })}
              {rep.elements[scenarioElementsIndex].after
                && rep.elements[scenarioElementsIndex].after.map((after, j) => {
                  return (
                    <ReportStep key={j} type='after' step={after}
                      sessionId={sessionId}
                    />
                  );
                })
              }
            </Grid>
          );
        })}
      </Col>
    </Row>
  );
}

Report.propTypes = propTypes;

export default Report;
