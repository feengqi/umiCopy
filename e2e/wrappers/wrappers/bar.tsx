import React from 'react';

export default (props: React.PropsWithChildren<{}>) => {
  return (
    <div>
      <h1>bar</h1>
      {props.children}
    </div>
  );
};
