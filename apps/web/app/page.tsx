'use client';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type User = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function IndexPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setUsers(data);
  }

  async function handleAddUser() {
    if (!name || !email) return;
    setLoading(true);
    await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    setName('');
    setEmail('');
    await fetchUsers();
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className='flex flex-col p-4 border w-fit rounded-sm'>
        <h1 className='text-lg font-bold'>Usuários</h1>
        <div className='flex gap-4'>
          <input
            type='text'
            placeholder='Nome'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border p-2'
          />
          <input
            type='email'
            placeholder='E-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='border p-2'
          />
          <button className='bg-primary text-white px-4 rounded-sm' onClick={handleAddUser} disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} — {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
