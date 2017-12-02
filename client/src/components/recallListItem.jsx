import React from 'react';
import RecallEntry from './recallEntry.jsx';

const recallListItem = props => (
  <div>
    <button type="button" className="btn btn-default" onClick={props.deleteItem.bind(null, props.i)}>
    <span className="glyphicon glyphicon-remove" />
  </button>
    <span className="list-item">{props.entry.name}</span>
    <div>
        {entry.recalls === '' ? <Recalls recall={false} /> : entry.recalls.map((rec, i) => <Recalls key={`recallListEntry${i}`} recall={rec} />)}
    </div>
  </div>
);

export default recallListItem;