import React from 'react';
import Screencast from './components/Screencast';
import Content from './Content'
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

export default function Application() {
    return (
        <div className="Application">
            <Screencast
                component={Content}
                initialCaptureOptions={{
                    maxFrameRate: 15,
                    maxWidth: 360,
                    maxHeight: 260,
                }}
            />
        </div>
    );
}
