import React, { useState, useEffect } from 'react';
import './UserSelector.css';

interface User {
  id: string;
  name: string;
  avatar?: string;
  isDefault?: boolean;
}

interface UserSelectorProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  className?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  currentUserId,
  onUserChange,
  className = ''
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // 初始化用户列表
  useEffect(() => {
    const savedUsers = localStorage.getItem('ai-career-buddy-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // 创建默认用户
      const defaultUsers: User[] = [
        {
          id: 'default-user',
          name: '测试用户',
          avatar: '👤',
          isDefault: true
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('ai-career-buddy-users', JSON.stringify(defaultUsers));
    }
  }, []);

  const currentUser = users.find(user => user.id === currentUserId) || users[0];

  const handleUserSelect = (userId: string) => {
    onUserChange(userId);
    setShowUserList(false);
  };

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: newUserName.trim(),
        avatar: '👤'
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('ai-career-buddy-users', JSON.stringify(updatedUsers));
      
      // 自动切换到新用户
      onUserChange(newUser.id);
      setNewUserName('');
      setShowCreateForm(false);
      setShowUserList(false);
    }
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (userId === 'default-user') {
      alert('默认用户不能删除');
      return;
    }

    if (confirm('确定要删除这个用户吗？删除后该用户的所有数据将无法恢复。')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('ai-career-buddy-users', JSON.stringify(updatedUsers));
      
      // 如果删除的是当前用户，切换到默认用户
      if (userId === currentUserId) {
        onUserChange('default-user');
      }
    }
  };

  return (
    <div className={`user-selector ${className}`}>
      <div 
        className="current-user"
        onClick={() => setShowUserList(!showUserList)}
      >
        <div className="user-avatar">
          {currentUser?.avatar || '👤'}
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser?.name || '未知用户'}</div>
          <div className="user-id">ID: {currentUser?.id || 'unknown'}</div>
        </div>
        <div className="dropdown-arrow">
          {showUserList ? '▲' : '▼'}
        </div>
      </div>

      {showUserList && (
        <div className="user-list">
          <div className="user-list-header">
            <span>选择用户</span>
            <button 
              className="create-user-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + 新建用户
            </button>
          </div>

          {showCreateForm && (
            <div className="create-user-form">
              <input
                type="text"
                placeholder="输入用户名"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateUser();
                  } else if (e.key === 'Escape') {
                    setShowCreateForm(false);
                    setNewUserName('');
                  }
                }}
                autoFocus
              />
              <div className="form-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleCreateUser}
                  disabled={!newUserName.trim()}
                >
                  创建
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewUserName('');
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="user-items">
            {users.map(user => (
              <div
                key={user.id}
                className={`user-item ${user.id === currentUserId ? 'active' : ''}`}
                onClick={() => handleUserSelect(user.id)}
              >
                <div className="user-avatar">
                  {user.avatar || '👤'}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.name}
                    {user.isDefault && <span className="default-badge">默认</span>}
                  </div>
                  <div className="user-id">ID: {user.id}</div>
                </div>
                {!user.isDefault && (
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteUser(user.id, e)}
                    title="删除用户"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
