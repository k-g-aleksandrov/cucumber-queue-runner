import React from 'react';
import PropTypes from 'prop-types';

import base64 from 'base-64';

const propTypes = {
  embedding: PropTypes.any
};

function ReportAttachment(props) {
  const { embedding } = props;

  return (
    <div>
      <a href=''>{embedding.mime_type}</a>
      <pre>{base64.decode(embedding.data)}</pre>
    </div>
  );
}

ReportAttachment.propTypes = propTypes;

export default ReportAttachment;
