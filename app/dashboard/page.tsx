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

interface List {
    id: string;
    userID: string;
    name: string;
}

export default function DashboardPage() {
    const [lists, setLists] = useState<List[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [showInput, setShowInput] = useState(false); // 控制输入框的显示
    const [inputText, setInputText] = useState(''); // 输入框内容
    const [testout, setTestout] = useState(''); // 测试输出
    const [expandedListId, setExpandedListId] = useState<string | null>(null);
    const [items, setItems] = useState<Todo[]>([]);

    const getLists = async(): Promise<List[]> => {
        const data = [
            {id: '1', userID:"111", name:"hello",},
            {id: '2', userID:"111", name:"yuna",},

        ];
        try {
            const records = client.collection('list').getFullList();;
            return  (await records).map(record => ({
                id:  record.id as string,
                userID: record.text,
                name: record.name,
            }));;
        } catch (error) {
            console.error('获取列表失败:', error);
            return data;
        }
    };
    
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

    useEffect(() => {
        const loadLists = async () => {
            const respond = await getLists();
            setLists(respond);
        };
        loadLists();
    }, []);

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
    const handleListClick = async (list: List) => {
        if (expandedListId === list.id) {
            // 如果已经展开，折叠并清空 items
            setExpandedListId(null);
            setItems([]);
        } else {
            // 否则展开并获取关联 items
            try {
                const records = await client.collection('item').getFullList({
                    filter: `list ~ '${list.id}'`, // 使用 filter 获取关联的 items
                    $autoCancel: false, // 禁用自动取消
                });
                const data = records.map((record) => ({
                    id:  record.id as string,
                    text: record.text,
                    list: record.list,
                    done: record.done,
                }));
                console.log(records);
                setExpandedListId(list.id);
                setItems(data);
            } catch (error) {
                console.error('获取 items 失败:', error);
            }
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
            
            <ul>
                {
                lists.map(list => (
                        <li 
                            key = {list.id}
                            onClick={() => handleListClick(list)} // 点击列表触发展开/折叠
                            style={{
                            cursor: 'pointer',
                            padding: '10px',
                            color: 'black',
                            backgroundColor: expandedListId === list.id ? '#f0f0f0' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            marginBottom: '5px',
                        }}>
                            <span>
                                {list.name}
                            </span>
                            {expandedListId === list.id && (
                            <ul style={{ marginTop: '10px', paddingLeft: '20px' , background:'#C8CCD0'}}>
                                {items.map((item) => (
                                    <li key={item.id} style={{ marginBottom: '5px' }}>
                                        {item.text} {item.done ? '(Completed)' : '(Pending)'}
                                    </li>
                                ))}
                            </ul>
                        )}
                        </li>
                        )
                    )
                }
            </ul>
        </div>
    );
}
