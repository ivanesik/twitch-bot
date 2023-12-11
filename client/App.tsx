import {Component, ErrorBoundary} from 'solid-js';
import {Route, Routes} from '@solidjs/router';

import {pageUrls} from './constants/pageUrls';

import {WelcomePage} from './pages/Welcome/WelcomePage';
import {AuthorizePage} from './pages/Authorize/AuthorizePage';

import './App.css';

export const App: Component = () => {
    return (
        <ErrorBoundary
            fallback={err => (
                <div>
                    <h1>App is broken</h1>
                    <code>{JSON.stringify(err, null, 2)}</code>
                </div>
            )}
        >
            <Routes>
                <Route path={pageUrls.welcomePath} component={WelcomePage} />
                <Route
                    path={pageUrls.authorizePath}
                    component={AuthorizePage}
                />

                <Route path="*" element={<span>404</span>} />
            </Routes>
        </ErrorBoundary>
    );
};
