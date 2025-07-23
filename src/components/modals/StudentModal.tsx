import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { studentsService } from '../../services/students';
import toast from 'react-hot-toast';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: any; // For edit mode
  mode: 'create' | 'edit';
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  mode
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    isEmailVerified: true
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && student) {
      setFormData({
        username: student.username || '',
        email: student.email || '',
        password: '',
        phone: student.phone || '',
        isEmailVerified: student.isEmailVerified || false
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        isEmailVerified: true
      });
    }
    setErrors({});
  }, [mode, student, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await studentsService.createStudent({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined
        });
        toast.success('Student created successfully');
      } else {
        await studentsService.updateStudent(student.uuid, {
          username: formData.username,
          email: formData.email,
          phone: formData.phone || undefined,
          isEmailVerified: formData.isEmailVerified
        });
        toast.success('Student updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Student operation error:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${mode} student`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Student' : 'Edit Student'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Enter username"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isEmailVerified"
                id="isEmailVerified"
                checked={formData.isEmailVerified}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isEmailVerified" className="ml-2 block text-sm text-gray-700">
                Email Verified
              </label>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};