'use client';

import { useState } from 'react';
import PocketBase from 'pocketbase';

// 初始化 PocketBase 客户端
const client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export default function MessagesPage() {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (message.trim()) {
            try {
                // 调用 PocketBase 的 create 方法
                await client.collection('message').create({
                    content: message,
                });
                setStatus('消息创建成功！');
                setMessage(''); // 清空输入框
            } catch (error) {
                setStatus('创建消息失败！');
                console.error(error);
            }
        } else {
            setStatus('请输入消息内容！');
        }
    };

    return (
        <div>
            <h1>创建消息</h1>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="输入消息"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">发送</button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
}
