import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import api from '../../services/api';

export const StudentsPageSimple: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching students...');
        setLoading(true);
        setError(null);
        
        const response = await api.get('/admin/students');
        console.log('Direct API Response:', response);
        console.log('Response Data:', response.data);
        
        if (response.data && response.data.success) {
          setStudents(response.data.data || []);
          console.log('Students set:', response.data.data);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  console.log('Render state:', { students, loading, error });

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-100 p-4 rounded-lg">
        <h3 className="font-bold text-blue-900">Simple Students Page Debug:</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Students Count: {students.length}</p>
        <p>Students: {JSON.stringify(students, null, 2)}</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management (Simple)</h1>
          <p className="text-gray-600">Direct API test version</p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-6 text-center">
          <p>Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-6 text-center bg-red-50">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Students List */}
      {!loading && !error && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Students List ({students.length} students)
            </h3>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">No students in the database yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UUID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.uuid || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.uuid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {student.username?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{student.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.isEmailVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};