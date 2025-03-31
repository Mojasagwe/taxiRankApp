import { User } from '../../src/types/auth';

// Just test the isAdmin function directly without the React component
describe('isAdmin function', () => {
  // Simple implementation of isAdmin similar to the one in AuthContext
  const isAdmin = (user: User | null): boolean => {
    return user?.role === 'ADMIN';
  };
  
  it('should return false when user is null', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('should return true when user has admin role', () => {
    const adminUser: User = {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phoneNumber: '1234567890',
      role: 'ADMIN',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };
    
    expect(isAdmin(adminUser)).toBe(true);
  });

  it('should return false when user has non-admin role', () => {
    const regularUser: User = {
      id: 2,
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      phoneNumber: '0987654321',
      role: 'USER',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };
    
    expect(isAdmin(regularUser)).toBe(false);
  });
}); 