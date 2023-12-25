import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const Options = () => {
    const [apiModel, setApiModel] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        (async () => {
            setApiModel((await chrome.storage.local.get('apiModel'))['apiModel'] || 'gpt-3.5-turbo');
            setApiKey((await chrome.storage.local.get('apiKey'))['apiKey'] || '');
        })();
    }, []);

    const saveConfig = async () => {
        await chrome.storage.local.set({apiModel});
        await chrome.storage.local.set({apiKey});
    };

    return (
            <div>
                <input
                        type={'password'}
                        value={apiKey}
                        placeholder={'OpenAI Key'}
                        onChange={(e) => setApiKey(e.target.value)}
                />
                <input
                        value={apiModel}
                        placeholder={'OpenAI Model'}
                        onChange={(e) => setApiModel(e.target.value)}
                />
                <button onClick={saveConfig}>Save</button>
            </div>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
        <React.StrictMode>
            <Options />
        </React.StrictMode>
);
