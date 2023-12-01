// pages/index.tsx
import { useState, useEffect } from 'react';

const pageSize = 10;

interface User {
  originalData: User;
  id: string;
  name: string;
  email: string;
  role: string;
  isEditing: boolean;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('name');

  useEffect(() => {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then((response) => response.json())
      .then((data: User[]) => setUsers(data.map((user) => ({ ...user, isEditing: false }))))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const totalPages = Math.ceil(users.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visibleUsers = users.slice(startIndex, endIndex);

  const handleSearch = () => {
    const filteredUsers = users.filter((user) => {
      const searchTermLowerCase: string = searchTerm.toLowerCase();
      const columnValue = (user[searchColumn as keyof User] as string).toLowerCase();
      return columnValue.includes(searchTermLowerCase);
    });
  
    setCurrentPage(1);
    setUsers(filteredUsers);
  };
  

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchColumn('name');
    setCurrentPage(1);
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then((response) => response.json())
      .then((data: User[]) => setUsers(data.map((user) => ({ ...user, isEditing: false }))))
      .catch((error) => console.error('Error fetching data:', error));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSelectRow = (userId: string) => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedRows([]);
    } else {
      if (selectedRows.includes(userId)) {
        setSelectedRows(selectedRows.filter((id) => id !== userId));
      } else {
        setSelectedRows([...selectedRows, userId]);
      }
    }
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleEdit = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              isEditing: true,
              originalData: { ...user },
            }
          : user
      )
    );
  };

  const handleSave = () => {
    const updatedUsers = users.map((user) => ({
      ...user,
      isEditing: false,
    }));
    setUsers(updatedUsers);
  };

  const handleCancel = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId && user.isEditing
          ? { ...user, ...(user.originalData || user) }
          : user
      )
    );
  };
  

  const handleEditChange = (value: string, userId: string, property: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId && user.isEditing
          ? { ...user, [property]: value }
          : user
      )
    );
  };

  const handleDeleteSelected = () => {
    setUsers(users.filter((user) => !selectedRows.includes(user.id)));
    setSelectedRows([]);
    setSelectAll(false);
  };

  return (
    <div>
      <div className="relative mb-4">
        <select
          onChange={(e) => setSearchColumn(e.target.value)}
          className="border border-gray-300 p-2 rounded mr-2"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="role">Role</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded w-64 mr-2"
        />
        <button
          className="bg-blue-500 text-white px-2 py-1"
          onClick={handleSearch}
        >
          Search
        </button>
        {searchTerm && (
          <button
            className="bg-gray-400 text-white px-2 py-1"
            onClick={handleClearSearch}
          >
            Clear Search
          </button>
        )}
      </div>
      <table className="table-auto w-full border-collapse border border-gray-800 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-800 p-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={() => setSelectAll(!selectAll)}
              />
            </th>
            <th className="border border-gray-800 p-2">ID</th>
            <th className="border border-gray-800 p-2">Name</th>
            <th className="border border-gray-800 p-2">Email</th>
            <th className="border border-gray-800 p-2">Role</th>
            <th className="border border-gray-800 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleUsers.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-800 p-2">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleSelectRow(user.id)}
                />
              </td>
              <td className="border border-gray-800 p-2">{user.id}</td>
              <td className="border border-gray-800 p-2">
                {user.isEditing ? (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      handleEditChange(e.target.value, user.id, 'name')
                    }
                    className="border border-gray-300 p-1 rounded"
                  />
                ) : (
                  <div onClick={() => handleEdit(user.id)}>{user.name}</div>
                )}
              </td>
              <td className="border border-gray-800 p-2">
                {user.isEditing ? (
                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) =>
                      handleEditChange(e.target.value, user.id, 'email')
                    }
                    className="border border-gray-300 p-1 rounded"
                  />
                ) : (
                  <div onClick={() => handleEdit(user.id)}>{user.email}</div>
                )}
              </td>
              <td className="border border-gray-800 p-2">
                {user.isEditing ? (
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) =>
                      handleEditChange(e.target.value, user.id, 'role')
                    }
                    className="border border-gray-300 p-1 rounded"
                  />
                ) : (
                  <div onClick={() => handleEdit(user.id)}>{user.role}</div>
                )}
              </td>
              <td className="border border-gray-800 p-2">
                {user.isEditing ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                      onClick={() => handleSave()}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={() => handleCancel(user.id)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-2 py-1"
                    onClick={() => handleEdit(user.id)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="bg-red-500 text-white px-2 py-1 ml-2 rounded"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <button
            className="bg-blue-500 text-white px-2 py-1 mr-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous Page
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`bg-blue-500 text-white px-2 py-1 mr-2 ${
                currentPage === index + 1 ? 'bg-gray-800' : ''
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="bg-blue-500 text-white px-2 py-1"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next Page
          </button>
        </div>
        <div>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
        </div>
      </div>
      <button
        className="bg-red-500 text-white px-2 py-1 mt-4"
        onClick={() => handleDeleteSelected()}
      >
        Delete Selected
      </button>
    </div>
  );
}
