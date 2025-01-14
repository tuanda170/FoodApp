import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library
import SearchBar from '../../components/SearchBar'; // Import the SearchBar component
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation

const AdminScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [newFood, setNewFood] = useState({ title: '', price: '', description: '', imageUrl: '' });
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Tạo state mới để lưu trữ query tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isAscending, setIsAscending] = useState(true);

  const navigation = useNavigation(); // Chuyển hướng sử dụng hook useNavigation

  // Lấy dữ liệu từ database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // đặt trạng thái loading
        setErrorMessage(null);
        const { data, error } = await supabase.from('food_items').select('*');

        if (error) {
          setErrorMessage(error.message);
        } else {
          console.log("Fetched Data:", data); // Log the fetched data
          setData(data);
          setFilteredData(data); // Set initial filtered data
        }
      } catch (err) {
        setErrorMessage('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc dữ liệu dựa trên query tìm kiếm
  useEffect(() => {
    const filtered = data.filter(item =>
      typeof item.title === 'string' && item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, data]);

  // Sort data by price
  const sortPrice = () => {
    const sortedData = [...filteredData].sort((a, b) => {
      if (isAscending) {
        return parseFloat(a.price) - parseFloat(b.price); // Ascending
      } else {
        return parseFloat(b.price) - parseFloat(a.price); // Descending
      }
    });
    setFilteredData(sortedData);
    setIsAscending(!isAscending); // Toggle sort order
  };

  const handleAddItem = async () => {
    try {
      // Ensure 'newFood' doesn't contain the 'id' field
      const { data: newItem, error } = await supabase
        .from('food_items')
        .insert([
          {
            title: newFood.title,
            price: newFood.price,
            description: newFood.description,
            imageUrl: newFood.imageUrl,
          },
        ])
        .select('*') // Optionally, select all fields to return the inserted item
        .single();

      if (error) {
        console.error('Error adding item:', error.message);
      } else if (newItem && newItem.id) {
        setData([...data, newItem]);
        setAddItemModalVisible(false);
        setNewFood({ title: '', price: '', description: '', imageUrl: '' }); // Reset form
        setConfirmationModalVisible(true); // Show confirmation modal
      } else {
        console.error('New item does not have an id');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedFood) return;

    try {
      // Update the item's status to "OUT OF ORDER" instead of deleting
      const { error } = await supabase
        .from('food_items')
        .update({ status: 'OUT OF ORDER' })  // Assuming you have a "status" column
        .eq('id', selectedFood.id);

      if (error) {
        console.error('Error updating item status:', error.message);
      } else {
        // Cập nhật trạng thái của item trong UI khi sản phẩm "OUT OF ORDER"
        setData(data.map(item =>
          item.id === selectedFood?.id ? { ...item, status: 'OUT OF ORDER' } : item
        ));
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedFood) return;

    try {
      const { error } = await supabase
        .from('food_items')
        .update({
          title: selectedFood.title,
          price: selectedFood.price,
          description: selectedFood.description,
          imageUrl: selectedFood.imageUrl,
        })
        .eq('id', selectedFood.id);

      if (error) {
        console.error('Error updating item:', error.message);
      } else {
        setData(data.map(item => (item.id === selectedFood.id ? selectedFood : item))); // Update item in UI
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };



  const handleLogout = () => {
    // Sign out using Supabase auth
    supabase.auth.signOut().then(() => {
      navigation.navigate('Auth'); // Navigate to the Auth screen (Login screen)
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };




  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        setSelectedFood(item);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>
          {item.status ? `Status: ${item.status}` : 'Status: Available'}
        </Text>
        <Text style={styles.price}>Price: ${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Admin Add New Item Button as small icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setAddItemModalVisible(true)}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Admin Add New Item Button as small icon */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setAddItemModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.titleText}>Manager - Admin</Text>

      {/* SearchBar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortPrice={sortPrice}
      />

      {/* FlatList rendering */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id ? item.id.toString() : `${item.title}-${item.price}`} // Fallback key if id is missing
        renderItem={renderItem}
      />

      {/* Add Item Modal */}
      <Modal visible={addItemModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={newFood.title}
              onChangeText={(text) => setNewFood({ ...newFood, title: text })}
              placeholder="Title"
            />
            <TextInput
              style={styles.input}
              value={newFood.price}
              onChangeText={(text) => setNewFood({ ...newFood, price: text })}
              placeholder="Price"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={newFood.description}
              onChangeText={(text) => setNewFood({ ...newFood, description: text })}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={newFood.imageUrl}
              onChangeText={(text) => setNewFood({ ...newFood, imageUrl: text })}
              placeholder="Image URL"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddItem}>
              <Text style={styles.buttonText}>Add Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setAddItemModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={confirmationModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Item added successfully!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setConfirmationModalVisible(false)}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={selectedFood?.title}
              onChangeText={(text) => setSelectedFood({ ...selectedFood, title: text })}
              placeholder="Title"
            />
            <TextInput
              style={styles.input}
              value={selectedFood?.price}
              onChangeText={(text) => setSelectedFood({ ...selectedFood, price: text })}
              placeholder="Price"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={selectedFood?.description}
              onChangeText={(text) => setSelectedFood({ ...selectedFood, description: text })}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={selectedFood?.imageUrl}
              onChangeText={(text) => setSelectedFood({ ...selectedFood, imageUrl: text })}
              placeholder="Image URL"
            />
            <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleDeleteItem}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Blue Button */}
      <TouchableOpacity
        style={styles.blueButton}
        onPress={() => navigation.navigate('AdminProfile')} // Navigate to AdminProfile
      >
        <Icon name="person" size={30} color="white" />

      </TouchableOpacity>

      {/* Nút thêm sản phẩm */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setAddItemModalVisible(true)}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Item Button as small icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setAddItemModalVisible(true)}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Track Sales (Analytics) Button as small icon */}
      <TouchableOpacity
        style={[styles.iconButton, { bottom: 80 }]} // Position it below the Add Item button
        onPress={() => navigation.navigate('TrackSale')} // Navigate to TrackSale screen
      >
        <Icon name="analytics" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Item Button (Unchanged) */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setAddItemModalVisible(true)}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Nút Logout với biểu tượng Button as Small Icon with Orange Circle */}
      <TouchableOpacity
        style={[styles.iconButton, {
          bottom: 750,
          left: 330,
          backgroundColor: 'white', // Set background color to orange
          borderRadius: 50, // Make it a circle
          padding: 10, // Add some padding around the icon
        }]}
        onPress={handleLogout} // Trigger logout on press
      >
        <Icon name="exit-to-app" size={30} color="black" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#888',
  },
  // Adjusted the position of the button
  iconButton: {
    backgroundColor: '#ff8c00', // Orange color for "Add Item"
    padding: 15,
    borderRadius: 30,
    position: 'absolute',
    bottom: 10, // Position it near the bottom-left
    left: 290, // Position it near the left edge
    zIndex: 10, // Ensure the button stays above other elements
    justifyContent: 'center',
    alignItems: 'center', // Center the icon inside the button
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#ff8c00',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  blueButton: {
    backgroundColor: '#0056b3', // Blue color for Admin Profile
    padding: 12,
    borderRadius: 50, // Circular button
    position: 'absolute',
    top: 30, // Position it at the top-right
    right: 300, // Position it near the right edge
    justifyContent: 'center',
    alignItems: 'center', // Center the icon inside the button
  },
  trackSaleButton: {
    backgroundColor: '#0056b3', // Blue color for Track Sale button
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default AdminScreen;

