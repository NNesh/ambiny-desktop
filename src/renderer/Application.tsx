import React from 'react';
import { IntlProvider } from 'react-intl';
import Screencast from './components/Screencast';
import Content from './Content';
import { parseLocale } from '@shared/helpers/locales';
import { en, ru } from '@shared/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Application.less';

const lang = parseLocale(navigator.language);

const messages = {
    en,
    ru,
};

export default function Application() {
    return (
        <div className="Application">
            <IntlProvider messages={messages[lang]} locale={lang} defaultLocale={lang}>
                <Screencast
                    render={Content}
                    initialCaptureOptions={{
                        maxFrameRate: 15,
                        maxWidth: 360,
                        maxHeight: 260,
                    }}
                />
            </IntlProvider>
        </div>
    );
}
