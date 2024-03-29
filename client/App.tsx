import {Component, ErrorBoundary} from 'solid-js';
import {Route, Routes} from '@solidjs/router';

import {pageUrls} from './constants/pageUrls';

import {WelcomePage} from './pages/Welcome/WelcomePage';
import {AuthenticationPage} from './pages/Authentication/AuthorizePage';

import './App.css';

export const App: Component = () => {
    return (
        <ErrorBoundary
            fallback={(err: unknown) => (
                <div class="p-8">
                    <h1 class="text-4xl mb-4">App is broken</h1>
                    <code>
                        {err instanceof Error ? err.message : err?.toString?.()}
                    </code>
                </div>
            )}
        >
            <Routes>
                <Route path={pageUrls.welcomePath} component={WelcomePage} />
                <Route
                    path={pageUrls.authorizePath}
                    component={AuthenticationPage}
                />

                <Route path="*" element={<span>404</span>} />
            </Routes>
        </ErrorBoundary>
    );
};
