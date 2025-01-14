import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase'; // Update the import path as needed

const EditUserProfile = ({ route, navigation }) => {
  const { user } = route.params; // Lấy dữ liệu từ AdminProfile
  const [fullName, setFullName] = useState(user.full_name);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [address, setAddress] = useState(user.address);
  const [loading, setLoading] = useState(false);

  // Hàm kiểm tra các trường nhập liệu
  const validateInputs = () => {
    if (!fullName || !phoneNumber || !address) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }
    return true;
  };

  // Hàm cập nhật thông tin người dùng
  const handleUpdate = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phoneNumber, address })
        .eq('id', user.id); // Cập nhật thông tin theo id của người dùng
      if (error) throw error;

      Alert.alert('Success', 'User information updated successfully');
      navigation.goBack(); //  Chuyển hướng về AdminProfile sau khi cập nhật
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm cấm người dùng
  const handleBanUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' }) // Cập nhật role của người dùng thành banned
        .eq('id', user.id); // Cập nhật người dùng theo ID
      if (error) throw error;

      Alert.alert('Success', 'User has been banned');
      navigation.goBack(); // Chuyển hướng về AdminProfile sau khi cập nhật
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error banning user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.banButton]} onPress={handleBanUser}>
            <Text style={styles.buttonText}>Ban User</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  banButton: {
    backgroundColor: '#ff0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditUserProfile;