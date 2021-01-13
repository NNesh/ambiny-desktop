import React from 'react';
import RenderDOM from 'react-dom';
import Application from './Application';

window.onload = function() {
    const container = document.getElementById('root');
    RenderDOM.render(<Application/>, container);
};
