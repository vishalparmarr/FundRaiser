import React from 'react';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div className={isDanger ? 'countdown danger' : 'countdown'}>
      <p>{value}:<span>{type}</span></p>
    </div>
  );
};

export default DateTimeDisplay;