import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { supabase } from '../../lib/supabase'; // Update the import path as needed

const AdminProfile = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  // Lấy dữ liệu người dùng từ database "profiles"
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles') 
        .select('id, full_name, address, phoneNumber, role') // Các trường cần lấy từ database
        .neq('role', 'admin'); // Lấy tất cả người dùng "ngoại trừ admin"

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error.message);
    }
  };

  // Lấy dữ liệu của người dùng
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm gỡ cấm người dùng
  const handleUnban = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' }) // Cập nhật role của người dùng thành user
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('Success', 'User has been unbanned');
      fetchUsers(); // Lấy dữ liệu người dùng sau khi cập nhật 
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error unbanning user:', error);
    }
  };

  // Hàm chuyển hướng đến navigate của AdminEditUser
  const handleEdit = (user) => {
    navigation.navigate('AdminEditUser', { user }); // Chuyển hướng đến AdminEditUser và truyền dữ liệu user
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Danh sách khách hàng</Text>

      {/* Show ra toàn bộ danh sách của người dùng */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>Khách hàng: {item.full_name}</Text>
            <Text style={styles.userText}>Địa chỉ: {item.address}</Text>
            <Text style={styles.userText}>Sđt: {item.phoneNumber}</Text>
            <Text style={styles.userText}>Vai trò: {item.role || 'user'}</Text>
            {/* Chỉnh sửa nút bấm với Touchable*/}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            {/* Unban button (only visible for banned users) */}
            {item.role === 'banned' && (
              <TouchableOpacity
                style={[styles.editButton, styles.unbanButton]}
                onPress={() => handleUnban(item.id)}
              >
                <Text style={styles.editButtonText}>Unban</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        style={styles.userList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userList: {
    marginTop: 20,
    width: '100%',
  },
  userItem: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50', // Green color for edit button
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  unbanButton: {
    backgroundColor: '#FF6347', // Red color for unban button
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminProfile;
