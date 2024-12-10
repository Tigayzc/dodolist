'use client';

import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';

const client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090')

interface Todo {
    id: string;
    text: string;
    list: any[];
    done: boolean;
}

export default function DashboardPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [showInput, setShowInput] = useState(false); // 控制输入框的显示
    const [inputText, setInputText] = useState(''); // 输入框内容
    
    const getTodos = async (): Promise<Todo[]> => {
        const data = [
            {id: '1', text:"hello", list:[], done: false},
            {id: '2', text:"yuna", list:[], done: false},

        ];
        try {
            const records = client.collection('item').getFullList();
            return (await records).map(record => ({
                id:  record.id as string,
                text: record.text,
                list: record.list,
                done: record.done,
            }));
        } catch(error){
            console.log("error");
            return data;
        }

    }

    useEffect(() => {
        const loadTodos = async () => {
            const data = await getTodos();
            setTodos(data);
        };
        loadTodos();
    }, [todos]);

    const handleAddTodo = async () => {
        // check if empty by remove space on both side of a string
        if (inputText.trim()) {
            try {
                // 调用 PocketBase 的 create 方法
                await client.collection('item').create({
                    text: inputText,
                    done: false,
                });
                setInputText(''); // 清空输入框
            } catch (error) {
                console.error(error);
            }
        setShowInput(false);
        };
    }
    const handleDelete = async (id: string) => {
        try { 
                await client.collection('item').delete(id);
            } catch (error) {
                console.error(error);
            }
    };

    const handleDone = async (id: string) => {
        try { 
                await client.collection('item').update(id,{done: true});
            } catch (error) {
                console.error(error);
            }
    };
         


    return (
        <div>
            <h1>TODO</h1>
            
            <button
                onClick={() => setShowInput(true)}
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Add Todo
            </button>
            
            {/* 弹出输入框 */}
            {showInput && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px',
                    }}
                >
                    <h2>Add New Todo</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddTodo();
                        }}
                        >
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter your todo"
                            style={{
                                width: '100%',
                                color: 'black',
                                padding: '10px',
                                margin: '10px 0',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >submit
                            </button>
                            <button
                                onClick={() => setShowInput(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                        
                        </div>
                    </form>
                </div>
            )}

            <ul>
                {
                    todos.map(todo => (
                        <li key = {todo.id}>
                            <span>
                                {todo.text} {todo.done ? " (Completed)" : " (Pending)"}
                            </span>
                            <button
                                onClick={() => handleDone(todo.id)} 
                                style={{
                                    margin: '20px',
                                    padding: '5px 10px',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✔️
                            </button>
                            <button
                                onClick={() => handleDelete(todo.id)} // 绑定删除事件
                                style={{
                                    margin: '20px',
                                    padding: '5px 10px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✖️
                            </button>
                        </li>
                    ))
                }
            </ul>
            
        </div>
    );
}
