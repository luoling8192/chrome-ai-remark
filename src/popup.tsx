import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import example from './example.ts';

const Popup = () => {
    const apiURL: string = 'https://api.openai.com/v1/chat/completions';
    const systemPrompt: string = '现在有一些浏览器书签标题,请将它们缩短简化,不要有多余的信息,我会支付100美元作为报酬';

    const [apiModel, setApiModel] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        (async () => {
            setApiModel((await chrome.storage.local.get('apiModel'))['apiModel'] || 'gpt-3.5-turbo');
            setApiKey((await chrome.storage.local.get('apiKey'))['apiKey'] || '');
        })();
    }, []);

    const getBookmarks = async (id: string) => {
        const current = await chrome.bookmarks.getChildren(id);
        if (current.length === 0) return false;

        let ctitle: string[] = [];
        let cid: string[] = [];

        for (const children of current) {
            if (!(await getBookmarks(children.id))) {
                ctitle.push(children.title);
                cid.push(children.id);
            }
        }

        const ans = (await queryOpenAI(ctitle)).split('\n');

        for (const i in cid) {
            console.log(await chrome.bookmarks.update(cid[i], {title: ans[i]}));
        }

        return true;
    };

    const queryOpenAI = async (title: string[]): Promise<string> => {
        const user = example.map((elem) => elem[0]);
        const assistant = example.map((elem) => elem[1]);

        const res = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                messages: [
                    {role: 'system', content: systemPrompt},
                    {role: 'user', content: user.join('\n')},
                    {role: 'assistant', content: assistant.join('\n')},
                    {role: 'user', content: title.join('\n')},
                ],
                model: apiModel,
                temperature: 0.2,
            }),
        });

        return (await res.json())['choices'][0]['message']['content'];
    };

    return (
            <div>
                <button onClick={() => getBookmarks('1')}>Start</button>
            </div>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
        <React.StrictMode>
            <Popup />
        </React.StrictMode>
);
